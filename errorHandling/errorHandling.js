const { stripIndents } = require("common-tags");
const { logID, apiRoot } = require("../config.json");
const { genDebugToken } = require("../util/Util");
const fs = require("fs");
const path = require("path");
const ErrorEmbed = require("./errorEmbed");
const errors = JSON.parse(
	fs.readFileSync(
		path.resolve(__dirname, "..", "assets", "json", "errors.json"),
		"utf8",
		function (err) {
			if (err) console.log("error", err);
		},
	),
);

module.exports = {
	handleError: async (err, message) => {
		if (err.type == "customError") {
			message.channel.send(err.error);
			return;
		}
		if (err.options) {
			message.channel.send(stripIndents`
			An error occurred while running this command.
			Error message: ${errors[err.error.error]}
			`);
			return;
		}
		var debugToken = genDebugToken(16);
		const embed = new ErrorEmbed(message).setTitle(`Token: \`${debugToken}\``)
			.setDescription(stripIndents`
			Error
			\`\`\`
			${err}
			\`\`\`
			`);
		message.client.channels.get(logID).send({ embed });
		message.channel.send(stripIndents`
			${errors["generic"]}
			Debug Token: \`${debugToken}\`
			`);
	},
};
