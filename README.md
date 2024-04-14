# Twitch Overlay
Extremely simple self-hosted browser source for Twitch alerts and miscellaneous overlays

# Currently handled
## Alerts
The following alert types are handled:
- Follows
- Raids
- Subscriptions
- Resubs
- Sub gifts
- Cheers
- Goal progress
- Goal end

Multiple events in a row are queued up, so no need to worry about missing one if another happens immediately after! Also, they should be on the screen for about 3 seconds by default

## Emotes
Emotes from emote-only messages pop up in a random spot on the screen and shoot off to another spot while fading away

## Chat
Against the right edge, below the alert box, is a chat window that handles (global) badges, emotes, and, of course, messages. The box is styled similarly to Twitch Studio's built-in chat overlay. Emote-only messages don't appear here, as they're handled above

**More TBA**, we're planning on changing up emotes to have a configurable per-user limit at the very least

# Self Hosting
## REPL.IT
If you'd like to use Repl.it for testing, you can fork [this repl](https://replit.com/@GreyHimmel/twitch-overlay?v=1), create and populate the required env variables, and then you're good to go!  
**Keep in mind that Repl.it no longer allows hosting without doing premium deployments**, but this is a good way to test your setup and make sure everything's working to your liking before hosting.

## VPS
### Requirements
- NodeJS 12.x or higher
- An account for chat access (your broadcaster account works, though you can also make an alt)
- A Twitch [dev app](https://dev.twitch.com)

### Environment
The current `example.env` looks like this:
```bash
CLIENT_ID= # your twitch client's ID
CLIENT_SECRET= # your twitch client's secret
APP_SECRET= # random string used to verify events
CALLBACK_URL= # your outside url

CHANNEL_NAME= # your channel's username
USER_ID= # your channel's user ID
BOT_USERNAME= # chat bot username, optional
OAUTH_TOKEN= # your chat bot's token, optional

PORT= # the port for your server
```

- Client ID and secret are from your dev app
- App secret should be *randomly genderated* to be secure  

This app uses the server-sent events API for communicating between the frontend and backend. Previously we used websockets via socket.io, which NginX had issues with. This version should do better now thankfully!

### Steps
1. Clone this repo to your host
2. Copy the `example.env`, rename to `.env`, and supply the correct info
3. Run `npm install` to install dependencies
4. If you'd like, replace the sounds and images in `/assets` (keep the names the same! or just make sure to change the names in `index.html`)
5. Configure anything else you need to make the site available on the web (eg. DNS, NginX, etc)
6. Run `node index` to get it up and running
7. Add the site as a browser source in whatever streaming application you use, making sure it covers the full screen

If you have an alt account, you can test that it's working by following your main and making sure that an alert pops up\*. If all's working, then you're all set! The app handles everything necessary for staying subscribed to events, so you can just leave it running for whenever you stream

\* = **NOTE:** Sometimes sounds won't play at first if you're looking at it in an actual browser- you have to "interact" with the page first (try clicking in the blank space). This isn't a problem for browser sources, thankfully

# Support
If you need support, feel free to open an issue! However, please note that we *can not* provide support related to hosting- we can only help if something directly related to the program breaks

If you'd like to support *us*, we've got a [Patreon](https://patreon.com/greysdawn) and a [Ko-Fi](https://ko-fi.com/greysdawn) you can chuck some money at, if you're interested. No pressure though 💜
