const BreezusCommand = require("../../classes/command");
const BreezusEmbed = require("../../classes/breezusEmbed");
const rp = require("request-promise");
const { stripIndents } = require("common-tags");
const { getUser } = require("../../util/chartsUserGetter");
const { handleError } = require("../../errorHandling/errorHandling");
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
			\`\`\`Example Usage: .chart <3x3|4x4|5x5|6x6|7x7|8x8|9x9> <7day|30day|3month|6month|12month|overall> | <use>\`\`\`
			`,
		});
	}

	async run(message) {
		message.channel.startTyping();
		message.channel.stopTyping();
		const args = message.content.trim().split(/ +/g).slice(1);
		var chartSizeVar;
		var chartTimeVar;
		var dText;
		switch (args[0]) {
			case "3x3":
			case "3×3":
			case "3":
				chartSizeVar = 3;
			case "4x4":
			case "4×4":
			case "4":
				chartSizeVar = 4;
				break;

			case "5x5":
			case "5×5":
			case "5":
				chartSizeVar = 5;
				break;

			case "6x6":
			case "6×6":
			case "6":
				chartSizeVar = 6;
				break;

			case "7x7":
			case "7×7":
			case "7":
				chartSizeVar = 7;
				break;

			case "8x8":
			case "8×8":
			case "8":
				chartSizeVar = 8;
				break;

			case "9x9":
			case "9×9":
			case "9":
				chartSizeVar = 9;
				break;

			default:
				chartSizeVar = 5;
		}
		switch (args[1]) {
			case "7day":
			case "7days":
			case "7d":
				chartTimeVar = "7day";
				dText = "`7 days`";
				break;

			case "month":
			case "30day":
			case "30days":
			case "30d":
				chartTimeVar = "1month";
				dText = "`30 days`";
				break;

			case "3month":
			case "3months":
			case "3m":
				chartTimeVar = "3month";
				dText = "`3 months`";
				break;

			case "6month":
			case "6months":
			case "6m":
				chartTimeVar = "6month";
				dText = "`6 months`";
				break;

			case "year":
			case "12month":
			case "12months":
			case "12m":
			case "1y":
				chartTimeVar = "12month";
				dText = "`1 year`";
				break;

			case "overall":
			case "alltime":
			case "total":
			case "all":
				chartTimeVar = "overall";
				dText = "`overall`";
				break;

			default:
				chartTimeVar = "7day";
				dText = "`7 days (default)`";
		}
		try {
			var userData = await getUser(message);
			var data = await this.fetchData(userData.user);
			var data = await this.fetchData(
				userData.user,
				chartSizeVar,
				chartTimeVar,
			);

			var chartParams = {
				user: userData.user,
				height: chartSizeVar * 300,
				width: chartSizeVar * 300,
				count: chartSizeVar * chartSizeVar,
				albums: data.albums,
				displayingText: `Displaying ${data.albums.length} albums in a ${chartSizeVar}×${chartSizeVar} grid for ${dText}`,
			};
			if (chartParams.count !== data.albums.length) {
				message.reply(stripIndents`
				User has not listened to enough music in ${chartTimeVar} to generate a ${chartSizeVar}×${chartSizeVar} grid of their albums.
				Fetched ${data.albums.length} out of ${chartParams.count} required albums.
				Try generating a smaller chart or use a longer time period.
			`);
				return;
			}

			const canvas = createCanvas(chartParams.height, chartParams.width);
			const ctx = canvas.getContext("2d");
			let xOff = 0;
			let yOff = 0;
			ctx.fillStyle = "black";
			ctx.fillRect(0, 0, chartParams.height, chartParams.width);
			for (let i = 0; i < chartParams.count; i++) {
				const album_ = chartParams.albums[i];
				if (album_.image[album_.image.length - 1]["#text"] !== "") {
					const albumArt = await loadImage(
						album_.image[album_.image.length - 1]["#text"],
					);
					ctx.drawImage(albumArt, xOff, yOff);
				} else {
					const albumArt = await loadImage(
						"https://i-really-should.go-get-a.life/DcfTOP.jpeg",
					);
					ctx.drawImage(albumArt, xOff, yOff);
				}
				ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
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
							stripIndents`Chart for ${chartParams.user}
						${chartParams.displayingText}`,
						)
						.setImage(json.data.link);
					message.channel.send({ embed });
				})
				.catch(function (err) {
					message.reply(`The Imgur API returned an error ${err.message}`);
				});
		} catch (err) {
			handleError(err, message);
			return;
		}
	}

	async fetchData(user, chartSizeVar, chartTimeVar) {
		var albumOptions = {
			uri: apiRoot,
			json: true,
			qs: {
				method: "user.gettopalbums",
				user: user,
				api_key: keys[1],
				format: "json",
				limit: chartSizeVar * chartSizeVar,
				period: chartTimeVar,
			},
		};
		const albumData = await rp(albumOptions);

		const data = {
			albums: albumData.topalbums.album,
		};
		return data;
	}
};
