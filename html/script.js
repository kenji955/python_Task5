// ツール実行時にファイルを読み込み、商品選択欄にファイルの内容を自動表示する関数
async function init(item_master_list) {
    // ページ読み込み時に実行したい処理
    // Python側の関数でCSVデータを取得して、戻り値として取得
    item_master_list = await eel.item_master_list()();
    item_code_list = item_master_list[0];
    item_name_list = item_master_list[1];

    makeTable(item_master_list, "table");

    // 取得した値をもとにfor文でセレクトメニューを作成。商品コードを入力ではなく選択式にする
    let syohin_code_input = document.getElementById("syohin_code_input");

    document.createElement("option");
    for (let i = 0; i < item_code_list.length; i++) {
        let option = document.createElement("option");
        option.setAttribute("value", item_code_list[i]);
        option.innerHTML = item_code_list[i] + ":" + item_name_list[i];
        syohin_code_input.appendChild(option);
    }
}

// 表の動的作成
function makeTable(item_master_list, tableId) {
    // 項目用要素作成
    item_code_list = item_master_list[0];
    item_name_list = item_master_list[1];

    // 表の作成開始
    let rows = [];
    let table = document.createElement("table");
    table.setAttribute("border", "1");
    let table_head = table.createTHead();
    let table_body = table.createTBody();

    // ヘッダー行作成
    rows.push(table_head.insertRow(-1)); // 行の追加
    header = ["商品コード", "注文数"];
    for (i = 0; i < header.length; i++) {
        th = document.createElement("th");
        th.innerHTML = header[i];
        rows[0].appendChild(th);
    }

    // 表に2次元配列の要素を格納
    for (i = 0; i < item_code_list.length; i++) {
        rows.push(table_body.insertRow(-1)); // 行の追加

        // 「商品コード+商品名」を表示するセルを作成
        cell = rows[i + 1].insertCell(-1);
        cell.appendChild(
            document.createTextNode(item_code_list[i] + ":" + item_name_list[i])
        );

        //
        cell2 = rows[i + 1].insertCell(-1);
        input_id = "item_order_" + i;
        input_element = document.createElement("input");
        input_element.setAttribute("placeholder", "半角数字で入力");
        input_element.setAttribute("type", "number");
        input_element.setAttribute("id", input_id);
        input_element.setAttribute("min", "0");
        input_element.onchange = order_check;
        cell2.appendChild(input_element);
    }
    // 指定したdiv要素に表を加える
    document.getElementById(tableId).appendChild(table);
}

// 注文内容作成
async function order_check() {
    // 大まかな処理の流れ
    // 入力内容をfor文で取得。配列に格納する。
    let loop_flug = 0;
    let i = 0;
    let order_list = [];
    while (loop_flug == 0) {
        // 注文画面の一覧から入力内容を取得
        let syohin_order_input = document.getElementById("item_order_" + i);
        // 商品コードと個数を取得して配列に格納する
        if (syohin_order_input == null) {
            loop_flug = 1;
        } else if (
            syohin_order_input.value == 0 ||
            syohin_order_input.value == null
        ) {
            i++;
            continue;
        } else {
            syohin_code = "00" + String(i + 1);
            order_num = syohin_order_input.value;
            order_list.push({ syohin_code, order_num });
            i++;
        }
    }
    let result = await eel.order_list_calc(order_list)();
    let result_list = result[0];
    let total_price = result[1];
    // alert(result[0][0]);
    // document.getElementById("order_result").innerHTML = result[0];
    // document.getElementById("order_total").innerHTML = result[1];

    // 表の作成開始
    let rows = [];
    let table = document.createElement("table");
    table.setAttribute("border", "1");
    let table_head = table.createTHead();
    let table_body = table.createTBody();
    let table_foot = table.createTFoot();

    // ヘッダー行作成
    rows.push(table_head.insertRow(-1)); // 行の追加
    header = ["商品名", "価格", "注文数", "小計"];
    for (i = 0; i < header.length; i++) {
        th = document.createElement("th");
        th.innerHTML = header[i];
        rows[0].appendChild(th);
    }

    // 表に2次元配列の要素を格納
    for (i = 0; i < result_list.length; i++) {
        rows.push(table_body.insertRow(-1)); // 行の追加
        for (j = 0; j < result_list[0].length; j++) {
            // 「商品コード+商品名」を表示するセルを作成
            cell = rows[i + 1].insertCell(-1);
            cell.appendChild(document.createTextNode(result_list[i][j]));
        }
    }

    // ヘッダー行作成
    rows.push(table_foot.insertRow(-1)); // 行の追加
    footer = ["", "", "合計", total_price];
    for (i = 0; i < footer.length; i++) {
        // cell = rows[result_list.length + 1].insertCell(-1);
        td = document.createElement("td");
        td.innerHTML = footer[i];
        if (i == footer.length - 1) {
            td.id = "total_price";
        } else if (i == footer.length - 2) {
            td.style.cssText = "font-weight: bold;";
        }
        rows[result_list.length + 1].appendChild(td);
    }

    // 指定したdiv要素に表を加える
    table_element = document.getElementById("order_table");
    // await table_element.removeChild(table_element.firstChild);
    while (table_element.firstChild) {
        table_element.removeChild(table_element.firstChild);
    }
    table_element.appendChild(table);

    // 配列をpythonに渡して、戻り値で合計金額と文字列をもらう

    // 配列に格納するのは個数が１以上の項目の「商品コード、価格、個数」。
    // 文字列と合計金額を生成して、
    // この処理はインプットの内容が変更されるごとに実行される。inputタグに仕込む
}

function order_calc() {
    let money_input = document.getElementById("money");
    let total_price = document.getElementById("total_price");
    let order_result = document.getElementById("order_result");
    let result_txet = "";
    try {
        if (total_price == null) {
            result_txet = "注文内容を入力してください。";
        } else if (total_price.innerHTML == 0 || total_price.innerHTML == undefined) {
            result_txet = "注文内容を入力してください。";
        } else if (money_input == null) {
            result_txet = "金額を入力してください。";
        } else if (money_input.value == null || money_input.value == '') {
            result_txet = "金額を入力してください。";
        } else {

            total_price_value = parseInt(total_price.innerHTML);
            money_input_value = parseInt(money_input.value);

            if (total_price_value > money_input_value) {
                result_txet =
                    "お預かり金額が不足しております。\n再度ご入力ください。";
            } else {
                calc = money_input_value - total_price_value;
                result_txet =
                    "お買い上げありがとうございます。\nおつりは" +
                    String(calc) +
                    "円となります。";
            }
        }
    } catch (err) {
        alert(err);
    }

    order_result.innerHTML = result_txet;
}
