// splatoon3_web_app/static/js/script.js
document.addEventListener('DOMContentLoaded', () => {
    const subSelect = document.getElementById('sub-select');
    const specialSelect = document.getElementById('special-select');
    const weaponTypeSelect = document.getElementById('weapon-type-select');
    const drawButton = document.getElementById('draw-button');
    const weaponImage = document.getElementById('weapon-image');
    const resultText = document.getElementById('result-text');
    const remainingCountLabel = document.getElementById('remaining-count');
    const avoidRepeatCheckbox = document.getElementById('avoid-repeat-checkbox');
    const excludeWeaponTypesDiv = document.getElementById('exclude-weapon-types');
    const clearAllExcludeButton = document.getElementById('clear-all-exclude');
    const excludeWeaponInput = document.getElementById('exclude-weapon-input');
    const weaponNamesDatalist = document.getElementById('weapon-names-datalist');
    const addExcludeWeaponButton = document.getElementById('add-exclude-weapon-button');
    const excludedSpecificWeaponsList = document.getElementById('excluded-specific-weapons-list');
    const removeSelectedExcludeButton = document.getElementById('remove-selected-exclude-button');

    let usedWeapons = new Set(); // クライアント側で使用済みブキを管理
    let excludedSpecificWeapons = []; // 除外する特定のブキ名を管理
    let allWeaponNames = []; // 全ブキ名を保持 (datalist用)

    const allExclusionCheckboxes = excludeWeaponTypesDiv.querySelectorAll('input[type="checkbox"]');

    // 初期状態の画像設定
    weaponImage.src = '/static/weapon_images/default.png';
    weaponImage.classList.remove('hidden'); // 画像を表示状態にする

    // サーバーから全ブキ名を取得してdatalistに設定
    // ※今回は all_weapons.py を直接読み込む方法がないため、初回アクセス時に取得する形にする
    // 本来は、別のAPIエンドポイントで全ブキ名リストを返すのが望ましい。
    // 今回は all_weapons.py が直接フロントエンドからアクセスできないので、仮に直接ブキ名をここで定義するか、
    // バックエンドから `get_all_weapon_names` のようなAPIを用意する必要があります。
    // **暫定策:** app.py の index ルートで weapon_names を渡すか、
    // JavaScriptで静的に定義する
    // 例: allWeaponNames = ["スプラシューター", "ジェットスイーパー", ...];

    // **** 暫定策: バックエンドから全ブキ名を取得するAPIを呼び出す (推奨) ****
    // app.py に新しいAPIエンドポイントを追加する必要があります。
    // 例: @app.route('/api/all_weapon_names') return jsonify(all_weapons.weapon_names)
    // fetch('/api/all_weapon_names')
    //     .then(response => response.json())
    //     .then(data => {
    //         allWeaponNames = data;
    //         updateWeaponNamesDatalist();
    //     })
    //     .catch(error => console.error('Error fetching weapon names:', error));

    // **今回は、all_weapons.py をコピーしてフロントエンドのscript.jsで静的にブキ名を定義します。
    // これは簡易的な方法であり、ブキデータ更新時はここも更新が必要です。
    // all_weapons.py にある weapon_names をここに手動でコピーしてください。
    allWeaponNames = [
        "ボールドマーカー",
        "ボールドマーカーネオ",
        "わかばシューター",
        "もみじシューター",
        "シャープマーカー",
        "シャープマーカーネオ",
        "シャープマーカーGECK",
        "プロモデラーMG",
        "プロモデラーRG",
        "プロモデラー彩",
        "スプラシューター",
        "スプラシューターコラボ",
        "スプラシューター煌",
        ".52ガロン",
        ".52ガロンデコ",
        "N-ZAP85",
        "N-ZAP89",
        "プライムシューター",
        "プライムシューターコラボ",
        "プライムシューターFRZN",
        ".96ガロン",
        ".96ガロンデコ",
        ".96ガロン爪",
        "ジェットスイーパー",
        "ジェットスイーパーカスタム",
        "ジェットスイーパーCOBR",
        "スペースシューター",
        "スペースシューターコラボ",
        "L3リールガン",
        "L3リールガンD",
        "L3リールガン箔",
        "H3リールガン",
        "H3リールガンD",
        "H3リールガンSNAK",
        "ボトルガイザー",
        "ボトルガイザーフォイル",

        "カーボンローラー",
        "カーボンローラーデコ",
        "カーボンローラーANGL",
        "スプラローラー",
        "スプラローラーコラボ",
        "ダイナモローラー",
        "ダイナモローラーテスラ",
        "ダイナモローラー冥",
        "ヴァリアブルローラー",
        "ヴァリアブルローラーフォイル",
        "ワイドローラー",
        "ワイドローラーコラボ",
        "ワイドローラー惑",
        
        "スクイックリンα",
        "スクイックリンβ",
        "スプラチャージャー",
        "スプラチャージャーコラボ",
        "スプラチャージャーFRST",
        "スプラスコープ",
        "スプラスコープコラボ",
        "スプラスコープFRST",
        "リッター4K",
        "リッター4Kカスタム",
        "4Kスコープ",
        "4Kスコープカスタム",
        "14式竹筒銃・甲",
        "14式竹筒銃・乙",
        "ソイチューバー",
        "ソイチューバーカスタム",
        "R-PEN/5H",
        "R-PEN/5B",

        "バケットスロッシャー",
        "バケットスロッシャーデコ",
        "ヒッセン",
        "ヒッセンヒュー",
        "ヒッセンASH",
        "スクリュースロッシャー",
        "スクリュースロッシャーネオ",
        "オーバーフロッシャー",
        "オーバーフロッシャーデコ",
        "エクスプロッシャー",
        "エクスプロッシャーカスタム",
        "モップリン",
        "モップリンD",
        "モップリン角",

        "スプラスピナー",
        "スプラスピナーコラボ",
        "スプラスピナーPYTN",
        "バレルスピナー",
        "バレルスピナーデコ",
        "ハイドラント",
        "ハイドラントカスタム",
        "ハイドラント圧",
        "クーゲルシュライバー",
        "クーゲルシュライバーヒュー",
        "ノーチラス47",
        "ノーチラス79",
        "イグザミナー",
        "イグザミナーヒュー",

        "スパッタリー",
        "スパッタリーヒュー",
        "スパッタリーOWL",
        "スプラマニューバー",
        "スプラマニューバーコラボ",
        "スプラマニューバー耀",
        "ケルビン525",
        "ケルビン525デコ",
        "デュアルスイーパー",
        "デュアルスイーパーカスタム",
        "デュアルスイーパー蹄",
        "クアッドホッパーブラック",
        "クアッドホッパーホワイト",
        "ガエンFF",
        "ガエンFFカスタム",

        "パラシェルター",
        "パラシェルターソレーラ",
        "キャンピングシェルター",
        "キャンピングシェルターソレーラ",
        "キャンピングシェルターCREM",
        "スパイガジェット",
        "スパイガジェットソレーラ",
        "スパイガジェット繚",
        "24式張替傘・甲",
        "24式張替傘・乙",

        "ノヴァブラスター",
        "ノヴァブラスターネオ",
        "ホットブラスター",
        "ホットブラスターカスタム",
        "ホットブラスター艶",
        "ロングブラスター",
        "ロングブラスターカスタム",
        "クラッシュブラスター",
        "クラッシュブラスターネオ",
        "ラピッドブラスター",
        "ラピッドブラスターデコ",
        "Rブラスターエリート",
        "Rブラスターエリートデコ",
        "RブラスターエリートWNTR",
        "S-BLAST92",
        "S-BLAST91",

        "パブロ",
        "パブロヒュー",
        "ホクサイ",
        "ホクサイヒュー",
        "ホクサイ彗",
        "フィンセント",
        "フィンセントヒュー",
        "フィンセントBRNZ",

        "トライストリンガー",
        "トライストリンガーコラボ",
        "トライストリンガー燈",
        "LACT-450",
        "LACT-450デコ",
        "LACT-450MILK",
        "フルイドV",
        "フルイドVカスタム",

        "ジムワイパー",
        "ジムワイパーヒュー",
        "ジムワイパー封",
        "ドライブワイパー",
        "ドライブワイパーデコ",
        "ドライブワイパーRUST",
        "デンタルワイパーミント",
        "デンタルワイパースミ",
    ];
    updateWeaponNamesDatalist();
    // **** 暫定策ここまで ****

    function updateWeaponNamesDatalist() {
        weaponNamesDatalist.innerHTML = ''; // クリア
        allWeaponNames.forEach(name => {
            const option = document.createElement('option');
            option.value = name;
            weaponNamesDatalist.appendChild(option);
        });
    }

    // 条件変更時の処理
    const onConditionChange = async () => {
        usedWeapons.clear(); // 条件が変わったら使用済みブキをリセット
        await updateRemainingCount();
    };

    // 特定のブキ除外リストのUI更新
    const updateExcludedSpecificWeaponsList = () => {
        excludedSpecificWeaponsList.innerHTML = '';
        excludedSpecificWeapons.forEach(weapon => {
            const li = document.createElement('li');
            li.textContent = weapon;
            li.dataset.weaponName = weapon; // データ属性にブキ名を保存
            li.addEventListener('click', () => {
                li.classList.toggle('selected'); // 選択/非選択を切り替え
            });
            excludedSpecificWeaponsList.appendChild(li);
        });
        onConditionChange(); // リストが更新されたら、残りブキ数も更新
    };

    // 残りブキ数の更新
    const updateRemainingCount = async () => {
        const selectedSub = subSelect.value;
        const selectedSpecial = specialSelect.value;
        const selectedWeaponType = weaponTypeSelect.value;
        const excludedTypes = Array.from(allExclusionCheckboxes)
                                .filter(cb => cb.checked)
                                .map(cb => cb.value);
        const avoidRepeat = avoidRepeatCheckbox.checked;

        try {
            // 抽選せずに残りブキ数だけを取得するリクエスト
            const response = await fetch('/api/random_weapon', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    sub: selectedSub,
                    special: selectedSpecial,
                    weapon_type: selectedWeaponType,
                    excluded_types: excludedTypes,
                    excluded_specific_weapons: excludedSpecificWeapons, // 特定の除外ブキも送信
                    avoid_repeat: avoidRepeat,
                    used_weapons: avoidRepeat ? Array.from(usedWeapons) : [] // 重複なしの場合のみ送信
                }),
            });
            const data = await response.json();
            
            if (data.weapon_name === "そんなブキないよ！" || data.reset_needed) {
                remainingCountLabel.textContent = `条件に合うブキ数: 0`;
            } else if (avoidRepeat) {
                // Heroku上のバックエンドのremaining_countは既に次の抽選を見越しているのでそのまま表示
                remainingCountLabel.textContent = `残りブキ数: ${data.remaining_count}`;
            } else {
                remainingCountLabel.textContent = `条件に合うブキ数: ${data.remaining_count}`;
            }

        } catch (error) {
            console.error('Error updating remaining count:', error);
            remainingCountLabel.textContent = `条件に合うブキ数: エラー`;
        }
    };

    // 抽選ボタンクリック時の処理
    drawButton.addEventListener('click', async () => {
        const selectedSub = subSelect.value;
        const selectedSpecial = specialSelect.value;
        const selectedWeaponType = weaponTypeSelect.value;
        const excludedTypes = Array.from(allExclusionCheckboxes)
                                .filter(cb => cb.checked)
                                .map(cb => cb.value);
        const avoidRepeat = avoidRepeatCheckbox.checked;

        // アニメーションの開始
        let frame = 0;
        const totalFrames = 16;
        const frameDuration = 40; // 最初のフレームの速さ

        // コントロールを無効化
        disableControls();
        weaponImage.classList.remove('hidden'); // 画像を表示状態に

        const animateDraw = () => {
            if (frame < totalFrames) {
                // 仮の表示 (ランダムなブキ名を一時的に表示)
                const tempWeaponNames = ["スプラシューター", "ガロンデコ", "エクスプロッシャー", "プライムシューター"]; // 例
                resultText.textContent = `抽選中...`; // 仮のブキ名表示はしない (画像で代替)
                
                // 仮の画像表示
                const tempWeapon = tempWeaponNames[frame % tempWeaponNames.length];
                const tempImageFilename = tempWeapon.replace("/", "_") + ".png";
                weaponImage.src = `/static/weapon_images/${tempImageFilename}`;

                const currentDuration = frameDuration + Math.floor(frame * 8); // 減速効果
                frame++;
                setTimeout(animateDraw, currentDuration);
            } else {
                // 最終結果の取得
                fetch('/api/random_weapon', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        sub: selectedSub,
                        special: selectedSpecial,
                        weapon_type: selectedWeaponType,
                        excluded_types: excludedTypes,
                        excluded_specific_weapons: excludedSpecificWeapons,
                        avoid_repeat: avoidRepeat,
                        used_weapons: Array.from(usedWeapons)
                    }),
                })
                .then(response => response.json())
                .then(data => {
                    resultText.textContent = `Next: ${data.weapon_name}`;
                    weaponImage.src = data.image_url;
                    
                    if (avoidRepeat && data.weapon_name !== "そんなブキないよ！" && data.weapon_name !== "全部引いたからリセットして再抽選！") {
                        usedWeapons.add(data.weapon_name);
                    }

                    if (data.reset_needed) {
                        usedWeapons.clear(); // サーバーからリセット指示があった場合
                        resultText.textContent = "全部引いたからリセットして再抽選！";
                        // 1.5秒後に自動的に再抽選を試みる
                        setTimeout(() => {
                            drawButton.click(); // 自動的に再抽選をトリガー
                        }, 1500);
                    } else {
                         enableControls(); // 通常はここで有効化
                    }
                    
                    updateRemainingCount(); // 抽選後に残り数を更新
                })
                .catch(error => {
                    console.error('Error fetching random weapon:', error);
                    resultText.textContent = "抽選エラー";
                    weaponImage.src = '/static/weapon_images/そんなブキないよ！.png'; // エラー画像
                    remainingCountLabel.textContent = `条件に合うブキ数: エラー`;
                    enableControls(); // エラー時もコントロールを有効化
                });
            }
        };

        animateDraw(); // アニメーションを開始
    });

    // コントロール無効化/有効化関数
    function disableControls() {
        subSelect.disabled = true;
        specialSelect.disabled = true;
        weaponTypeSelect.disabled = true;
        drawButton.disabled = true;
        avoidRepeatCheckbox.disabled = true;
        allExclusionCheckboxes.forEach(cb => cb.disabled = true);
        clearAllExcludeButton.disabled = true;
        excludeWeaponInput.disabled = true;
        addExcludeWeaponButton.disabled = true;
        removeSelectedExcludeButton.disabled = true;
        excludedSpecificWeaponsList.style.pointerEvents = 'none'; // リスト選択を無効化
    }

    function enableControls() {
        subSelect.disabled = false;
        specialSelect.disabled = false;
        weaponTypeSelect.disabled = false;
        drawButton.disabled = false;
        avoidRepeatCheckbox.disabled = false;
        allExclusionCheckboxes.forEach(cb => cb.disabled = false);
        clearAllExcludeButton.disabled = false;
        excludeWeaponInput.disabled = false;
        addExcludeWeaponButton.disabled = false;
        removeSelectedExcludeButton.disabled = false;
        excludedSpecificWeaponsList.style.pointerEvents = 'auto'; // リスト選択を有効化
    }

    // 条件変更イベントリスナー
    subSelect.addEventListener('change', onConditionChange);
    specialSelect.addEventListener('change', onConditionChange);
    weaponTypeSelect.addEventListener('change', onConditionChange);
    avoidRepeatCheckbox.addEventListener('change', onConditionChange);

    allExclusionCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', onConditionChange);
    });

    clearAllExcludeButton.addEventListener('click', () => {
        allExclusionCheckboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
        onConditionChange(); // 全て解除後、条件変更をトリガー
    });

    // 特定のブキ除外機能のイベントリスナー
    addExcludeWeaponButton.addEventListener('click', () => {
        const weaponToAdd = excludeWeaponInput.value.trim();
        if (weaponToAdd && !excludedSpecificWeapons.includes(weaponToAdd) && allWeaponNames.includes(weaponToAdd)) {
            excludedSpecificWeapons.push(weaponToAdd);
            excludeWeaponInput.value = ''; // 入力欄をクリア
            updateExcludedSpecificWeaponsList();
        } else if (!allWeaponNames.includes(weaponToAdd) && weaponToAdd !== "") {
            alert("存在しないブキ名です。");
        }
    });

    removeSelectedExcludeButton.addEventListener('click', () => {
        const selectedItems = Array.from(excludedSpecificWeaponsList.children).filter(li => li.classList.contains('selected'));
        selectedItems.forEach(item => {
            const weaponName = item.dataset.weaponName;
            excludedSpecificWeapons = excludedSpecificWeapons.filter(w => w !== weaponName);
        });
        updateExcludedSpecificWeaponsList();
    });

    // 初期表示時に残りブキ数を更新
    onConditionChange();
});