module.exports = class Util {
	static delay(ms) {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}
	static shorten(text, maxLen) {
		return text.length > maxLen ? `${text.substr(0, maxLen - 3)}...` : text;
	}
	static base64(text, mode = "encode") {
		if (mode === "encode") return Buffer.from(text).toString("base64");
		if (mode === "decode")
			return Buffer.from(text, "base64").toString("utf8") || null;
		throw new TypeError(`${mode} is not a supported base64 mode.`);
	}
	static cleanHTML(html) {
		let clean = html
			.replace(/(<br>)+/g, "\n")
			.replace(/&#039;/g, "'")
			.replace(/&quot;/g, '"')
			.replace(/<\/?i>/g, "*")
			.replace(/~!|!~/g, "||");
		if (clean.length > 2048) clean = `${clean.substr(0, 2043)}...`;
		const spoilers = (clean.match(/\|\|/g) || []).length;
		if (spoilers !== 0 && spoilers && spoilers % 2) clean += "||";
		return clean;
	}
};
