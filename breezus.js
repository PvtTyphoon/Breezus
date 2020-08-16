const Discord = require("discord.js");
const { CommandoClient } = require("discord.js-commando");
const { stripIndents } = require("common-tags");
const activities = require("./assets/json/activity");
const { logID, clients, ownerID } = require("./config.json");
const fs = require("fs");
const path = require("path");

const client = new CommandoClient({
	commandPrefix: clients[0].prefix,
	owner: ownerID,
	disableEveryone: true,
	unknownCommandResponse: false,
});

client.registry
	.registerDefaultTypes()
	.registerGroups([
		["core", "Core Commands"],
		["info", "Information lookup"],
		["charts", "Visual and text based charts"],
		["misc", "Miscellaneous commands"],
	])
	.registerDefaultGroups()
	.registerDefaultCommands()
	.registerCommandsIn(path.join(__dirname, "src"));

client.on("ready", () => {
	client.setInterval(() => {
		const activity = activities[Math.floor(Math.random() * activities.length)];
		client.user.setActivity(activity.text, { type: activity.type });
	}, 60000);
	client.channels.get(logID).send(stripIndents`
	[START] Guild Count: ${client.guilds.size}
	Users: ${client.guilds.map((g) => g.memberCount).reduce((a, b) => a + b)}
	`);
});

client.on("disconnect", (event) => {
	client.channels.get(logID).send(stripIndents`
	[DISCONNECT] Disconnected with code ${event.code}.
	`);
	process.exit(0);
});

client.on("error", (err) =>
	client.channels.get(logID).send(stripIndents`
[ERROR] Disconnected with code ${err}.
`),
);

client.on("guildCreate", (guild) =>
	client.channels.get(logID).send(stripIndents` 
[GUILD UPDATE] [JOIN]: ${guild.name}
`),
);

client.on("guildDelete", (guild) =>
	client.channels.get(logID).send(stripIndents`
[GUILD UPDATE] [REMOVAL]: ${guild.name}
`),
);

client.login(process.env.BOT_TOKEN);
