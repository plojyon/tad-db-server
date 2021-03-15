const express = require('express');
const app = express();
const port = process.env["PORT"];
const md5 = require('md5');
const Discord = require('discord.js');
const bot = new Discord.Client();
const GUILD_ID = process.env["GUILD_ID"]
const fetchAll = require('discord-fetch-all');

console.log("Tadej is waking up ...");

bot.login(process.env["CLIENT_SECRET"]).then(() => {
	console.log("Logged in alright"); // didn't crash (yet)
});

bot.on('ready', function() {
	console.log('Tadej ready!'); // bot initialization complete
	console.log("tad-db @ '" + getGuild().name + "' (id="+GUILD_ID+")");
});


function getGuild() {
	return bot.guilds.cache.get(GUILD_ID);
}

app.get('/', async (req, res) => {

	if (req.query.key) {
		const key = req.query.key;
		const hash = md5(key);
		const channels = getGuild().channels.cache;
		await Promise.all(channels.map(async (channel) => {
			if (channel.name == hash) {
				let allMessages = await fetchAll.messages(channel, {
					reverseArray: true, // hmm?
					userOnly: false,
					botOnly: false
				})
				allMessages = allMessages.map(msg => msg.cleanContent);
				str = allMessages.join('\n\n');
				
				res.end(str);
				return;
			}
			else {
				console.log(channel.name+" doesnt match "+hash)
			}
		}));
		res.end('ERROR: Nothing found');
	}
	else if (req.query.msg || req.query.to) {
		if (!req.query.msg) {
			res.end("ERROR: missing parameter 'msg'");
			return;
		}
		if (!req.query.to) {
			res.end("ERROR: missing parameter 'to'");
			return;
		}

		// TODO: verify msg is under 2kb and b64 encoded

		const key = req.query.to;
		const hash = md5(key);
		let ch = getGuild().channels.cache.get(hash);
		if (!ch) {
			console.log("No channel yet. Creating ...");
			guild.channels.create(hash, {type: 'voice'});
			ch = getGuild().channels.cache.get(hash);
		}

		ch.send(res.query.msg);
	}
	else {
		res.end("ERROR: Missing parameters 'key' or 'msg' and 'to'")
		return;
	}
});

app.listen(port, ()=>{
	console.log("Listening on port "+port);
})