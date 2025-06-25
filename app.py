# splatoon3_web_app/app.py
from flask import Flask, render_template, jsonify, request, send_from_directory
import random
import os
import all_weapons

app = Flask(__name__)

# all_weapons.py からデータをインポート
weapons = all_weapons.weapons
sub_order = all_weapons.sub
special_order = all_weapons.special
weapon_type_order = all_weapons.weapon_type
weapon_names = all_weapons.weapon_names # all_weapons.py に weapon_names リストがあることを前提

# 前回抽選されたブキ名を保持するSet (サーバー側で重複なしを実現する場合)
# ただし、今回はクライアント側でused_weaponsを管理するので、サーバー側では限定的に使用
# 大規模なアプリケーションではセッションやデータベースで管理するが、今回はシンプルに
server_used_weapons = set()

@app.route('/')
def index():
    """
    トップページを表示する。
    サブ、スペシャル、ブキ種の選択肢をテンプレートに渡す。
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
    excluded_specific_weapons = data.get('excluded_specific_weapons', []) # 新たに追加された除外ブキ名
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

    # 重複なし設定の場合
    if avoid_repeat:
        # クライアント側から送られてきた使用済みブキを除外
        remaining_weapons = [w for w in filtered_weapons if w["ブキ名"] not in used_weapons_client]
        
        # 抽選可能なブキが残っているかチェック
        if not remaining_weapons:
            # 残りがない場合はリセットを促すメッセージとフラグを返す
            return jsonify({
                "weapon_name": "全部引いたからリセットして再抽選！",
                "image_url": "/static/weapon_images/そんなブキないよ！.png",
                "remaining_count": 0,
                "reset_needed": True
            })
        selected_weapon = random.choice(remaining_weapons)
    else:
        # 重複ありの場合、またはフィルタリングの結果ブキが一つも残っていない場合
        if not filtered_weapons:
            return jsonify({
                "weapon_name": "そんなブキないよ！",
                "image_url": "/static/weapon_images/そんなブキないよ！.png",
                "remaining_count": 0,
                "reset_needed": False
            })
        selected_weapon = random.choice(filtered_weapons)
    
    # 残りブキ数を計算
    # avoid_repeatの場合、次の抽選で選択される可能性のあるブキの数
    if avoid_repeat:
        # 現在抽選されたブキをused_weapons_clientに追加した状態で残り数を計算
        current_used_for_count = used_weapons_client + [selected_weapon["ブキ名"]]
        remaining_count = len([w for w in filtered_weapons if w["ブキ名"] not in current_used_for_count])
    else:
        remaining_count = len(filtered_weapons)

    weapon_name = selected_weapon["ブキ名"]
    
    # 画像ファイル名が '/' を含む場合に対応 (Tkinter版のreplaceロジックに合わせる)
    image_filename = weapon_name.replace("/", "_") + ".png"
    image_url = f"/static/weapon_images/{image_filename}"
    
    # 画像ファイルが存在しない場合のフォールバック（例: 開発環境でのパス確認）
    # デプロイ環境ではHerokuが静的ファイルを適切に提供するので、このチェックは主にローカル開発用
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
# Herokuでは不要な場合が多いが、ローカル開発で便利
@app.route('/static/<path:filename>')
def static_files(filename):
    return send_from_directory(os.path.join(app.root_path, 'static'), filename)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0') # host='0.0.0.0' で外部からのアクセスも受け付ける (開発環境のみ)