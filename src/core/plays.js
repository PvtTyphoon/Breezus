const BreezusCommand = require("../../classes/command");
const BreezusEmbed = require("../../classes/breezusEmbed");
const rp = require("request-promise");
const { stripIndents } = require("common-tags");
const { apiRoot, keys } = require("../../config.json");
const { handleError } = require("../../errorHandling/errorHandling");
const { notFound } = require("../../errorHandling/customErrors");
const { getUser } = require("../../util/chartsUserGetter");
const { msToTS } = require("../../util/Util");
const modes = ["album", "artist"];

module.exports = class playsCommand extends BreezusCommand {
  constructor(client) {
    super(client, {
      name: "plays",
      aliases: ["play", "fav", "favs", "favourites"],
      group: "core",
      memberName: "plays",
      description: stripIndents`
      Searches for an artist or album on last.fm and displays top played albums or tracks.
      \`\`\`Example Usage: .plays [artist|album] [query]\`\`\`
      `,
    });
  }

  async run(message) {
    message.channel.startTyping();
    message.channel.stopTyping();
    const args = message.content.trim().split("|")[0].split(/ +/g).slice(1);
    if (!args[1]) return message.reply(`Missing parameters.`);
    if (!modes.includes(args[0].toLowerCase()))
      return message.reply(
        `${args[0]} is not a valid query type.  Use either album or artist.`
      );
    const query = args.slice(1).join(" ");
    try {
      var userData = await getUser(message);
      var data;
      switch (args[0].toLowerCase()) {
        case "album":
          data = await this.fetchAlbumData(query, userData.user);
          break;
        case "artist":
          data = await this.fetchArtistData(query, userData.user);
          break;
      }
      var lb = [];
      for (let i = 0; i < data.data.length; i++) {
        lb.push(`${i + 1}. ${data.data[i]}`);
      }
      const embed = new BreezusEmbed(message)
        .setDescription(
          stripIndents`
      \`\`\`${data.description}\`\`\`
      ${lb.join("\n")}
      `
        )
        .addField("Last.fm Page", `[Page Link.](${data.url})`, false);
      message.channel.send({ embed });
    } catch (err) {
      handleError(err, message);
      return;
    }
  }

  async fetchAlbumData(query, user) {
    var validateOptions = {
      uri: apiRoot,
      json: true,
      qs: {
        method: "album.search",
        album: query,
        api_key: keys[0],
        format: "json",
        limit: "1",
      },
    };
    const validateAlbum = await rp(validateOptions);
    if (!validateAlbum.results.albummatches.album.length)
      throw new notFound(query);
    var options = {
      uri: apiRoot,
      json: true,
      qs: {
        method: "album.getInfo",
        album: validateAlbum.results.albummatches.album[0].name,
        artist: validateAlbum.results.albummatches.album[0].artist,
        user: user,
        api_key: keys[1],
        format: "json",
        limit: "1",
      },
    };
    const rData = await rp(options);
    var trackOptions = {
      uri: apiRoot,
      json: true,
      qs: {
        method: "track.getInfo",
        user: user,
        artist: rData.album.artist,
        api_key: keys[1],
        format: "json",
        limit: "1",
      },
    };
    var tracks = [];
    for (let i = 0; i < rData.album.tracks.track.length; i++) {
      trackOptions.qs.track = rData.album.tracks.track[i].name;
      const tData = await rp(trackOptions);
      tracks.push({
        dTag: `\`${tData.track.name}\`: ${
          tData.track.userplaycount
        } plays \`${msToTS(rData.album.tracks.track[i].duration * 1000)}\``,
        sort: tData.track.userplaycount,
      });
    }
    tracks.sort(function (a, b) {
      return b.sort - a.sort;
    });
    var tracks = tracks.map((tracks) => tracks.dTag);
    var data = {
      data: tracks,
      description: stripIndents`
      ${user}'s plays for ${
        validateAlbum.results.albummatches.album[0].name
      } by ${validateAlbum.results.albummatches.album[0].artist}.
      ${user} has ${rData.album.userplaycount} plays, which account for ${
        ((rData.album.userplaycount / rData.album.playcount) * 100).toFixed(5)
      }% of global plays (${rData.album.playcount} plays)
      `,
      url: validateAlbum.results.albummatches.album[0].url,
    };
    return data;
  }
  async fetchArtistData(query, user) {
    var validateOptions = {
      uri: apiRoot,
      json: true,
      qs: {
        method: "artist.search",
        artist: query,
        api_key: keys[0],
        format: "json",
        limit: "1",
      },
    };
    const validateArtist = await rp(validateOptions);
    if (!validateArtist.results.artistmatches.artist.length)
      throw new notFound(query);
    var options = {
      uri: apiRoot,
      json: true,
      qs: {
        method: "artist.getTopAlbums",
        artist: validateArtist.results.artistmatches.artist[0].name,
        user: user,
        api_key: keys[1],
        format: "json",
      },
    };
    const rData = await rp(options);
    var albumOptions = {
      uri: apiRoot,
      json: true,
      qs: {
        method: "album.getInfo",
        artist: validateArtist.results.artistmatches.artist[0].name,
        user: user,
        api_key: keys[1],
        format: "json",
        limit: "1",
      },
    };
    const aData = await rp(albumOptions);
    var albums = [];
    for (let i = 0; i < rData.topalbums.album.length; i++) {
      albumOptions.qs.album = rData.topalbums.album[i].name;
      const aData = await rp(albumOptions);
      if (aData.album.userplaycount > 0) {
        albums.push({
          dTag: `\`${aData.album.name}\`: ${aData.album.userplaycount} plays`,
          sort: aData.album.userplaycount,
        });
      }
    }
    albums.sort(function (a, b) {
      return b.sort - a.sort;
    });
    var albums = albums.map((albums) => albums.dTag);
    var data = {
      data: albums,
      description: stripIndents`
      ${user}'s plays for ${validateArtist.results.artistmatches.artist[0].name}.`,
      url: validateArtist.results.artistmatches.artist[0].url,
    };
    return data;
  }
};
