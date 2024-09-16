var osc = require("osc"),
	WebSocket = require("ws"),
	Express = require("express");

//get arguments
var args = process.argv.slice(2);

console.log("OSC Server syncs OSC messages and a WebSocket client");
console.log("Usage: node oscServer.js <udpPortReceive> <udpPortSend>");
console.log("Optional: --verbose: Print all messages, but slower");


// Create an Express server app
// and serve up a directory of static files.
let staticPort = 8081;
let verbose = args.includes("--verbose");
let ports = args.filter(arg => !isNaN(parseInt(arg)));
let udpPortReceive = ports[0] ? parseInt(ports[0]) : 57120;
let udpPortSend = ports[1] ? parseInt(ports[1]) : 57121;
var app = Express();
server = app.listen(staticPort, () => {
	console.log(`✅ Websocket port ready on ws://localhost:${staticPort}`)
});

// Listen for Web Socket requests.
var wss = new WebSocket.Server({ server });

var socketPort = null;

// Listen for Web Socket connections.
wss.on("connection", function (socket) {
	console.log(`✨ New connection`);

	socketPort = new osc.WebSocketPort({
		socket: socket,
		metadata: true
	});

	socketPort.on("message", function (oscMsg) {
		verbose && console.log("New Message:", oscMsg);
		echoMessage(oscMsg.address, oscMsg.args);
	});
}).on("error", function (err) {
	console.error(`❌ WebSocket port can't be created on ${staticPort}`);
	if (err.code === 'EADDRINUSE') {
		console.error(`Port already occupied.`);
	} else {
		console.error(err.message);
	}
	process.exit(1);
});

// Create an osc.js UDP Ports.
var udpPort = new osc.UDPPort({
	localAddress: "127.0.0.1",
	localPort: udpPortReceive,
	remoteAddress: "127.0.0.1",
	remotePort: udpPortSend
});

// Listen for incoming OSC messages.
udpPort.on("message", function (oscMsg) {
	verbose && console.log("New Message:", oscMsg);
	echoMessage(oscMsg.address, oscMsg.args);
});
// Listen for incoming OSC messages.
udpPort
	.on("ready", function () {
		console.log(`✅ UDP port ready to receive on 127.0.0.1:${udpPortReceive}`);
	}).on("error", function (err) {
		console.error(`❌ UDP port can't be created on 127.0.0.1:${udpPortReceive}`);
		if (err.code === 'EADDRINUSE') {
			console.error(`Port already occupied.`);
		} else {
			console.error(err.message);
		}
		process.exit(1);
	});
udpPort.open();

function echoMessage(address, args) {
	// Send OSC message back to other parties
	udpPort.send({
		address,
		args
	});
	let type = 's'; //default string
	switch (typeof args[0]) {
		case 'number':
			type = 'f';
			break;
		case 'boolean':
			type = 'T';
			break;
	}
	socketPort?.send({
		address,
		args: [{ type: args[0]?.type ?? type, value: args[0]?.value ?? args[0] }]
	});
}

//close the ports on exit
process.on('exit', function () {
	udpPort?.close();
	socketPort?.close();
});
