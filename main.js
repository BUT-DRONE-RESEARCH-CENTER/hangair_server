const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');
const axios = require('axios');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

var pos_history = [];
var last_packet = {};
var hangair_ip = "";
var s_vars = {};

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post("/packet", (req, res) => {
	hangair_ip = req.ip;
	console.log("Hangair IP:", hangair_ip);
	// Handle incoming packets from hangair
	let packet = req.body;
	packet["timestamp"] = + new Date();
	packet["ip"] = hangair_ip;
	
	pos_history.push({"Latitude": packet["Latitude"], "Longitude": packet["Longitude"], "timestamp": packet["timestamp"]});
	
	io.emit("packet", packet);
	last_packet = packet;
	res.send("ok");
});

app.post("/init", (req, res) => {
	hangair_ip = req.ip;
	s_vars = req.body;
	io.emit("s_vars", s_vars);
	res.status(200).send("ok");
});

// Socket.io connection event
io.on('connection', (socket) => {
	console.log('A client connected');
	socket.emit("packet", last_packet);
	socket.emit("s_vars", s_vars);
	// Handle socket events here

	// Socket.io disconnection event
	socket.on('disconnect', () => {
		console.log('A client disconnected');
	});

	socket.on("command", (command) => {
		console.log("Command received:", command, typeof command);
		if (!["temperature", "door"].includes(command["command"])) {
			console.log("Invalid command");
			socket.emit("error", "Invalid command");
			return;
		}
		if (hangair_ip == "") {
			console.log("Hangair IP not known");
			socket.emit("error", "Hangair IP not known");
			return;
		}
		axios.post(`${hangair_ip}/${command["command"]}`, command).then((response) => {
			console.log("Command sent");
			socket.emit("error", `Command sent: ${command["command"]}`);
		}).catch((error) => {
			console.error("Error sending command:", error);
			socket.emit("error", `Error sending command (${error.code})`);
		});
	});

	socket.on("s_var_push", (data) => {
		// bez bodky
		let addresses = []
		Object.keys(data).forEach(script_path => {
			addresses.push(`${hangair_ip}:8080/${script_path.split(".")[0]}`)
		})
		console.log(addresses)
		sendRequests(addresses, data, socket);
	});
});

// Start the server
const port = 3000;
server.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});

async function fetchDroneVideo() {
	try {
		const response = await axios({
			method: 'get',
			url: `${hangair_ip}/drone_video`,
			responseType: 'stream'
		});

		response.data.on('data', (chunk) => {
			io.emit('drone_video', chunk.toString('base64'));
		});

		response.data.on('end', () => {
			console.log('Stream ended');
		});
	} catch (error) {
		//console.error('Error fetching video stream:', error, "Waiting for 10 seconds before retrying...");
		setTimeout(fetchDroneVideo, 10000);
	}
}
fetchDroneVideo();

async function fetchHangairVideos() {
	try {
		const video1 = await axios({
			method: 'get',
			url: `${hangair_ip}/hangair_video_1`,
			responseType: 'stream'
		});

		video1.data.on('data', (chunk) => {
			io.emit('drone_video', chunk.toString('base64'));
		});

		video1.data.on('end', () => {
			console.log('Stream ended');
		});

		const video2 = await axios({
			method: 'get',
			url: `${hangair_ip}/hangair_video_2`,
			responseType: 'stream'
		});

		video2.data.on('data', (chunk) => {
			io.emit('drone_video', chunk.toString('base64'));
		});

		video2.data.on('end', () => {
			console.log('Stream ended');
		});
	} catch (error) {
		//console.error('Error fetching video stream:', error, "Waiting for 10 seconds before retrying...");
		setTimeout(fetchHangairVideos, 10000);
	}
}
fetchHangairVideos();

function applyUpdates(dataStructure, updates) {
	for (const shortFilename in updates) {
		const changes = updates[shortFilename];
		for (const fullPath in dataStructure) {
			const filename = path.basename(fullPath);
			if (filename === shortFilename) {
				for (const key in changes) {
					if (dataStructure[fullPath][key]) {
						console.log(`Updating ${key} in ${fullPath} from ${dataStructure[fullPath][key].value} to ${changes[key]}`);
						dataStructure[fullPath][key].value = changes[key];
					} else {
						console.warn(`Warning: ${key} not found in ${fullPath}`);
					}
				}
			}
		}
	}
	return dataStructure;
}

async function sendRequests(addresses, data, socket) {
	var cnt = 0;
	try {
		const requests = addresses.map(address => {
			return axios.post(address, Object.values(data)[cnt++])
				.then(response => {
					if (response.status === 200){
						return true;
					}
					return false;
				})
				.catch(error => {
					return false;
				})
		})

		const results = await Promise.all(requests);
		const allTrue = results.every(success => success === true);

		if (allTrue){
			s_vars = applyUpdates(s_vars, data);
			socket.emit("error", "Applied changes!");
			io.emit("Warning! s_vars have changed!");
			io.emit("s_vars", s_vars);
		} else {
			socket.emit("error", "Error pushing s_vars!");
		}
	} catch (err) {
		io.emit("error", err.toString());
	}
}