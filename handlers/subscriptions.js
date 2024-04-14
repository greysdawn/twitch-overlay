const axios = require('axios');
const fs = require('fs');

const {
	ENDPOINTS
} = require('../constants');

const Client = axios.create({
	baseURL: ENDPOINTS.BASE(),
	headers: {
		'Client-Id': clientID,
		'Content-Type': 'application/json'
	}
})

const clientID = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const callbackURL = process.env.CALLBACK_URL;
const appSecret = process.env.APP_SECRET;

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

module.exports = async function setup() {
	try {
		TOKEN = await getToken();
		SUB_INST.defaults.headers['Authorization'] = `Bearer ${TOKEN}`;

		var transport = {
			method: 'webhook',
			callback: callbackURL,
			secret: appSecret
		}

		var req = await SUB_INST.get(ENDPOINTS.GET_SUBSCRIPTIONS());
		var existing = req.data;

		for(var e of existing.data) {
			if(e.status == 'enabled') continue;
			await SUB_INST.delete(ENDPOINTS.DELETE_SUBSCRIPTION(e.id));
		}

		for(var sub of SUBS) {
			if(!existing.data.find(s => s.type == sub.type && s.status == "enabled")) {
				await SUB_INST.post(ENDPOINTS.CREATE_SUBSCRIPTION(), {
					...sub,
					transport
				})
			}
		}

		req = await SUB_INST(ENDPOINTS.GET_BADGES());
		
		await fs.writeFileSync(__dirname + '/../badges.json', JSON.stringify(req.data.data));
	} catch(e){
		console.log(e.message, e.response?.data)
	}
}