import json
import re
from html import unescape
import requests
          
dataset_id = "d_4a086da0a5553be1d89383cd90d07ecd"
url = "https://api-open.data.gov.sg/v1/public/api/datasets/" + dataset_id + "/poll-download"
        
print("🔄 Fetching download URL...")
response = requests.get(url)
json_data = response.json()
if json_data['code'] != 0:
    exit(1)

print("downloading hawker centre data :/")
url = json_data['data']['url']
response = requests.get(url)


try:
    data = json.loads(response.text)
    
except json.JSONDecodeError as e:
    print("This might be a different format (CSV, XML, etc.)")
    exit(1)

def process_hawker_data_fixed(response_text):
    try:
        data = json.loads(response_text)
    except json.JSONDecodeError as e:
        print(f"Error parsing JSON: {e}")
        return []
    
    hawker_centres = []
    
    if isinstance(data, dict):
        if 'features' in data:
            features = data['features']
        else:
            print("No 'features' key found in data")
            return []
    elif isinstance(data, list):
        features = data
    else:
        print(f"Unexpected data type: {type(data)}")
        return []
    
    
    for i, feature in enumerate(features):
        try:
            hawker_data = {}
            
            if isinstance(feature, str):
                print(f"Feature {i} is a string, trying to parse...")
                feature = json.loads(feature)
            
            if 'geometry' in feature and 'coordinates' in feature['geometry']:
                coords = feature['geometry']['coordinates']
                hawker_data['coordinates'] = {
                    'longitude': float(coords[0]),
                    'latitude': float(coords[1])
                }
        
            if 'properties' in feature:
                properties = feature['properties']
                
                description = properties.get('Description', '')
                table_data = extract_from_html_table(description)
                
                hawker_data['name'] = table_data.get('NAME', properties.get('Name', ''))
                hawker_data['image_url'] = table_data.get('PHOTOURL')
                hawker_data['address'] = table_data.get('ADDRESS_MYENV')
                hawker_data['postal_code'] = table_data.get('ADDRESSPOSTALCODE')
                hawker_data['status'] = table_data.get('STATUS')
                hawker_data['description'] = table_data.get('DESCRIPTION')
            
            
            if hawker_data.get('name') and hawker_data.get('coordinates'):
                hawker_centres.append(hawker_data)
            
        except Exception as e:
            print(f"Error processing feature {i}: {e}")
            continue
    
    return hawker_centres

def extract_from_html_table(html):
    if not html:
        return {}

    html = unescape(html)
    
    pattern = r'<th[^>]*>(.*?)</th>\s*<td[^>]*>(.*?)</td>'
    matches = re.findall(pattern, html, re.DOTALL)
    
    data = {}
    for header, value in matches:

        header = re.sub(r'<[^>]+>', '', header).strip()
        value = re.sub(r'<[^>]+>', '', value).strip()
        
        if value:  
            data[header] = value
    
    return data

hawker_centres = process_hawker_data_fixed(response.text)


print(f"processed {len(hawker_centres)} hawker centres")


if hawker_centres:
    with open('hawker_centres.json', 'w', encoding='utf-8') as f:
        json.dump(hawker_centres, f, indent=2, ensure_ascii=False)

    print(json.dumps(hawker_centres[0], indent=2))
else:
    print("failure to detect" )