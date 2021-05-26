const BreezusCommand = require("../../classes/command");
const BreezusEmbed = require("../../classes/breezusEmbed");
const rp = require("request-promise");
const { stripIndents } = require("common-tags");
const { getUser } = require("../../util/chartsUserGetter");
const { handleError } = require("../../errorHandling/errorHandling");
const { parseTimePeriod, parseChartSize } = require("../../util/Util");
const { apiRoot, keys, imgurID } = require("../../config.json");
const { createCanvas, loadImage, registerFont } = require("canvas");

var imgur = require("imgur");
imgur.setClientId(imgurID);
imgur.getClientId();

module.exports = class chartCommand extends BreezusCommand {
	constructor(client) {
		super(client, {
			name: "chart",
			aliases: ["charts", "grid"],
			group: "charts",
			memberName: "chart",
			description: stripIndents`
			Generates a chart with the top albums of a user. 
			> Example Usage: .chart <3x3|4x4|5x5|6x6|7x7|8x8|9x9> <7day|30day|3month|6month|12month|overall> | <user>
			`,
		});
	}

	async run(message) {
		message.channel.startTyping();
		message.channel.stopTyping();
		const args = message.content.trim().split(/ +/g).slice(1);
		var chartSizeVar = parseChartSize(args[0]);
		var { timeVar, dText } = parseTimePeriod(args[1]);
		try {
			var userData = await getUser(message);
			var data = await this.fetchData(userData.user);
			var data = await this.fetchData(userData.user, chartSizeVar, timeVar);

			var chartParams = {
				user: userData.user,
				height: chartSizeVar * 300,
				width: chartSizeVar * 300,
				count: chartSizeVar * chartSizeVar,
				albums: data.albums,
				displayingText: `Displaying ${data.albums.length} albums in a ${chartSizeVar}×${chartSizeVar} grid for ${dText}`,
			};
			if (chartParams.count !== data.albums.length) {
				message.channel.send(stripIndents`
				> ${userData.user} has not listened to enough music in ${timeVar} to generate a ${chartSizeVar}×${chartSizeVar} grid of their albums.
				> Fetched ${data.albums.length} out of ${chartParams.count} required albums.
				> Try generating a smaller chart or use a longer time period.
			`);
				return;
			}

			const canvas = createCanvas(chartParams.height, chartParams.width);
			const ctx = canvas.getContext("2d");
			let xOff = 0;
			let yOff = 0;
			for (let i = 0; i < chartParams.count; i++) {
				const album_ = chartParams.albums[i];
				if (album_.image[album_.image.length - 1]["#text"] !== "") {
					const albumArt = await loadImage(
						album_.image[album_.image.length - 1]["#text"],
					);
					ctx.drawImage(albumArt, xOff, yOff);
				} else {
					const albumArt = await loadImage(
						"https://never-gonna.go-get-a.life/ZLW2We.jpeg",
					);
					ctx.drawImage(albumArt, xOff, yOff);
				}
				ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
				ctx.fillRect(xOff, yOff, xOff + 300, yOff + 300);
				ctx.fillStyle = "white";
				ctx.font = `20px Noto`;
				ctx.fillText(album_.artist.name, xOff + 24, yOff + 300 - 24);
				ctx.fillText(album_.name, xOff + 24, yOff + 300 - 48);
				xOff += 300;
				if (xOff >= chartParams.height) {
					xOff = 0;
					yOff += 300;
				}
			}

			const stream = canvas.toDataURL("image/jpg", 0.9).split(",")[1];
			imgur
				.uploadBase64(stream)
				.then(function (json) {
					const embed = new BreezusEmbed(message)
						.setDescription(
							stripIndents`
						Chart for ${chartParams.user}
						${chartParams.displayingText}
						`,
						)
						.setImage(json.data.link);
					message.channel.send({ embed });
				})
				.catch(function (err) {
					message.reply(`The Imgur API returned an error: ${err.message}`);
				});
		} catch (err) {
			handleError(err, message);
			return;
		}
	}

	async fetchData(user, chartSizeVar, timeVar) {
		var albumOptions = {
			uri: apiRoot,
			json: true,
			qs: {
				method: "user.gettopalbums",
				user: user,
				api_key: keys[1],
				format: "json",
				limit: chartSizeVar * chartSizeVar,
				period: timeVar,
			},
		};
		const albumData = await rp(albumOptions);

		const data = {
			albums: albumData.topalbums.album,
		};
		return data;
	}
};
