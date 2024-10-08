import requests
import os
# URL for the POST request
url = "http://localhost:3000/init"

# Sample JSON data to send
data = {
    "Voltage": 123,
    "Latitude": 48.1486,
    "Longitude": 17.1077,
}

data = {'e:\\Egithub\\peripherals_hangar\\general\\cam.py': {'VID_DIR': {'value': '"vids"', 'default': '"vids"', 'comment': ''
		}, 'BACKUP_COUNT': {'value': '8', 'default': '8', 'comment': ''
		}, 'MAX_FILE_SIZE': {'value': '1024 * 1024 * 200', 'default': '1024 * 1024 * 200', 'comment': ''
		}, 'FPS_IN': {'value': '5', 'default': '5', 'comment': ''
		}, 'FPS_OUT': {'value': '1', 'default': '1', 'comment': ''
		}
	}, 'e:\\Egithub\\peripherals_hangar\\general\\cam_lp.py': {'VID_DIR': {'value': '"vids"', 'default': '"vids"', 'comment': ''
		}, 'BACKUP_COUNT': {'value': '8', 'default': '8', 'comment': ''
		}, 'MAX_FILE_SIZE': {'value': '1024 * 1024 * 200', 'default': '1024 * 1024 * 200', 'comment': ''
		}, 'FPS_IN': {'value': '5', 'default': '5', 'comment': ''
		}
	}, 'e:\\Egithub\\peripherals_hangar\\general\\peripherals_main.py': {}, 'e:\\Egithub\\peripherals_hangar\\general\\sht.py': {'LOG_DIR': {'value': '"logs"', 'default': '"logs"', 'comment': ''
		}, 'BACKUP_COUNT': {'value': '5', 'default': '5', 'comment': 'Number of backup log files to keep'
		}, 'LOG_INTERVAL': {'value': '5', 'default': '5', 'comment': 'Time interval in seconds for log rotation in iterations'
		}, 'MEASUREMENT_INTERVAL': {'value': '30', 'default': '30', 'comment': 'time interval between measurements in seconds'
		}, 'TEMP_THRESHOLD_MAX': {'value': '30', 'default': '30', 'comment': ''
		}, 'TEMP_THRESHOLD_MIN': {'value': '25', 'default': '25', 'comment': ''
		}, 'PELTIER_PIN': {'value': '17', 'default': '17', 'comment': ''
		}, 'ADDRESS_30': {'value': '0x44', 'default': '0x44', 'comment': 'SHT30 sensor address (7-bit)'
		}, 'ADDRESS_25': {'value': '0x40', 'default': '0x40', 'comment': 'SHT25 address, 0x40(64) 0xF3(243)\tNO HOLD master'
		}
	}
}

print(__file__, __file__.split(os.sep)[-1].split(".")[0])
# Making the POST request
response = requests.post(url, json=data)


# Print the response (status code and content)
print(f"Status Code: {response.status_code}")
print(f"Response Content: {response.text}")
