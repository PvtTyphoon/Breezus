const BreezusCommand = require("../../classes/command");
const BreezusEmbed = require("../../classes/breezusEmbed");
const { stripIndents } = require("common-tags");
const { colourGen } = require("../../util/Util");
const { api } = require("../../assets/json/errors");
var convert = require("convert-units");

module.exports = class convertCommand extends BreezusCommand {
	constructor(client) {
		super(client, {
			name: "convert",
			aliases: ["conversion", "units"],
			group: "misc",
			memberName: "convert",
			description: stripIndents`
			Conversion tool for multiple different units. List of units: <https://gist.github.com/PvtTyphoon/23d7fe22347a7436f384074c5eb188b6>
			\`\`\`Example Usage: .convert [unit] [conversion unit] [value]\`\`\`
			`,
		});
	}

	async run(message) {
		message.channel.startTyping();
		message.channel.stopTyping();
		let args = message.content.trim().split(/ +/g).slice(1);
		if (!args.length)
			return message.reply(stripIndents`
		No arguments provided.
		Syntax \`.convert <unit> <unit> <value>\`
		`);
		if (args.length === 1)
			return message.reply(stripIndents`
		Please provide a unit to convert to.
		Syntax \`.convert <unit> <unit> <value>\`
		`);
		if (args.length === 2)
			return message.reply(stripIndents`
		Please provide a value.
		Syntax \`.convert <unit> <unit> <value>\`
		`);
		let unit = args[0];
		let convertUnit = args[1];
		let value = args[2];
		try {
			var convertedValue = convert(value).from(unit).to(convertUnit);
		} catch (err) {
			return message.channel.send(`⚠️ ${err.message} ⚠️`);
		}
		if (isNaN(convertedValue)) return message.channel.send(api);
		const embed = new BreezusEmbed(message)
			.setDescription(
				`
		Conversion of \`${unit}\` to \`${convertUnit}\`.
		\`\`\`${value}${unit} is equivalent to ${convertedValue}${convertUnit}\`\`\`
		`,
			)
			.setColor(colourGen());
		message.channel.send({ embed });
	}
};
