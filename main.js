const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');
const axios = require('axios');
const { type } = require('os');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

var pos_history = [];
var last_packet = {};
var hangair_ip = ""

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

// Socket.io connection event
io.on('connection', (socket) => {
	console.log('A client connected');
	socket.emit("packet", last_packet);
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
});

// Start the server
const port = 3000;
server.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});

async function fetchVideoStream() {
    try {
        const response = await axios({
            method: 'get',
            url: `${hangair_ip}/video`,
            responseType: 'stream'
        });

        response.data.on('data', (chunk) => {
            io.emit('video', chunk.toString('base64'));
        });

        response.data.on('end', () => {
            console.log('Stream ended');
        });
    } catch (error) {
        //console.error('Error fetching video stream:', error, "Waiting for 10 seconds before retrying...");
		setTimeout(fetchVideoStream, 10000);
    }
}

fetchVideoStream();

