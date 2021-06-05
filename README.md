# A custom Last.fm Discord bot

<p align="center">
<img alt="breezus" src="https://never-gonna.go-get-a.life/CrFhcT.png" />
  
![](https://img.shields.io/badge/Breezus-3.1-658eff?style=for-the-badge)
![](https://img.shields.io/aur/license/android-studio?color=00ffcc&style=for-the-badge)
![](https://img.shields.io/npm/v/npm?style=for-the-badge)
![](https://img.shields.io/npm/v/discord.js-commando?color=f10041&label=discord.js-commando&style=for-the-badge)
![](https://img.shields.io/npm/v/discord.js?color=658fff&label=discord.js&style=for-the-badge)
![](https://img.shields.io/npm/v/request-promise?color=ff00ff&label=request-promise&style=for-the-badge)
![](https://forthebadge.com/images/badges/fuck-it-ship-it.svg)
[![Codacy Badge](https://app.codacy.com/project/badge/Grade/f4b2dbdbc4a04b47ad014158774d2669)](https://www.codacy.com/manual/PvtTyphoon/Breezus?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=PvtTyphoon/Breezus&amp;utm_campaign=Badge_Grade)
<img alt="code style: prettier" src="https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square">
<a href="https://gitter.im/jlongster/prettier"> </a>

</p>

### Breezus is a custom [last.fm](https://www.last.fm/home) Discord bot that is self hosted for only a few private servers, this closed availability has lead to a lot of questionable choices that will be explained in a later part of this README file.  Also a forewarning:

> The code in this repo is chaos and spaghetti, served with a side of timeless uncertainty.  Timeless because this is a side project that I do not actively work on.  I add new features and iron out bugs whenever I have the free time to do so, this rushed attitude has given birth to this mess of inefficient code.  There is also a shocking lack of comments in this repo, this is because all of these commands are just simple fetch requests slapped onto a Discord embed, there's nothing here even vaguely confusing so comments have been excluded to save time.  Feel free to criticize this decision but it is a justified one. 


__**This proect has been licensed under the [Apache 2.0 License.](https://www.apache.org/licenses/LICENSE-2.0) Feel free to fuck with this shit code, dont bother with credit if you use any part of it, I'm ashamed of it anyway.**__

### Useful links:

> Breezus Statuspage: [You can find Breezus' current status here.](https://breezus.statuspage.io/)
>
> Trello board: [Breezus' Trello Board](https://trello.com/b/MpeQKBPB/breezus)
>
> My last.fm profile: [TyphoonsNotABot](https://www.last.fm/user/TyphoonsNotABot)
>
> The last.fm API docs (useless and outdated): [API Documentation](https://www.last.fm/api)
>
> The fetch library used by Breezus: [request-promise](https://www.npmjs.com/package/request-promise)
>
> The Discord API wrapper used: [Discord.js](https://discord.js.org/)
>
> The Discord.js framework this project uses: [Discord.js Commando](https://github.com/discordjs/Commando)

**A rough changelog will be provided with every release on the releases page.**

## Questionable UX decisions.
> Since this is a bot hosted for a select few, command syntax is based on what Breezus users find most convenient, I did not cater this bot to what makes sense, its a shitpost, treat it as such. 

![](https://raw.githubusercontent.com/PvtTyphoon/Breezus/5008b83aa2aaae2ec4637d835cd5249fdd2552e4/assets/svg/audioscrobbler.svg)
