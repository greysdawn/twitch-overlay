const express = require('express');
const fs = require('fs');

const app = express();
app.use(express.json());
app.use(express.static(__dirname + '/assets'));

const index = fs.readFileSync('./index.html');
app.get("/", async (req, res) => {
	return res.status(200).send(index.toString('utf-8'));
})

const evtClients = {};
app.get("/events", async (req, res) => {
	console.log('New connection request received');
	let clientId = req.query.client_id;

	evtClients[clientId] = res;
	res.socket.on('end', _ => {
		delete evtClients[clientId];
		res.end();
	})

	res.setHeader("Content-Type", "text/event-stream");
	res.write(`event: connect\n`);
	res.write(`data: Connection established.\n\n`);
})

async function setup() {
	var files = await fs.readdirSync('./handlers');
	for(var f of files) {
		var handler = require(f);
		if(f.setup) await f.setup(app, evtClients);
	}
}

setup();

const PORT = process.env.PORT ?? 8080;
app.listen(PORT)
console.log(`App listening on port ${PORT}`);