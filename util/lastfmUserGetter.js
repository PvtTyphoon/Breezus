const fs = require("fs");
const path = require("path");

const unames = JSON.parse(
	fs.readFileSync(
		path.resolve(__dirname, "..", "assets", "json", "uname.json"),
		"utf8",
		function (err) {
			if (err) console.log("error", err);
		},
	),
);
const errors = JSON.parse(
	fs.readFileSync(
		path.resolve(__dirname, "..", "assets", "json", "errors.json"),
		"utf8",
		function (err) {
			if (err) console.log("error", err);
		},
	),
);

/*
 ** Ok now listen here, yes this is inefficient, yes theres better
 ** ways to do this, yes im retarded and this is bodged as shit. But
 ** no, go away, i am not fixing this, i did this the nice way, i have
 ** a headache and debugging is killing me. I just want to get this
 ** over with. Is there a better way to handle this? Yes, there is.
 ** Are there better ways to approach handling users? Yes, there are.
 ** Am i going to implement them? No, im going to cry in the corner.
 ** Dont bully me, i just dont care anymore, if it works, it works.
 ** My head hurts. I do not care if this one file looks like shit.
 ** Goodnight.
 */

module.exports = {
	getUser: async (message) => {
		var userData = {};
		const args = message.content.trim().split(/ +/g).slice(1);
		if (message.mentions.members.first()) {
			const { id } = message.mentions.members.first().user;
			if (unames[id]) userData.user = unames[id].username;
			if (!unames[id]) userData.user = "";
		} else if (!message.mentions.members.first() && args.length > 0) {
			userData.user = args[0];
		} else {
			const { id } = message.author;
			if (unames[id]) userData.user = unames[id].username;
			if (!unames[id]) userData.user = "";
		}
		if (userData.user.length === 0) userData.error = errors["register"];
		return userData;
	},
};
