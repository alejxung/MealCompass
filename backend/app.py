from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import json
import ast
from math import radians, cos, sin, sqrt, atan2

app = Flask(__name__)
CORS(app)

def load_data(file_path, file_type='csv'):
    if file_type == 'csv':
        return pd.read_csv(file_path, encoding='utf-8')
    elif file_type == 'json':
        return pd.read_json(file_path)
    else:
        raise ValueError("Unsupported file type. Use 'csv' or 'json'.")

def calculate_pagination_metadata(data_length, page, limit):
    total_elements = data_length
    total_pages = (total_elements + limit - 1) // limit
    current_page = page

    metadata = {
        'size': limit,
        'totalElements': total_elements,
        'totalPages': total_pages,
        'number': current_page
    }
    return metadata

def get_unique_values(df, column):
    unique_values = set()
    for item in df[column].dropna():
        try:
            parsed_list = ast.literal_eval(item)
            for sub_item in parsed_list:
                cleaned_item = sub_item.strip()
                if cleaned_item:
                    unique_values.add(cleaned_item)
        except (ValueError, SyntaxError):
            cleaned_item = item.strip()
            if cleaned_item:
                unique_values.add(cleaned_item)
    return sorted(unique_values)

def haversine(lat1, lon1, lat2, lon2):
    R = 6371.0  # Earth radius in kilometers
    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
    dlon = lon2 - lon1
    dlat = lat2 - lat1
    a = sin(dlat / 2)**2 + cos(lat1) * cos(lat2) * sin(dlon / 2)**2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))
    distance = R * c
    return distance

@app.route('/api/restaurants', methods=['GET'])
def get_restaurants():
    file_path = 'restaurants.csv'
    page = int(request.args.get('page', 1))
    limit = int(request.args.get('limit', 10))

    data = load_data(file_path)
    data_length = len(data)
    
    start = (page - 1) * limit
    end = start + limit
    
    data_slice = data.iloc[start:end].to_dict(orient='records')
    metadata = calculate_pagination_metadata(data_length, page, limit)

    response_data = {
        'page': metadata,
        'data': data_slice
    }

    return app.response_class(
        response=json.dumps(response_data, ensure_ascii=False),
        mimetype='application/json'
    )

@app.route('/api/restaurants/filters', methods=['GET'])
def get_filters():
    data = load_data('restaurants.csv')
    
    filters = {
        'category': get_unique_values(data, 'category'),
        'services': get_unique_values(data, 'services'),
        'parking': [p for p in sorted(data['parking'].dropna().unique().tolist()) if p.strip()],
        'price': [pr for pr in sorted(data['price'].dropna().unique().tolist()) if pr.strip()],
        'ribbonType': [rt for rt in sorted(data['ribbonType'].dropna().unique().tolist()) if rt.strip()],
        'michelinType': [mt for mt in sorted(data['michelinType'].dropna().unique().tolist()) if mt.strip()]
    }

    return jsonify(filters)

@app.route('/api/restaurants/search', methods=['GET'])
def search_restaurant():
    name = request.args.get('name', '').strip().lower()
    category = [cat.strip() for cat in request.args.get('category', '').split(',') if cat.strip()]
    services = [service.strip() for service in request.args.get('services', '').split(',') if service.strip()]
    parking = [p.strip().lower() for p in request.args.get('parking', '').split(',') if p.strip()]
    price = [pr.strip() for pr in request.args.get('price', '').split(',') if pr.strip()]
    ribbon_types = [ribbon.strip().lower() for ribbon in request.args.get('ribbonType', '').split(',') if ribbon.strip()]
    michelin_types = [michelin.strip().lower() for michelin in request.args.get('michelinType', '').split(',') if michelin.strip()]
    user_lat = float(request.args.get('latitude', '0'))
    user_lon = float(request.args.get('longitude', '0'))
    
    data = load_data('restaurants.csv')

    if name:
        data = data[data['name'].str.contains(name, case=False, na=False)]
    if category:
        data['category'] = data['category'].apply(lambda x: ast.literal_eval(x) if pd.notna(x) else [])
        category_filter = data['category'].apply(lambda x: any(cat in x for cat in category))
        data = data[category_filter]
    if services:
        data['services'] = data['services'].apply(lambda x: ast.literal_eval(x) if pd.notna(x) else [])
        services_filter = data['services'].apply(lambda x: any(serv in x for serv in services))
        data = data[services_filter]
    if parking:
        data = data[data['parking'].apply(lambda x: any(p in x.split(', ') for p in parking))]
    if price:
        data = data[data['price'].apply(lambda x: x in price)]
    if ribbon_types:
        ribbon_filter = data['ribbonType'].apply(lambda x: any(rt in x.lower() for rt in ribbon_types))
        data = data[ribbon_filter]
    if michelin_types:
        michelin_filter = data['michelinType'].apply(lambda x: any(mt in x.lower() for mt in michelin_types))
        data = data[michelin_filter]

    if user_lat and user_lon:
        data['distance'] = data.apply(lambda row: haversine(user_lat, user_lon, row['latitude'], row['longitude']), axis=1)
        data = data.sort_values('distance')

    result = data.to_dict(orient='records')

    return app.response_class(
        response=json.dumps(result, ensure_ascii=False),
        mimetype='application/json'
    )
    
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
