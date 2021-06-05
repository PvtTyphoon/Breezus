const BreezusEmbed = require("../classes/breezusEmbed");
const { stripIndents } = require("common-tags");

module.exports = {
  paginationEmbed: async (
    message,
    pages,
    emojiList = ["⏪", "⏩"],
    timeout = 300000
  ) => {
    let page = 0;
    const currentPage = await message.channel.send(
      pages[page].setFooter(`Displaying Page ${page + 1} / ${pages.length}`)
    );
    for (const emoji of emojiList) await currentPage.react(emoji);
    const reactionCollector = currentPage.createReactionCollector(
      (reaction, user) => emojiList.includes(reaction.emoji.name) && !user.bot,
      { time: timeout }
    );
    reactionCollector.on("collect", (reaction) => {
      reaction.users.remove(message.author);
      switch (reaction.emoji.name) {
        case emojiList[0]:
          page = page > 0 ? --page : pages.length - 1;
          break;
        case emojiList[1]:
          page = page + 1 < pages.length ? ++page : 0;
          break;
        default:
          break;
      }
      currentPage.edit(
        pages[page].setFooter(`Displaying page:  ${page + 1} / ${pages.length}`)
      );
    });
    reactionCollector.on("end", () => {
      if (!currentPage.deleted) {
        currentPage.reactions.removeAll();
        page = 0;
      }
    });
    return currentPage;
  },
  // if you expect my code to be readable by a human youre being optimistic
  genshinChunkData: (
    message,
    data,
    type,
    commandname = type,
    pageCountOverride
  ) => {
    var pageCount = data.length / 10;
    if (pageCount % 1) pageCount = (pageCount + 1).toString().substring(0, 1);
    if (pageCountOverride) pageCount = pageCountOverride;
    var pages = [];
    for (let i = 0; i < pageCount; i++) {
      var slicedArr = data.slice(10 * i, 10 + 10 * i);
      var embed = new BreezusEmbed(message).setTitle(
        `${data.length} ${type}s found.`
      ).setDescription(stripIndents`
	  		  **Displaying ${10 * i + 1} to ${Math.round(10 + 10 * i)}**
	  		  To lookup a ${type}, run \`.${commandname} [name]\`
	  		  >>> ${slicedArr
            .map((x, index) => (x = `**${1 + index + 10 * i}.** ${x}`))
            .join("\n")}
	  		  `);
      pages.push(embed);
    }
    return pages;
  },
};
// an attempt to recreare discord-pagination from npm but a better version catered to breezy
