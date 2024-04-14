module.exports = {
	HEADERS: {
		ID: 'twitch-eventsub-message-id',
		TIMESTAMP: 'twitch-eventsub-message-timestamp',
		TYPE: 'twitch-eventsub-message-type',
		SIGNATURE: 'twitch-eventsub-message-signature'
	},
	EVENTS: {
		CHALLENGE: 'webhook_callback_verification',
		NOTIFICATION: 'notification',
		REVOKE: 'revocation'
	},
	ENDPOINTS: {
		BASE: () => `https://api.twitch.tv/helix`,
		GET_SUBSCRIPTIONS: () => `/eventsub/subscriptions`,
		CREATE_SUBSCRIPTION: () => `/eventsub/subscriptions`,
		DELETE_SUBSCRIPTION: (id) => `/eventsub/subscriptions?id=${id}`,
		GET_BADGES: () => `chat/badges/global`
	},
	SUBS: [
		{
			type: 'channel.follow',
			version: 2,
			condition: {
				broadcaster_user_id: process.env.USER_ID,
				moderator_user_id: process.env.USER_ID
			}
		},
		{
			type: 'channel.raid',
			version: 1,
			condition: {
				to_broadcaster_user_id: process.env.USER_ID
			}
		},
		{
			type: 'channel.subscribe',
			version: 1,
			condition: {
				broadcaster_user_id: process.env.USER_ID
			}
		},
		{
			type: 'channel.subscription.gift',
			version: 1,
			condition: {
				broadcaster_user_id: process.env.USER_ID
			}
		},
		{
			type: 'channel.subscription.message',
			version: 1,
			condition: {
				broadcaster_user_id: process.env.USER_ID
			}
		},
		{
			type: 'channel.cheer',
			version: 1,
			condition: {
				broadcaster_user_id: process.env.USER_ID
			}
		},
		{
			type: 'channel.goal.progress',
			version: 1,
			condition: {
				broadcaster_user_id: process.env.USER_ID
			}
		},
		{
			type: 'channel.goal.end',
			version: 1,
			condition: {
				broadcaster_user_id: process.env.USER_ID
			}
		}
	],
	EMOTES: `https://static-cdn.jtvnw.net/emoticons/v2/:id/default/light/2.0`
}