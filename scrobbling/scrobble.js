const { scrobbling } = require("../config.json");
var LastfmAPI = require("lastfmapi");
var lfm = new LastfmAPI({
	api_key: scrobbling.key,
	secret: scrobbling.secret,
});

lfm.setSessionCredentials(scrobbling.username, scrobbling.token);

module.exports = class scrobblings {
	static scrobble(track, album, artist) {
		lfm.track.scrobble(
			{
				artist: artist,
				track: track,
				album: album,
				timestamp: Math.floor(new Date().getTime() / 1000),
			},
			function (err) {
				if (err) {
					console.log("Error scrobling a track:", err);
				}
			},
		);
	}
};
