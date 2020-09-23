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

const { registerError } = require("../errorHandling/customErrors");

// For commands that don't fetch users for mentions, yes this can be combined into one function, too lazy
module.exports = {
	getUser: async (message) => {
		var userData = {};
		const args = message.content.trim().split("|").slice(1);
		if (message.mentions.members.first()) {
			const { id } = message.mentions.members.first().user;
			if (unames[id]) userData.user = unames[id].username;
			if (!unames[id]) userData.user = "";
		} else if (args.length > 0) {
			userData.user = args[0].replace(/ +/g, "");
		} else {
			const { id } = message.author;
			if (unames[id]) userData.user = unames[id].username;
			if (!unames[id]) userData.user = "";
		}
		if (!userData.user.length) throw new registerError("notFound");
		return userData;
	},
};
