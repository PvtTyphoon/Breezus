const BreezusCommand = require("../../classes/command");
const BreezusEmbed = require("../../classes/breezusEmbed");
const { stripIndents } = require("common-tags");
const rp = require("request-promise");
const { cleanHTML } = require("../../util/TextMods");
const { paginationEmbed } = require("../../util/pagination");
const GoogleImages = require("google-images");
const { cseID, googleAPI } = require("../../config.json");
const gClient = new GoogleImages(cseID, googleAPI);

module.exports = class lookupCommand extends BreezusCommand {
	constructor(client) {
		super(client, {
			name: "googleimages",
			aliases: ["gi", "img"],
			group: "search",
			memberName: "googleimages",
			description: stripIndents`
			Searches google and returns the results.
			> Example Usage: .googleimages [query]
			`,
		});
	}

	async run(message) {
		message.channel.startTyping();
		message.channel.stopTyping();
		const args = message.content.trim().split(/ +/g).slice(1);
		let query = args.slice(0).join(" ");
		if (!query.length) return message.reply("Please provide a search query.");
		var data = await this.fetchData(query);
		if (!data.length) return message.reply("No image results found.");
		var pages = [];
		for (let i = 0; i < data.length; i++) {
			const embed = new BreezusEmbed(message)
				.setDescription(
					stripIndents`
        [${data[i].imageTitle}](${data[i].imageURL}) 
        `,
				)
				.setImage(data[i].imageURL);
			pages.push(embed);
		}
		paginationEmbed(message, pages);
	}
	async fetchData(query) {
		var data = [];
		var rData = await gClient.search(query, { safe: "high" });
		for (let i = 0; i < rData.length; i++) {
			data.push({
				imageURL: rData[i].url,
				imageTitle: rData[i].description,
				imageParent: rData[i].parentPage,
			});
		}
		return data;
	}
};
