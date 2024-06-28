import requests
import pandas as pd

datas = []

PAGE_MAX_SIZE = 1000
TOTAL_PAGES = 16

for p in range(TOTAL_PAGES):
  url = f'https://bluer.co.kr/api/v1/restaurants?page={p}&size={PAGE_MAX_SIZE}'
  response = requests.get(url)
  chunk = response.json()['_embedded']['restaurants']

  for i in range(len(chunk)):
    data = {
      'id': chunk[i]['id'],
      'name': chunk[i]['headerInfo']['nameKR'],
      'category': chunk[i]['foodTypes'],
      'phone': chunk[i]['defaultInfo']['phone'],
      'address': chunk[i]['juso']['roadAddrPart1'],
      'latitude': chunk[i]['gps']['latitude'],
      'longitude': chunk[i]['gps']['longitude'],
      'parking': chunk[i]['statusInfo']['parking'],
      'businessHours': chunk[i]['statusInfo']['businessHours'],
      'dayOff': chunk[i]['defaultInfo']['dayOff'],
      'menu': chunk[i]['statusInfo']['menu'].strip(),
      'priceRange': chunk[i]['statusInfo']['priceRange'],
      'review': chunk[i]['review']['review'].strip(),
      'ribbonType': chunk[i]['headerInfo']['ribbonType'],
    }
    datas.append(data)
  print(f'{p+1}/{TOTAL_PAGES} done')

df = pd.DataFrame(datas)
df.to_csv('./scraping/data/bluer.csv', index=False)