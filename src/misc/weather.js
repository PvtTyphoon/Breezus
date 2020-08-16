const BreezusCommand = require("../../classes/command");
const BreezusEmbed = require("../../classes/breezusEmbed");
const { stripIndents } = require("common-tags");
const weather = require("weather-js");

module.exports = class weatherCommand extends BreezusCommand {
	constructor(client) {
		super(client, {
			name: "weather",
			aliases: ["w"],
			group: "misc",
			memberName: "weather",
			description: 
				"MSN weather service lookup.",
		});
	}

	async run(message) {
		message.channel.startTyping();
		message.channel.stopTyping();
		const args = message.content.trim().split(/ +/g).slice(1);
		let location = args.slice(0).join(` `);
		// Could export this as a function or make it look neater, but eh, it'll do
		weather.find({ search: location, degreeType: `C` }, function (err, result) {
			if (err) message.channel.send(err);
			if (result === undefined || result.length === 0) {
				message.channel.send(stripIndents`
			Could not fetch results.
			`);
				return;
			}
			const current = result[0].current;
			const location = result[0].location;
			const embed = new BreezusEmbed(message)
				.setDescription(`${current.skytext}`)
				.setAuthor(`Forecast: ${current.observationpoint}`)
				.setColor(`RANDOM`)
				.addField(`Temperature 🌡`, `${current.temperature}° C`, true)
				.setThumbnail(current.imageUrl)
				.addField(`Feels Like 🌡`, `${current.feelslike}° C`, true)
				.addField(`Winds 🍃`, current.winddisplay, true)
				.addField(`Humidity 💦`, `${current.humidity}%`, true);
			message.channel.send({ embed });
		});
	}
};
