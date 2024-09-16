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

// app.use("/", app.static(__dirname + "/static"));

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
var udpPortR = new osc.UDPPort({
	localAddress: "127.0.0.1",
	localPort: udpPortReceive
});

// Listen for incoming OSC messages.
udpPortR.on("message", function (oscMsg) {
	verbose && console.log("New Message:", oscMsg);
	echoMessage(oscMsg.address, oscMsg.args);
});
// Listen for incoming OSC messages.
udpPortR
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
udpPortR.open();

//connect to the sending port
var udpPortS = new osc.UDPPort({
	localAddress: "127.0.0.1",
	localPort: udpPortSend
});
udpPortS.on("ready", function () {
	console.log(`✅ UDP port ready to send on 127.0.0.1:${udpPortSend}`);
}).on("error", function (err) {
	console.error(`❌ UDP port can't be created on 127.0.0.1:${udpPortSend}`);
	if (err.code === 'EADDRINUSE') {
		console.error(`Port already occupied.`);
	} else {
		console.error(err.message);
	}
	process.exit(1);
});
udpPortS.open();


function echoMessage(address, args) {
	// Send OSC message back to other parties
	udpPortS.send({
		address,
		args
	});
	socketPort?.send({
		address,
		args: [ { type: args[0]?.type ?? 'f', value: args[0]?.value ?? args[0] } ]
	});
}

//close the ports on exit
process.on('exit', function () {
	udpPortR?.close();
	udpPortS?.close();
	socketPort?.close();
});
