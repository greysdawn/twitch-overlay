const axios = require('axios');
const crypto = require('crypto');
const {
	ENDPOINTS,
	SUBS,
	HEADERS,
	EVENTS
} = require('../constants');
const { sleep } = require('../utils');

const clientID = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const callbackURL = process.env.CALLBACK_URL;
const appSecret = process.env.APP_SECRET;

const Client = axios.create({
	baseURL: ENDPOINTS.BASE(),
	headers: {
		'Client-Id': clientID,
		'Content-Type': 'application/json'
	}
})

function verify (req, res, next) {
	if(!verifyHash(req.headers, req.body)) return res.status(403).send();
	next();
}

function verifyHash(headers, body) {
	var data = headers[HEADERS.ID] +
			   headers[HEADERS.TIMESTAMP] +
			   JSON.stringify(body);
	var sig = headers[HEADERS.SIGNATURE];

	var hash = crypto.createHmac('sha256', appSecret)
		.update(data)
		.digest('hex');
	hash = `sha256=`+hash;

	return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(sig));
}

async function getToken() {
	var query =
		`client_id=${clientID}` +
		`&client_secret=${clientSecret}` +
		`&grant_type=client_credentials`;
	try {
		var req = await axios.post(`https://id.twitch.tv/oauth2/token?${query}`);
		var data = req.data;
	} catch(e) {
		console.log(e.config, e.message);
	}
	
	return data.access_token;
}

async function handleQueue(clients) {
	running = true;

	if(queue.length) {
		for(var c of clients) {
			c.write(`event: special\n`);
			c.write(`data: ${JSON.stringify(queue[0])}\n\n`);
		}
		queue.shift();
		await sleep(3000);
	}

	if(!queue.length) running = false;
	else await handleQueue(clients);
}

async function clean() {
	var l = processed.size;
	for(var [k, v] of processed) {
		var cur = new Date();
		var dt = new Date(v);
		if(dt < (cur - (2*60*1000))) processed.delete(k);
	}
	console.log(`cleaned ${l - processed.size} processed notifications`);
}

const events = [ ];
const processed = new Map();

module.exports = async function setup(app, evtClients) {
	try {
		TOKEN = await getToken();
		Client.defaults.headers['Authorization'] = `Bearer ${TOKEN}`;

		var transport = {
			method: 'webhook',
			callback: callbackURL,
			secret: appSecret
		}

		var req = await Client.get(ENDPOINTS.GET_SUBSCRIPTIONS());
		var existing = req.data;

		for(var e of existing.data) {
			if(e.status == 'enabled') continue;
			await Client.delete(ENDPOINTS.DELETE_SUBSCRIPTION(e.id));
		}

		for(var sub of SUBS) {
			if(!existing.data.find(s => s.type == sub.type && s.status == "enabled")) {
				await Client.post(ENDPOINTS.CREATE_SUBSCRIPTION(), {
					...sub,
					transport
				})
			}
		}

		app.post('/', verify, (req, res) => {
			res.set('content-type', 'text/plain');
			if(processed.has(req.headers[HEADERS.ID])) return res.status(200).send();
			processed.set(req.headers[HEADERS.ID], req.headers[HEADERS.TIMESTAMP]);

			var type = req.headers[HEADERS.TYPE];
			switch(type) {
				case EVENTS.NOTIFICATION:
					events.push({
						id: req.headers[HEADERS.ID],
						type: req.body.subscription.type,
						data: req.body.event
					})
					if(!running) handleQueue(evtClients);
					break;
				case EVENTS.CHALLENGE:
					return res.status(200).send(req.body.challenge);
					break;
				case EVENTS.REVOKE:
					break;
			}

			return res.status(204).send();
		})

		setInterval(() => clean(), 2 * 60 * 1000);
	} catch(e){
		console.log(e.message, e.response?.data)
	}
}