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
	console.log(req.query.key);
	if (!req.query.key) {
		res.end("ERROR: No key given")
		return;
	}
	const key = req.query.key;
	const hash = md5(key);
	const channels = getGuild().channels.cache;
	await Promise.all(channels.map(async (channel) => {
		console.log(channel.name)
		if (channel.name == hash) {
			console.log("FOUND A MATCH")
			let allMessages = await fetchAll.messages(channel, {
				reverseArray: true, // hmm?
				userOnly: false,
				botOnly: false,
				pinnedOnly: false,
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
});

app.listen(port, ()=>{
	console.log("Listening on port "+port);
})