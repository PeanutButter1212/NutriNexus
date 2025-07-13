import requests
import json
from bs4 import BeautifulSoup


dataset_id = "d_4a086da0a5553be1d89383cd90d07ecd"
url = "https://api-open.data.gov.sg/v1/public/api/datasets/" + dataset_id + "/poll-download"
        
response = requests.get(url)
json_data = response.json()
if json_data['code'] != 0:
    print(json_data['errMsg'])
    exit(1)

url = json_data['data']['url']
response = requests.get(url)

response_json  = response.json()

res = [] 

for hawker in response_json['features']: 
    html_description = hawker['properties']['Description']

    soup = BeautifulSoup(html_description, 'html.parser')

    rows = soup.find_all('tr')

    fields = {}

    for row in rows:
        th = row.find('th')
        td = row.find('td')
        if th and td:
            key = th.text.strip().lower()
            value = td.text.strip()
            fields[key] = value

    json_hawker_data = {
        "coordinates": {
            "longitude": hawker['geometry']['coordinates'][0],
            "latitude": hawker['geometry']['coordinates'][1]
        },
        "name": fields.get("name"),
        "image_url": fields.get("photourl"),
        "address": fields.get("address_myenv"),
        "postal_code": fields.get("addresspostalcode"),
        "status": fields.get("status"),
        "description": fields.get("description")
    }

    res.append(json_hawker_data)


with open("hawker_centre.json", "w") as outfile:
    json.dump(res, outfile, indent=2)