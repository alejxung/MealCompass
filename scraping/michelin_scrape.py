from selenium import webdriver
import selenium.webdriver.support.ui as ui
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from bs4 import BeautifulSoup
import time
import re
import pandas as pd

datas = []
url = f'https://guide.michelin.com/kr/ko/selection/south-korea/restaurants/page/1'

driver = webdriver.Chrome()
driver.get(url)
soup = BeautifulSoup(driver.page_source, 'html.parser')
page_text = soup.find_all('a', {'class': 'btn btn-outline-secondary btn-sm'})
pages = int(str(page_text).split("page/")[-2].split("\"")[0])

for p in range(pages):
  url = f'https://guide.michelin.com/kr/ko/selection/south-korea/restaurants/page/{p + 1}'
  driver.get(url)
  time.sleep(5)
  if (p == 0):
    cookie = driver.find_element(By.CLASS_NAME, "js-cookie__popup_btn")
    cookie.click()
    time.sleep(1)
    driver.refresh()
  soup = BeautifulSoup(driver.page_source, 'html.parser')
  num_items = len(driver.find_elements(By.CLASS_NAME, "col-md-6"))

  for i in range(num_items):
    x = driver.find_element(By.XPATH, f'/html/body/main/section[1]/div[1]/div/div[2]/div[{i + 1}]')
    x.click()
    time.sleep(1)
    soup = BeautifulSoup(driver.page_source, 'html.parser')

    id = michelinType = soup.find_all('script', type='text/javascript')[8].text.split("restaurant_id'] = '")[1].split("'")[0]
    name = str(soup.find(class_="restaurant-details__heading--title")).split(">")[1].split("<")[0]
    category = str(soup.find(class_="restaurant-details__heading-price")).split("·")[1].split("<")[0].strip()
    phone = str(soup.select('a[href^="tel:"]')).split(":")[-1].split("\"")[0]
    address = str(soup.find(class_="restaurant-details__heading--address")).split(">")[1].split("<")[0]
    latitude = str(soup.find_all(class_="google-map__static")).split(",")[0].split("=")[-1]
    longitude = str(soup.find_all(class_="google-map__static")).split(",")[1].split("&")[0]
    services_exist = soup.find_all(class_="col-lg-6")
    services_check = [str(services_exist[0]).split("<li>")[1:] if services_exist else ""]
    services = []

    for s in range(len(services_check[0])):
      services.append(re.sub(r"[^ㄱ-ㅣ가-힣\s]", "", services_check[0][s]))
      services[s] = services[s].strip()    
    priceRange = str(soup.find(class_="restaurant-details__heading-price")).split("·")[0].split(">")[-1].strip()
    review = str(soup.find(class_="restaurant-details__description--text")).split(">")[2].split("<")[0]
    michelinType = soup.find_all('script', type='text/javascript')[8].text.split("distinction'] = '")[1].split("'")[0]

    data = {
      'id': id,
      'name': name,
      'category': category,
      'phone': phone,
      'address': address,
      'latitude': latitude,
      'longitude': longitude,
      # 'parking': '',
      'services': services,
      # 'businessHours': '',
      # 'dayOff': '',
      # 'menu': '',
      'priceRange': priceRange,
      'review': review,
      'michelinType': michelinType,
    }

    datas.append(data)
    driver.back()
    time.sleep(1.5)
    print(name) #
  print(f'{p+1}/{pages} done')

df = pd.DataFrame(datas)
df.to_csv('./scraping/data/michelin-new.csv', index=False)