const { SUCCESS_EMOJI_ID } = process.env;
const yes = ["yes", "y", "ye", "yeah", "yup", "yea", "ya"];
const no = ["no", "n", "nah", "nope", "nop"];

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
};
