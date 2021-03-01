import eel
import desktop
import search

app_name = "html"
end_point = "index.html"
size = (700, 600)

eel.init("web")


@ eel.expose
def kimetsu_search(word, output_file, add_flg):
    search.kimetsu_search(word, output_file, add_flg)


@ eel.expose
def item_master_list():
    result = search.item_master_list()
    return result


@ eel.expose
def order_list_calc(order_info):
    result = search.order_list_calc(order_info)
    return result


desktop.start(app_name, end_point, size)
# desktop.start(size=size,appName=app_name,endPoint=end_point)
