const { createCanvas, loadImage, registerFont } = require("canvas");

const { imgurID } = require("../../config.json");

var imgur = require("imgur");
imgur.setClientId(imgurID);
imgur.getClientId();

module.exports = {
	generateGrid: async (chartParams) => {
		var imageLink;
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
				imageLink = json;
				return imageLink;
			})
			.catch(function (err) {
				console.log(`The Imgur API returned an error ${err.message}`);
			});
	},
};
