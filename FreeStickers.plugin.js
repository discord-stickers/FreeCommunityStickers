/**
 * @name FreeStickers
 * @authorLink https://github.com/discord-stickers
 * @website https://github.com/discord-stickers/FreeStickers
 * @source https://github.com/discord-stickers/FreeStickers/FreeStickers.plugin.js
 */
/*@cc_on
@if (@_jscript)
	
	// Offer to self-install for clueless users that try to run this directly.
	var shell = WScript.CreateObject("WScript.Shell");
	var fs = new ActiveXObject("Scripting.FileSystemObject");
	var pathPlugins = shell.ExpandEnvironmentStrings("%APPDATA%\BetterDiscord\plugins");
	var pathSelf = WScript.ScriptFullName;
	// Put the user at ease by addressing them in the first person
	shell.Popup("It looks like you've mistakenly tried to run me directly. \n(Don't do that!)", 0, "I'm a plugin for BetterDiscord", 0x30);
	if (fs.GetParentFolderName(pathSelf) === fs.GetAbsolutePathName(pathPlugins)) {
		shell.Popup("I'm in the correct folder already.", 0, "I'm already installed", 0x40);
	} else if (!fs.FolderExists(pathPlugins)) {
		shell.Popup("I can't find the BetterDiscord plugins folder.\nAre you sure it's even installed?", 0, "Can't install myself", 0x10);
	} else if (shell.Popup("Should I copy myself to BetterDiscord's plugins folder for you?", 0, "Do you need some help?", 0x34) === 6) {
		fs.CopyFile(pathSelf, fs.BuildPath(pathPlugins, fs.GetFileName(pathSelf)), true);
		// Show the user where to put plugins in the future
		shell.Exec("explorer " + pathPlugins);
		shell.Popup("I'm installed!", 0, "Successfully installed", 0x40);
	}
	WScript.Quit();

@else@*/

module.exports = (() => {
    const config = {"info":{"name":"FreeStickers","authors":[{"name":"lemons","discord_id":"407348579376693260","github_username":"respecting"}, {"name":"creatable","discord_id":"597905003717459968","github_username":"Cr3atable"}],"version":"1.0.0","description":"Unlocking Discord Stickers for everyone.","github":"https://github.com/discord-stickers/FreeStickers","github_raw":"https://github.com/discord-stickers/FreeStickers/FreeStickers.plugin.js"},"main":"index.js"};

    return !global.ZeresPluginLibrary ? class {
        constructor() {this._config = config;}
        getName() {return config.info.name;}
        getAuthor() {return config.info.authors.map(a => a.name).join(", ");}
        getDescription() {return config.info.description;}
        getVersion() {return config.info.version;}
        load() {
            BdApi.showConfirmationModal("Library Missing", `The library plugin needed for ${config.info.name} is missing. Please click Download Now to install it.`, {
                confirmText: "Download Now",
                cancelText: "Cancel",
                onConfirm: () => {
                    require("request").get("https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js", async (error, response, body) => {
                        if (error) return require("electron").shell.openExternal("https://betterdiscord.net/ghdl?url=https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js");
                        await new Promise(r => require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0PluginLibrary.plugin.js"), body, r));
                    });
                }
            });
        }
        start() {}
        stop() {}
    } : (([Plugin, Api]) => {
        const plugin = (Plugin, Library) => {

    const {Patcher, WebpackModules, DiscordAPI, Toasts} = Library;

    return class FreeStickers extends Plugin {
        constructor() {
            super();
        }

        onStart() {
            const { ComponentDispatch } = WebpackModules.getByProps('ComponentDispatch');
            if (DiscordAPI.currentUser.discordObject.premiumType == 2) return Toasts.error("You cannot use FreeStickers with Nitro currently.");

            let packs,
            ids
            fetch("https://cdn.jsdelivr.net/gh/discord-stickers/FreeStickers@main/packs.json").then(r=>r.json()).then(j=>packs=j);
            fetch("https://cdn.jsdelivr.net/gh/discord-stickers/FreeStickers@main/stickerIds.json").then(r=>r.json()).then(j=>ids=j)
            Patcher.instead(WebpackModules.getByProps("getStickerAssetUrl"), "getStickerAssetUrl", (_, [args], orig) => {
                if (ids[args.id]) return ids[args.id]
                return orig(args);
            })
            Patcher.before(WebpackModules.getByProps("useStickersGrid"), "useStickersGrid", (_, [args]) => {
                if (args.stickersCategories.length != 32) {
                    packs.forEach(pack => args.stickersCategories.push(pack))
                    console.log(args.stickersCategories)
                    args.listWidth = 360
                }
            })
            Patcher.before(WebpackModules.getByProps("isSendableSticker"), "isSendableSticker", (_, [args]) => {
                if (args.free_stickers) {
                    WebpackModules.getByProps("closeExpressionPicker").closeExpressionPicker()
                    return ComponentDispatch.dispatchToLastSubscribed("INSERT_TEXT", {
                        content: " "+WebpackModules.getByProps("getStickerAssetUrl").getStickerAssetUrl(args) 
                    })
                }
            })
            BdApi.injectCSS("clean", `.header-2k4I2o {display: none;} .categoryList-xW5xXr {display: none;} .wrapper-2iFQJ9 {grid-template-columns: 0px;} .row-2psonc {column-gap: 50px !important;} #sticker-picker-grid > div > div.scroller-3gAZLs.thin-1ybCId.scrollerBase-289Jih > div.listItems-1uJgMC {left: 14px !important;}`)
        }

        onStop() {
            Patcher.unpatchAll();
            BdApi.clearCSS("clean")
        }
    }
};
        return plugin(Plugin, Api);
    })(global.ZeresPluginLibrary.buildPlugin(config));
})();
/*@end@*/