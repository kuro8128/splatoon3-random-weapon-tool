// splatoon3_web_app/static/js/script.js
document.addEventListener('DOMContentLoaded', () => {
    // UI要素の取得
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

    // メッセージモーダルの要素
    const messageModal = document.getElementById('message-modal');
    const messageText = document.getElementById('message-text');
    const closeModalButton = document.getElementById('close-modal-button');

    // アプリケーションの状態管理変数
    let usedWeapons = new Set(); // クライアント側で使用済みブキを管理 (重複なし用)
    let excludedSpecificWeapons = []; // 除外する特定のブキ名を管理
    
    // 全ブキ名を保持 (datalist用)。all_weapons.py から手動でコピー。
    // 本来はAPIで取得するのが望ましいが、今回は簡略化のためJS内に直接記述。
    const allWeaponNames = [
        "ボールドマーカー", "ボールドマーカーネオ", "わかばシューター", "もみじシューター",
        "シャープマーカー", "シャープマーカーネオ", "シャープマーカーGECK", "プロモデラーMG",
        "プロモデラーRG", "プロモデラー彩", "スプラシューター", "スプラシューターコラボ",
        "スプラシューター煌", ".52ガロン", ".52ガロンデコ", "N-ZAP85", "N-ZAP89",
        "プライムシューター", "プライムシューターコラボ", "プライムシューターFRZN", ".96ガロン",
        ".96ガロンデコ", ".96ガロン爪", "ジェットスイーパー", "ジェットスイーパーカスタム",
        "ジェットスイーパーCOBR", "スペースシューター", "スペースシューターコラボ", "L3リールガン",
        "L3リールガンD", "L3リールガン箔", "H3リールガン", "H3リールガンD", "H3リールガンSNAK",
        "ボトルガイザー", "ボトルガイザーフォイル", "カーボンローラー", "カーボンローラーデコ",
        "カーボンローラーANGL", "スプラローラー", "スプラローラーコラボ", "ダイナモローラー",
        "ダイナモローラーテスラ", "ダイナモローラー冥", "ヴァリアブルローラー", "ヴァリアブルローラーフォイル",
        "ワイドローラー", "ワイドローラーコラボ", "ワイドローラー惑", "スクイックリンα",
        "スクイックリンβ", "スプラチャージャー", "スプラチャージャーコラボ", "スプラチャージャーFRST",
        "スプラスコープ", "スプラスコープコラボ", "スプラスコープFRST", "リッター4K",
        "リッター4Kカスタム", "4Kスコープ", "4Kスコープカスタム", "14式竹筒銃・甲",
        "14式竹筒銃・乙", "ソイチューバー", "ソイチューバーカスタム", "R-PEN/5H",
        "R-PEN/5B", "バケットスロッシャー", "バケットスロッシャーデコ", "ヒッセン",
        "ヒッセンヒュー", "ヒッセンASH", "スクリュースロッシャー", "スクリュースロッシャーネオ",
        "オーバーフロッシャー", "オーバーフロッシャーデコ", "エクスプロッシャー", "エクスプロッシャーカスタム",
        "モップリン", "モップリンD", "モップリン角", "スプラスピナー",
        "スプラスピナーコラボ", "スプラスピナーPYTN", "バレルスピナー", "バレルスピナーデコ",
        "ハイドラント", "ハイドラントカスタム", "ハイドラント圧", "クーゲルシュライバー",
        "クーゲルシュライバーヒュー", "ノーチラス47", "ノーチラス79", "イグザミナー",
        "イグザミナーヒュー", "スパッタリー", "スパッタリーヒュー", "スパッタリーOWL",
        "スプラマニューバー", "スプラマニューバーコラボ", "スプラマニューバー耀", "ケルビン525",
        "ケルビン525デコ", "デュアルスイーパー", "デュアルスイーパーカスタム", "デュアルスイーパー蹄",
        "クアッドホッパーブラック", "クアッドホッパーホワイト", "ガエンFF", "ガエンFFカスタム",
        "パラシェルター", "パラシェルターソレーラ", "キャンピングシェルター", "キャンピングシェルターソレーラ",
        "キャンピングシェルターCREM", "スパイガジェット", "スパイガジェットソレーラ", "スパイガジェット繚",
        "24式張替傘・甲", "24式張替傘・乙", "ノヴァブラスター", "ノヴァブラスターネオ",
        "ホットブラスター", "ホットブラスターカスタム", "ホットブラスター艶", "ロングブラスター",
        "ロングブラスターカスタム", "クラッシュブラスター", "クラッシュブラスターネオ", "ラピッドブラスター",
        "ラピッドブラスターデコ", "Rブラスターエリート", "Rブラスターエリートデコ", "RブラスターエリートWNTR",
        "S-BLAST92", "S-BLAST91", "パブロ", "パブロヒュー",
        "ホクサイ", "ホクサイヒュー", "ホクサイ彗", "フィンセント",
        "フィンセントヒュー", "フィンセントBRNZ", "トライストリンガー", "トライストリンガーコラボ",
        "トライストリンガー燈", "LACT-450", "LACT-450デコ", "LACT-450MILK",
        "フルイドV", "フルイドVカスタム", "ジムワイパー", "ジムワイパーヒュー",
        "ジムワイパー封", "ドライブワイパー", "ドライブワイパーデコ", "ドライブワイパーRUST",
        "デンタルワイパーミント", "デンタルワイパースミ"
    ];
    
    const allExclusionCheckboxes = excludeWeaponTypesDiv.querySelectorAll('input[type="checkbox"]');

    // 初期表示設定
    weaponImage.src = '/static/weapon_images/default.png'; // 初期画像はdefault.png
    weaponImage.classList.remove('hidden'); // 画像を表示状態に

    // Datalistの初期化
    function updateWeaponNamesDatalist() {
        weaponNamesDatalist.innerHTML = '';
        allWeaponNames.forEach(name => {
            const option = document.createElement('option');
            option.value = name;
            weaponNamesDatalist.appendChild(option);
        });
    }

    // メッセージモーダルの表示
    function showMessage(message) {
        messageText.textContent = message;
        messageModal.style.display = 'flex'; // flexにして中央寄せを維持
    }

    // メッセージモーダルの非表示
    closeModalButton.addEventListener('click', () => {
        messageModal.style.display = 'none';
    });
    // モーダル外クリックで閉じる
    window.addEventListener('click', (event) => {
        if (event.target === messageModal) {
            messageModal.style.display = 'none';
        }
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

    // 条件変更時の処理: 使用済みブキをリセットし、残りブキ数を更新
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
            // カウントのみのリクエストとしてAPIを呼び出す
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
                    excluded_specific_weapons: excludedSpecificWeapons,
                    avoid_repeat: avoidRepeat,
                    used_weapons: avoidRepeat ? Array.from(usedWeapons) : [],
                    is_count_only_request: true // カウントのみのリクエストであることを明示
                }),
            });
            const data = await response.json();
            
            // 残りブキ数の表示を更新
            if (data.remaining_count === 0) {
                if (data.reset_needed) { // 「全部引いたからリセット」の場合
                    remainingCountLabel.textContent = `残りブキ数: 0 (リセットが必要)`;
                } else { // 「そんなブキないよ」の場合
                    remainingCountLabel.textContent = `条件に合うブキ数: 0`;
                }
            } else if (avoidRepeat) {
                remainingCountLabel.textContent = `残りブキ数: ${data.remaining_count}`;
            } else {
                remainingCountLabel.textContent = `条件に合うブキ数: ${data.remaining_count}`;
            }

        } catch (error) {
            console.error('Error updating remaining count:', error);
            remainingCountLabel.textContent = `条件に合うブキ数: エラー`;
        }
    };

    // 新しい抽選サイクルを開始する関数
    const startNewDrawCycle = async () => {
        const selectedSub = subSelect.value;
        const selectedSpecial = specialSelect.value;
        const selectedWeaponType = weaponTypeSelect.value;
        const excludedTypes = Array.from(allExclusionCheckboxes)
                                .filter(cb => cb.checked)
                                .map(cb => cb.value);
        const avoidRepeat = avoidRepeatCheckbox.checked;

        // コントロールを無効化
        disableControls();
        resultText.textContent = "抽選中...";
        weaponImage.src = '/static/weapon_images/default.png'; // 抽選中はdefault.pngを表示

        // 抽選の待機時間 (例: 1秒)
        const drawingDuration = 1000; 

        setTimeout(async () => {
            try {
                // 最終結果の取得 (is_count_only_request: false で実際の抽選)
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
                        excluded_specific_weapons: excludedSpecificWeapons,
                        avoid_repeat: avoidRepeat,
                        used_weapons: Array.from(usedWeapons),
                        is_count_only_request: false // 実際の抽選リクエストであることを明示
                    }),
                });
                const data = await response.json();
                
                resultText.textContent = `Next: ${data.weapon_name}`;
                weaponImage.src = data.image_url;
                
                if (avoidRepeat && data.weapon_name !== "そんなブキないよ！" && data.weapon_name !== "全部引いたからリセットして再抽選！") {
                    usedWeapons.add(data.weapon_name);
                }

                if (data.reset_needed) {
                    usedWeapons.clear(); // サーバーからリセット指示があった場合
                    showMessage("おや、全部引いたみたいだね！リセットして再抽選だ！");
                    // メッセージ表示後、自動的に再抽選をトリガー
                    setTimeout(() => {
                        startNewDrawCycle(); // 自動的に再抽選を開始
                    }, 1500); // 1.5秒後に再抽選を試みる
                } else {
                    enableControls(); // 通常はここで有効化
                }
                
                updateRemainingCount(); // 抽選後に残り数を更新 (is_count_only_request: true で呼ばれる)

            } catch (error) {
                console.error('Error fetching random weapon:', error);
                resultText.textContent = "抽選エラー";
                weaponImage.src = '/static/weapon_images/default.png'; // エラー時もdefault.png
                remainingCountLabel.textContent = `条件に合うブキ数: エラー`;
                enableControls(); // エラー時もコントロールを有効化
            }
        }, drawingDuration); // 指定された抽選待機時間後に結果を表示
    };

    // 抽選ボタンクリック時の処理
    drawButton.addEventListener('click', startNewDrawCycle); // 直接新しい抽選サイクルを開始

    // イベントリスナーの登録
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
        if (!weaponToAdd) {
            showMessage("ブキ名を入力してください。");
            return;
        }
        if (!allWeaponNames.includes(weaponToAdd)) {
            showMessage("存在しないブキ名です。");
            return;
        }
        if (excludedSpecificWeapons.includes(weaponToAdd)) {
            showMessage("そのブキは既に追加されています。");
            return;
        }
        
        excludedSpecificWeapons.push(weaponToAdd);
        excludeWeaponInput.value = ''; // 入力欄をクリア
        updateExcludedSpecificWeaponsList();
    });

    removeSelectedExcludeButton.addEventListener('click', () => {
        const selectedItems = Array.from(excludedSpecificWeaponsList.children).filter(li => li.classList.contains('selected'));
        if (selectedItems.length === 0) {
            showMessage("削除するブキを選択してください。");
            return;
        }
        // 選択されたアイテムを逆順に処理して、削除によるインデックスのずれを防ぐ
        selectedItems.forEach(item => {
            const weaponName = item.dataset.weaponName;
            excludedSpecificWeapons = excludedSpecificWeapons.filter(w => w !== weaponName);
        });
        updateExcludedSpecificWeaponsList();
    });

    // 初期表示時にdatalistと残りブキ数を更新
    updateWeaponNamesDatalist();
    onConditionChange();
});
