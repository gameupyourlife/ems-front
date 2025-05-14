import requests
import json 
res = requests.get('https://localhost:7157/api/orgs')
response = json.loads(res.text)