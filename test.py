import requests

# URL for the POST request
url = "http://localhost:3000/packet"

# Sample JSON data to send
data = {
    "Voltage": 123,
    "Latitude": 48.1486,
    "Longitude": 17.1077,
}

# Making the POST request
response = requests.post(url, json=data)

# Print the response (status code and content)
print(f"Status Code: {response.status_code}")
print(f"Response Content: {response.text}")
