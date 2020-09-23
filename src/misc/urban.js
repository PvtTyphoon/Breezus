const BreezusCommand = require("../../classes/command");
const BreezusEmbed = require("../../classes/breezusEmbed");
const { stripIndents } = require("common-tags");
const { shorten } = require("../../util/TextMods");
const ud = require("urban-dictionary");

module.exports = class urbanCommand extends BreezusCommand {
	constructor(client) {
		super(client, {
			name: "urban",
			aliases: ["ud", "u"],
			group: "misc",
			memberName: "urban",
			description: stripIndents`
			Urban Dictionary lookup.
			\`\`\`Example Usage: .urban [word]\`\`\`
			`,
		});
	}

	async run(message) {
		message.channel.startTyping();
		message.channel.stopTyping();
		const args = message.content.trim().split(/ +/g).slice(1);
    let query = args.slice(0).join(` `);
    ud.term(query, (error, entries) => {
      if (error) {
        message.reply(error.message)
      } else {
        const result = entries[0];
        const embed = new BreezusEmbed(message)
        .setDescription(stripIndents`
        [View page for ${result.word}](${result.permalink})
        Author: ${result.author}
        ID: \`${result.defid}\`
        >>> ${shorten(result.definition, 1000)}
        <:upvote:644608424356741142> ${result.thumbs_up}   •   <:downvote:644608453653954610> ${result.thumbs_down}
        `)
        .setAuthor(result.word);
        if(result.example) embed.addField("Example", result.example, false);
      message.channel.send({ embed });
      }
    });
	}
};
