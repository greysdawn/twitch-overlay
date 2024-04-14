const express = require("express");
const axios = require("axios");
const fs = require("fs");

const app = express();
app.use(express.json());
app.use(express.static(__dirname + "/assets"));

const index = fs.readFileSync("./index.html");
app.get("/", async (req, res) => {
	return res.status(200).send(index.toString("utf-8"));
});

const evtClients = {};
app.get("/events", async (req, res) => {
	console.log("New connection request received");
	let clientId = req.query.client_id;

	evtClients[clientId] = res;
	res.socket.on("end", (_) => {
		delete evtClients[clientId];
		res.end();
	});

	res.setHeader("Content-Type", "text/event-stream");
	res.write(`event: connect\n`);
	res.write(`data: Connection established.\n\n`);
});

async function getToken() {
	var query =
		`client_id=${process.env.CLIENT_ID}` +
		`&client_secret=${process.env.CLIENT_SECRET}` +
		`&grant_type=client_credentials`;
	try {
		var req = await axios.post(`https://id.twitch.tv/oauth2/token?${query}`);
		var data = req.data;
	} catch (e) {
		console.log(e.config, e.message);
	}

	return data.access_token;
}

async function setup() {
	const TOKEN = await getToken();
	var files = fs.readdirSync(__dirname + "/handlers");
	for (var f of files) {
		var fn = `${__dirname}/handlers/${f}`;
		var handler = require(fn);
		await handler(app, evtClients, TOKEN);
	}
}

setup();

const PORT = process.env.PORT ?? 8080;
app.listen(PORT);
console.log(`App listening on port ${PORT}`);
