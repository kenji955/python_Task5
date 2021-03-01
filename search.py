import pandas as pd
import eel


def kimetsu_search(word, output_file, add_flg):
    # 検索対象取得
    try:
        df = pd.read_csv(output_file)
        source = list(df["name"])
    except FileNotFoundError:
        df = pd.DataFrame(["name"])
        source = list([])

    # 検索
    if word in source:
        print("『{}』はあります".format(word))
        eel.view_log_js("『{}』はあります".format(word))
    else:
        print("『{}』はありません".format(word))
        eel.view_log_js("『{}』はありません".format(word))
        # 追加
        # add_flg = input("追加登録しますか？(0:しない 1:する)　＞＞　")
        if add_flg == "1":
            source.append(word)
            eel.view_log_js("『{}』を追加しました".format(word))

    # CSV書き込み
    df = pd.DataFrame(source, columns=["name"])
    df.to_csv(output_file, encoding="utf_8-sig")
    print(source)


def item_master_list():
    df_item = pd.read_csv('item_master.csv', dtype=str)
    item_code_list = df_item['商品コード'].tolist()
    item_name_list = df_item['商品名'].tolist()
    return [item_code_list, item_name_list]


def order_list_calc(order_info):
    df_item = pd.read_csv('item_master.csv', dtype=str)
    order_check_list = []
    total = 0

    # 次ポモドーロへのメモ
    # dfを商品コードで検索、行を特定
    # その行の情報を抽出して単一行のdfとする
    # そのdfを使って処理する
    # ここでやることをメモする
    # 受け取る配列は{商品コード、注文数}
    # ここから…商品コードをもとに商品名と価格を取得
    for order in order_info:
        order_item = df_item[df_item['商品コード'] == order['syohin_code']]
        subTotal = str(int(order_item.iat[0, 3]) * int(order['order_num']))
        order_check_list.append([order_item.iat[0, 2], order_item.iat[0, 3],
                                 order['order_num'], subTotal])
        total += int(subTotal)

    # for文で「'商品名'：　価格：　注文数：　小計：　\n」×データ分作成。一つの文字列にする
    # 各小計の合計を算出し、合計金額として一つの数値にする
    # 文字列と数値を返す

    return ([order_check_list, total])
