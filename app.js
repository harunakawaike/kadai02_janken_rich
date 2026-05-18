$(function () {
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
        "プランク 30秒",
        "マウンテンクライマー 20回",
        "ジャンピングジャック 20回",
        "レッグレイズ 12回",
        "ランジ 左右10回",
        "バイシクルクランチ 20回",
        "ウォールシット 30秒",
        "ツイスト腹筋 20回",
        "ニートゥーチェスト 15回",
        "スクワットキープ 25秒"
    ];

    const loseMenus = [
        "バーピー 10回",
        "プッシュアップ 20回",
        "ジャンプスクワット 20回",
        "プランク 60秒",
        "マウンテンクライマー 40回",
        "ランジジャンプ 20回",
        "腹筋 30回",
        "レッグレイズ 25回",
        "ワイドプッシュアップ 15回",
        "ハイニー 45秒"
    ];

    let round = 1;
    let win = 0;
    let draw = 0;
    let lose = 0;
    let todayMenus = [];

    loadHistory();

    $(".janken-btn").on("click", function () {
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

        if (round <= 5) {
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

    function getWeightedCpuHand(playerHand) {
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
        ];

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
    }

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
    }

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
    }

    function addMenu(result, menu) {
        $(".no-menu").remove();

        const resultLabel = getResultLabel(result);

        $("#menu-list").append(`
            <div class="menu-item">
                <span class="menu-result result-${result}">${resultLabel}</span>
                <p class="menu-name">${menu}</p>
            </div>
        `);
    }

    function finishGame() {
        $(".janken-btn").prop("disabled", true);
        $("#reset-btn").removeClass("hidden");

        const summary = `終了！ 勝ち${win}回 / あいこ${draw}回 / 負け${lose}回`;
        $("#summary-text").text(summary);
        $("#menu-summary").removeClass("hidden");
        $("#result-test").text("5回戦終了！今日の筋トレメニューが決定しました");

        saveHistory();
    }

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

    function loadHistory() {
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

    function resetGame() {
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