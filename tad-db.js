const express = require('express');
const isBase64 = require('is-base64');
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
function getChannel(name) {
	let channels = getGuild().channels.cache
	let peanut; // the one I'm looking for
	channels.forEach(ch => {
		if (ch.name == name) {
			peanut = ch
		}
	})
	return peanut
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
		if (!isBase64(req.query.msg)) {
			res.end("ERROR: 'msg' is not b64 encoded");
			return;
		}
		if (req.query.msg.length > 2000) {
			res.end("ERROR: 'msg' exceeds 2kB");
		}
		
		const key = req.query.to;
		const hash = md5(key);
		let ch = getChannel(hash);
		if (!ch) {
			console.log("No channel yet. Creating ...");
			ch = await getGuild().channels.create(hash, {type: 'text'});
			//ch = getChannel(hash);
		}

		ch.send(req.query.msg);
		res.end();
	}
	else {
		res.end("ERROR: Missing parameters 'key' or 'msg' and 'to'")
		return;
	}
});

app.listen(port, ()=>{
	console.log("Listening on port "+port);
})