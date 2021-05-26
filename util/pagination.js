module.exports = {
	paginationEmbed: async (
		message,
		pages,
		emojiList = ["⏪", "⏩"],
		timeout = 300000,
	) => {
		let page = 0;
		const currentPage = await message.channel.send(
			pages[page].setFooter(`Displaying Page ${page + 1} / ${pages.length}`),
		);
		for (const emoji of emojiList) await currentPage.react(emoji);
		const reactionCollector = currentPage.createReactionCollector(
			(reaction, user) => emojiList.includes(reaction.emoji.name) && !user.bot,
			{ time: timeout },
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
				pages[page].setFooter(`Displaying page ${page + 1} / ${pages.length}`),
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
};
// an attempt to recreare discord-pagination from npm but a better version catered to breezy
