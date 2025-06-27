# splatoon3_web_app/app.py
from flask import Flask, render_template, jsonify, request, send_from_directory
import random
import os
import all_weapons # all_weapons.py からデータをインポート

app = Flask(__name__)

# all_weapons.py からブキデータと関連リストをインポート
weapons = all_weapons.weapons
sub_order = all_weapons.sub
special_order = all_weapons.special
weapon_type_order = all_weapons.weapon_type
weapon_names = all_weapons.weapon_names # all_weapons.py に weapon_names リストがあることを前提

@app.route('/')
def index():
    """
    トップページを表示する。
    サブ、スペシャル、ブキ種の選択肢、全ブキ種名をテンプレートに渡す。
    """
    return render_template('index.html',
                           sub_options=["(ランダム)"] + sub_order,
                           special_options=["(ランダム)"] + special_order,
                           weapon_type_options=["(ランダム)"] + weapon_type_order,
                           all_weapon_types=weapon_type_order)

@app.route('/api/random_weapon', methods=['POST'])
def get_random_weapon():
    """
    ブキのランダム抽選を行うAPIエンドポイント。
    フロントエンドから送信された条件に基づいてブキを抽選し、結果をJSONで返す。
    is_count_only_request: True の場合、抽選は行わず残りブキ数のみを返す。
    """
    data = request.json
    selected_sub = data.get('sub', '(ランダム)')
    selected_special = data.get('special', '(ランダム)')
    selected_weapon_type = data.get('weapon_type', '(ランダム)')
    excluded_types = data.get('excluded_types', [])
    excluded_specific_weapons = data.get('excluded_specific_weapons', [])
    avoid_repeat = data.get('avoid_repeat', False)
    used_weapons_client = data.get('used_weapons', []) # クライアント側から送信される使用済みブキリスト
    is_count_only_request = data.get('is_count_only_request', False) # カウントのみのリクエストかどうかのフラグ

    # 抽選対象となるブキをフィルタリング
    filtered_weapons = weapons
    if selected_sub != "(ランダム)":
        filtered_weapons = [w for w in filtered_weapons if w["サブ"] == selected_sub]
    if selected_special != "(ランダム)":
        filtered_weapons = [w for w in filtered_weapons if w["スペシャル"] == selected_special]
    if selected_weapon_type != "(ランダム)":
        filtered_weapons = [w for w in filtered_weapons if w["ブキ種"] == selected_weapon_type]
    
    # ブキ種による除外
    filtered_weapons = [w for w in filtered_weapons if w["ブキ種"] not in excluded_types]

    # 特定のブキによる除外
    filtered_weapons = [w for w in filtered_weapons if w["ブキ名"] not in excluded_specific_weapons]
    
    # フィルタリングの結果ブキが一つも残っていない場合の処理
    if not filtered_weapons:
        return jsonify({
            "weapon_name": "そんなブキないよ！",
            "image_url": "/static/weapon_images/そんなブキないよ！.png",
            "remaining_count": 0,
            "reset_needed": False
        })

    # 重複なし設定の場合の処理
    selected_weapon = None
    if avoid_repeat:
        # クライアント側から送られてきた使用済みブキを除外して、残っているブキを計算
        remaining_weapons_for_draw = [w for w in filtered_weapons if w["ブキ名"] not in used_weapons_client]
        
        # 抽選可能なブキが残っていない場合の処理
        if not remaining_weapons_for_draw:
            # カウントのみのリクエストの場合は、ここでリセットの必要はない (0を返す)
            if is_count_only_request:
                return jsonify({
                    "weapon_name": "もうブキ残ってないよ！", # このメッセージは表示しないが、返す
                    "image_url": "/static/weapon_images/default.png",
                    "remaining_count": 0,
                    "reset_needed": True # カウントだけでもリセットが必要であることを伝える
                })
            else:
                # 実際の抽選リクエストで残りがない場合
                return jsonify({
                    "weapon_name": "もうブキ残ってないよ！",
                    "image_url": "/static/weapon_images/default.png", # リセット時の画像はdefault.png
                    "remaining_count": 0,
                    "reset_needed": True # フロントエンドにリセットが必要であることを伝えるフラグ
                })
        
        # 実際の抽選リクエストの場合のみ、ブキを選択
        if not is_count_only_request:
            selected_weapon = random.choice(remaining_weapons_for_draw)
        # カウントのみの場合はselected_weaponはNoneのまま

    else: # 重複ありの場合
        # 実際の抽選リクエストの場合のみ、ブキを選択
        if not is_count_only_request:
            selected_weapon = random.choice(filtered_weapons)
        # カウントのみの場合はselected_weaponはNoneのまま
    
    # 残りブキ数を計算
    remaining_count = 0
    if avoid_repeat:
        # avoid_repeat が True の場合:
        #   - is_count_only_request が True (残りブキ数表示のため) の場合:
        #     現在フィルターされているが、まだ使われていないブキの数
        #   - is_count_only_request が False (実際の抽選後) の場合:
        #     現在フィルターされていて、かつ used_weapons_client と今回選ばれたブキ以外で残っているブキの数
        if is_count_only_request:
            remaining_count = len([w for w in filtered_weapons if w["ブキ名"] not in used_weapons_client])
        else:
            # 抽選されたブキがused_weapons_clientに追加された後の残り数を計算
            current_used_for_count = used_weapons_client + [selected_weapon["ブキ名"]]
            remaining_count = len([w for w in filtered_weapons if w["ブキ名"] not in current_used_for_count])
    else:
        # 重複ありの場合、フィルターされたブキの総数
        remaining_count = len(filtered_weapons)

    # is_count_only_request が True の場合、ブキ名と画像URLは返さない（表示には使わないため）
    if is_count_only_request:
        return jsonify({
            "weapon_name": None, # ブキ名は返さない
            "image_url": None,   # 画像URLは返さない
            "remaining_count": remaining_count,
            "reset_needed": False
        })
    
    # 実際の抽選結果を返す
    weapon_name = selected_weapon["ブキ名"]
    
    # 画像ファイル名が '/' を含む場合に対応
    image_filename = weapon_name.replace("/", "_") + ".png"
    image_url = f"/static/weapon_images/{image_filename}"
    
    # 画像ファイルが存在しない場合のフォールバック
    if not os.path.exists(os.path.join(app.root_path, 'static', 'weapon_images', image_filename)):
        image_url = "/static/weapon_images/そんなブキないよ！.png"

    # 最終結果をJSONで返す
    return jsonify({
        "weapon_name": weapon_name,
        "image_url": image_url,
        "remaining_count": remaining_count,
        "reset_needed": False # 通常の抽選ではリセット不要
    })

# 静的ファイル（CSS, JS, 画像）を公開するためのルート
@app.route('/static/<path:filename>')
def static_files(filename):
    return send_from_directory(os.path.join(app.root_path, 'static'), filename)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
