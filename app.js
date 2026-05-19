$(function () { // jQueryの書き方
    const hands = {
        rock: "✊",
        scissors: "✌️",
        paper: "✋"
    };

    const handNames = {
        rock: "グー",
        scissors: "チョキ",
        paper: "パー"
    };

    //筋トレメニュー
    const winMenus = [
        "プッシュアップ 10回",
        "スクワット 15回",
        "腹筋 15回",
        "背筋 15回",
        "カーフレイズ 20回",
        "ヒップリフト 15回",
        "膝つきプッシュアップ 12回",
        "ワイドスクワット 12回",
        "サイドランジ 左右10回",
        "ショルダータップ 20回"
    ];

    const drawMenus = [
        "プランク・サイドプランク 2分×3セット",
        "マウンテンクライマー 20回",
        "ジャンピングジャック 20回",
        "レッグレイズ 30回",
        "ランジ 左右30回",
        "バイシクルクランチ 20回",
        "ラットプルダウン 12回×3セット",
        "ツイスト腹筋 20回",
        "サイドレイズ 20回×3セット",
        "スクワットキープ 25秒"
    ];

    const loseMenus = [
        "バーピー 20回",
        "プッシュアップ 20回",
        "ジャンプスクワット 20回",
        "フルボトムスクワット 8回×3セット",
        "マウンテンクライマー 40回",
        "ランジジャンプ 20回",
        "腹筋 30回",
        "ブルガリアンスクワット 15回×2セット",
        "ワイドプッシュアップ 15回",
        "ハイニー 45秒"
    ];

    //ゲームの進行状況を保存
    let round = 1; //今何回戦か
    let win = 0; //勝った回数
    let draw = 0; //あいこの回数
    let lose = 0; //負けた回数
    let todayMenus = []; //今日でた筋トレメニュー

    loadHistory();

    $(".janken-btn").on("click", function () { //ボタンを押した時の処理
        if (round > 5) return;

        const playerHand = $(this).data("hand");
        const cpuHand = getWeightedCpuHand(playerHand);
        const result = judge(playerHand, cpuHand);
        const menu = getMenu(result);

        $("#player-hand").text(hands[playerHand]);
        $("#cpu-hand").text(hands[cpuHand]);

        updateScore(result);
        addMenu(result, menu);

        $("#result-test").text(
            `${handNames[playerHand]} vs ${handNames[cpuHand]}：${getResultText(result)}`
        );

        todayMenus.push({
            result: result,
            menu: menu
        });

        round++;

        if (round <= 5) { //5回終わったらゲーム終了
            $("#current-round").text(round);
        } else {
            finishGame();
        }
    });

    $("#reset-btn").on("click", function () {
        resetGame();
    });

    $("#clear-history-btn").on("click", function () {
        localStorage.removeItem("trainingJankenHistory");
        loadHistory();
    });

    function getWeightedCpuHand(playerHand) { //CPUの手をランダムに決める関数
        const cpuWinsAgainst = {
            rock: "paper",
            scissors: "rock",
            paper: "scissors"
        };

        const cpuLosesAgainst = {
            rock: "scissors",
            scissors: "paper",
            paper: "rock"
        };

        const choices = [
            cpuWinsAgainst[playerHand],
            cpuWinsAgainst[playerHand],
            cpuWinsAgainst[playerHand],
            cpuLosesAgainst[playerHand],
            playerHand
        ]; //プレイヤーが少し負けやすい

        return choices[Math.floor(Math.random() * choices.length)];
    }

    function judge(player, cpu) {
        if (player === cpu) return "draw";

        if (
            (player === "rock" && cpu === "scissors") ||
            (player === "scissors" && cpu === "paper") ||
            (player === "paper" && cpu === "rock")
        ) {
            return "win";
        }

        return "lose";
    } //じゃんけんの勝敗を判定

    function updateScore(result) {
        if (result === "win") {
            win++;
            $("#score-win").text(win);
        } else if (result === "draw") {
            draw++;
            $("#score-draw").text(draw);
        } else {
            lose++;
            $("#score-lose").text(lose);
        }
    } //勝ち・負け・あいこの回数を増やして、画面の数字も更新

    function getMenu(result) {
        let list;

        if (result === "win") {
            list = winMenus;
        } else if (result === "draw") {
            list = drawMenus;
        } else {
            list = loseMenus;
        }

        return list[Math.floor(Math.random() * list.length)];
    } //勝敗に応じて、使うメニューリストを変えている

    function addMenu(result, menu) {
        $(".no-menu").remove();

        const resultLabel = getResultLabel(result);

        $("#menu-list").append(`
            <div class="menu-item">
                <span class="menu-result result-${result}">${resultLabel}</span>
                <p class="menu-name">${menu}</p>
            </div>
        `);
    } //右側の「本日の筋トレメニュー」に、結果とメニューを追加していく

    function finishGame() {
        $(".janken-btn").prop("disabled", true);
        $("#reset-btn").removeClass("hidden");

        const summary = `終了！ 勝ち${win}回 / あいこ${draw}回 / 負け${lose}回`;
        $("#summary-text").text(summary);
        $("#menu-summary").removeClass("hidden");
        $("#result-test").text("5回戦終了！今日の筋トレメニューが決定しました");

        saveHistory();
    } //5回終わったらじゃんけんボタン押せなくなる
     //もう１度プレイのボタンを表示
     //結果まとめwp表示、履歴に保存

    function saveHistory() {
        const history = JSON.parse(localStorage.getItem("trainingJankenHistory")) || [];

        const now = new Date();
        const dateText = `${now.getFullYear()}/${now.getMonth() + 1}/${now.getDate()}`;

        history.unshift({
            date: dateText,
            menus: todayMenus
        });

        localStorage.setItem("trainingJankenHistory", JSON.stringify(history));
        loadHistory();
    }

    function loadHistory() { //保存されている履歴を左側の過去履歴に表示
        const history = JSON.parse(localStorage.getItem("trainingJankenHistory")) || [];

        $("#history-list").empty();

        if (history.length === 0) {
            $("#history-list").append(`<p class="no-history">履歴はまだありません</p>`);
            return;
        }

        history.forEach(function (item) {
            const menuText = item.menus
                .map(function (m) {
                    return `${getResultLabel(m.result)}：${m.menu}`;
                })
                .join("<br>");

            $("#history-list").append(`
                <div class="history-item">
                    <p class="history-date">${item.date}</p>
                    <p class="history-menu">${menuText}</p>
                </div>
            `);
        });
    }

    function resetGame() { //「もう１度プレイ」を押した時に、ゲームを初期状態に戻す
        round = 1;
        win = 0;
        draw = 0;
        lose = 0;
        todayMenus = [];

        $("#current-round").text(round);
        $("#score-win").text(0);
        $("#score-draw").text(0);
        $("#score-lose").text(0);
        $("#player-hand").text("✊");
        $("#cpu-hand").text("✊");
        $("#result-test").text("手を選んでスタート！");
        $("#menu-list").html(`<p class="no-menu">じゃんけんをするとメニューが決まります</p>`);
        $("#menu-summary").addClass("hidden");
        $("#reset-btn").addClass("hidden");
        $(".janken-btn").prop("disabled", false);
    }

    function getResultText(result) {
        if (result === "win") return "勝ち！軽めメニュー";
        if (result === "draw") return "あいこ！中くらいメニュー";
        return "負け！高負荷メニュー";
    }

    function getResultLabel(result) {
        if (result === "win") return "勝ち";
        if (result === "draw") return "あいこ";
        return "負け";
    }
});