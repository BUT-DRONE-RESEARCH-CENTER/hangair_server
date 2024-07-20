const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

var pos_history = [];
var last_packet = {};

app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get("/packet", (req, res) => {
	// Handle incoming packets from hangair
	let packet = JSON.parse(req.body);
	packet["timestamp"] = + new Date();
	if (packet["type"] == "position") {
		pos_history.push(packet["data"]);
	}
	io.emit("packet", JSON.stringify(packet));
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
});

// Start the server
const port = 3000;
server.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});