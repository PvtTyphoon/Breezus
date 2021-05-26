const { SUCCESS_EMOJI_ID } = process.env;
const yes = ["yes", "y", "ye", "yeah", "yup", "yea", "ya"];
const no = ["no", "n", "nah", "nope", "nop"];
const unixtime = require("unixtime");
const now = unixtime();

module.exports = class Util {
	static delay(ms) {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}
	static shuffle(array) {
		const arr = array.slice(0);
		for (let i = arr.length - 1; i >= 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			const temp = arr[i];
			arr[i] = arr[j];
			arr[j] = temp;
		}
		return arr;
	}
	static randomRange(min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}
	static trimArray(arr, maxLen = 10) {
		if (arr.length > maxLen) {
			const len = arr.length - maxLen;
			arr = arr.slice(0, maxLen);
			arr.push(`${len} more...`);
		}
		return arr;
	}
	static colourGen() {
		var colours = [
			"#cbffe6",
			"#afe9ff",
			"#44fcaa",
			"#bfb9ff",
			"#ffcfea",
			"#feffbe",
			"#c8ffbc",
			"#8ef4f6",
			"#90EE90",
			"#b19cd9",
			"#ff6961",
			"#FFDFD3",
			"#C1E7E3",
			"#9d0bfa",
			"#8AFA82",
			"#f13961",
		];
		return colours[Math.floor(Math.random() * colours.length * 1)];
	}
	static today(timeZone) {
		const now = new Date();
		if (timeZone) now.setUTCHours(timeZone);
		now.setHours(0);
		now.setMinutes(0);
		now.setSeconds(0);
		now.setMilliseconds(0);
		return now;
	}
	static msToTS(millis) {
		var minutes = Math.floor(millis / 60000);
		var seconds = ((millis % 60000) / 1000).toFixed(0);
		return minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
	}
	static tomorrow(timeZone) {
		const today = Util.today(timeZone);
		today.setDate(today.getDate() + 1);
		return today;
	}
	static genDebugToken(length) {
		const charset =
			"abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
		var returnVal = "";
		for (var i = 0, n = charset.length; i < length; ++i) {
			returnVal += charset.charAt(Math.floor(Math.random() * n));
		}
		return returnVal;
	}
	static async awaitPlayers(
		msg,
		max,
		min,
		{ time = 30000, dmCheck = false } = {},
	) {
		const joined = [];
		joined.push(msg.author.id);
		const filter = (res) => {
			if (res.author.bot) return false;
			if (joined.includes(res.author.id)) return false;
			if (res.content.toLowerCase() !== "Join") return false;
			joined.push(res.author.id);
			res.react(SUCCESS_EMOJI_ID || "✅").catch(() => null);
			return true;
		};
		const verify = await msg.channel.awaitMessages(filter, { max, time });
		verify.set(msg.id, msg);
		if (dmCheck) {
			for (const message of verify.values()) {
				try {
					await message.author.send("This is a test, ignore this.");
				} catch (err) {
					verify.delete(message.id);
				}
			}
		}
		if (verify.size < min) return false;
		return verify.map((message) => message.author);
	}

	static async verify(channel, user, time = 30000) {
		const filter = (res) => {
			const value = res.content.toLowerCase();
			return (
				res.author.id === user.id && (yes.includes(value) || no.includes(value))
			);
		};
		const verify = await channel.awaitMessages(filter, {
			max: 1,
			time,
		});
		if (!verify.size) return 0;
		const choice = verify.first().content.toLowerCase();
		if (yes.includes(choice)) return true;
		if (no.includes(choice)) return false;
		return false;
	}
	static parseTimePeriod(inputTime) {
		var timeVar;
		var dText;
		var period;
		switch (inputTime) {
			case "7day":
			case "7days":
			case "7d":
			case "week":
			case "7":
				timeVar = "7day";
				dText = "`7 days`";
				period = now - 604800;
				break;

			case "month":
			case "30day":
			case "30days":
			case "30d":
			case "30":
				timeVar = "1month";
				dText = "`30 days`";
				period = now - 2592000;
				break;

			case "3month":
			case "3months":
			case "3m":
			case "90d":
			case "90":
				timeVar = "3month";
				dText = "`3 months`";
				period = now - 7884000;
				break;

			case "6month":
			case "6months":
			case "6m":
			case "halfyear":
			case "180d":
			case "180":
				timeVar = "6month";
				dText = "`6 months`";
				period = now - 15768000;
				break;

			case "year":
			case "12month":
			case "12months":
			case "12m":
			case "1year":
			case "1y":
			case "365d":
			case "365":
				timeVar = "12month";
				dText = "`1 year`";
				period = now - 31536000;
				break;

			case "overall":
			case "alltime":
			case "total":
			case "all":
				timeVar = "overall";
				dText = "`overall`";
				period = 1009843200;
				break;

			default:
				timeVar = "7day";
				dText = "`7 days (default)`";
				period = now - 604800;
		}
		return {
			timeVar,
			dText,
			period,
		};
	}
	static parseChartSize(input) {
		var chartSizeVar;
		switch (input) {
			case "3x3":
			case "3×3":
			case "3":
			case "three":
				chartSizeVar = 3;
				break;

			case "4x4":
			case "4×4":
			case "4":
			case "four":
				chartSizeVar = 4;
				break;

			case "5x5":
			case "5×5":
			case "5":
			case "five":
				chartSizeVar = 5;
				break;

			case "6x6":
			case "6×6":
			case "6":
			case "six":
				chartSizeVar = 6;
				break;

			case "7x7":
			case "7×7":
			case "7":
			case "seven":
				chartSizeVar = 7;
				break;

			case "8x8":
			case "8×8":
			case "8":
			case "eight":
				chartSizeVar = 8;
				break;

			case "9x9":
			case "9×9":
			case "9":
			case "nine":
				chartSizeVar = 9;
				break;

			default:
				chartSizeVar = 5;
		}
		return chartSizeVar;
	}
	static generateMedals() {
		var medals;
		return (medals = {
			0: "🥇  ",
			1: "🥈  ",
			2: "🥉  ",
			3: " 4.    ",
			4: " 5.    ",
			5: " 6.    ",
			6: " 7.    ",
			7: " 8.    ",
			8: " 9.    ",
			9: " 10.  ",
			10: " 11.  ",
			11: " 12.  ",
			12: " 13.  ",
			13: " 14.  ",
			14: " 15.  ",
			15: " 16.  ",
			16: " 17.  ",
			17: " 18.  ",
			18: " 19.  ",
			19: " 20.  ",
			20: " 21.  ",
			21: " 22.  ",
			22: " 23.  ",
			23: " 24.  ",
			24: " 25.  ",
		});
	}
};
