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
    """
    data = request.json
    selected_sub = data.get('sub', '(ランダム)')
    selected_special = data.get('special', '(ランダム)')
    selected_weapon_type = data.get('weapon_type', '(ランダム)')
    excluded_types = data.get('excluded_types', [])
    excluded_specific_weapons = data.get('excluded_specific_weapons', [])
    avoid_repeat = data.get('avoid_repeat', False)
    used_weapons_client = data.get('used_weapons', []) # クライアント側から送信される使用済みブキリスト

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
    if avoid_repeat:
        # クライアント側から送られてきた使用済みブキを除外して、残っているブキを計算
        remaining_weapons = [w for w in filtered_weapons if w["ブキ名"] not in used_weapons_client]
        
        # 抽選可能なブキが残っていない場合の処理
        if not remaining_weapons:
            return jsonify({
                "weapon_name": "全部引いたからリセットして再抽選！",
                "image_url": "/static/weapon_images/default.png", # リセット時の画像はdefault.png
                "remaining_count": 0,
                "reset_needed": True # フロントエンドにリセットが必要であることを伝えるフラグ
            })
        selected_weapon = random.choice(remaining_weapons)
    else:
        # 重複ありの場合、フィルタリングされたブキの中からランダムに選択
        selected_weapon = random.choice(filtered_weapons)
    
    # 残りブキ数を計算
    if avoid_repeat:
        # 抽選されたブキがused_weapons_clientに追加された後の残り数を計算
        current_remaining_count = len([w for w in filtered_weapons if w["ブキ名"] not in (used_weapons_client + [selected_weapon["ブキ名"]])])
        remaining_count = current_remaining_count # これが次の抽選で選べるブキの数になる
    else:
        # 重複ありの場合、フィルターされたブキの総数
        remaining_count = len(filtered_weapons)

    weapon_name = selected_weapon["ブキ名"]
    
    # 画像ファイル名が '/' を含む場合に対応 (Tkinter版のreplaceロジックに合わせる)
    image_filename = weapon_name.replace("/", "_") + ".png"
    image_url = f"/static/weapon_images/{image_filename}"
    
    # 画像ファイルが存在しない場合のフォールバック（主にローカル開発用）
    if not os.path.exists(os.path.join(app.root_path, 'static', 'weapon_images', image_filename)):
        image_url = "/static/weapon_images/そんなブキないよ！.png" # デフォルトのNotFound画像など

    # 最終結果をJSONで返す
    return jsonify({
        "weapon_name": weapon_name,
        "image_url": image_url,
        "remaining_count": remaining_count,
        "reset_needed": False # 通常の抽選ではリセット不要
    })

# 静的ファイル（CSS, JS, 画像）を公開するためのルート
# Render は通常このルートを自動で処理するため必須ではないが、明示的に定義
@app.route('/static/<path:filename>')
def static_files(filename):
    return send_from_directory(os.path.join(app.root_path, 'static'), filename)

if __name__ == '__main__':
    # 開発サーバーの起動設定
    # Render やデプロイ環境では Gunicorn などが起動するため、このブロックは実行されない
    app.run(debug=True, host='0.0.0.0')
