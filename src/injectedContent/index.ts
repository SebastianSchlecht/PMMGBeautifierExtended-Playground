import Preferences from "./models/Preferences.ts";
import { CssStyleContent } from "./Styles.ts";
import {CX_DATA} from "./models/UserInfo.ts";
import {writeEphemeralStore} from "./persistence/DataStore.ts";
import BrowserStore, {chromeLoad, firefoxLoad, BrowserStore as BrowserStoreType} from "./persistence/BrowserStore.ts";
import {getCXPrices} from "./BackgroundRunner.ts";
import {ModuleRunner} from "./ModuleRunner.ts";
import {DummyModule} from "./modules/DummyModule.ts";
import {PreferenceDao} from "./dao/PreferenceDao.ts";
import {DaoHolder} from "./dao/DaoHolder.ts";


type Browser = "chromium" | "firefox";
const PREFERENCE_STORAGE_KEY = "PMMGExtended" as const;
const ALWAYS_UPDATE_FIO = false as const;

export function initialize() {
    tryInitializeFirefox()
        .catch(() => tryInitializeChrome())
        .catch((e) => console.error("Could not initialize application", e))
}


async function tryInitializeFirefox(): Promise<void> {
    const value = await firefoxLoad(PREFERENCE_STORAGE_KEY);
    runApplication(value, "firefox").then();
    return console.log("Firefox detected");
}

async function tryInitializeChrome(): Promise<void> {
    const value = await chromeLoad(PREFERENCE_STORAGE_KEY)
    console.log("Chromium detected");
    return runApplication(value, "chromium");
}

async function runApplication(preferences: Preferences, detectedBrowser: Browser) {
    console.log("Startup ", preferences, "inisde", detectedBrowser);
    const browserStore = BrowserStore(detectedBrowser);
    const daos = setupDaos(browserStore, preferences);
    //writeEphemeralStore("BROWSER_STORE", browserStore);

    console.log(browserStore.load(["PMMGExtended", "CX_DATA"]))


    if (daos.preferenceDao.isFirstStart()) {
        console.log("First Time Loading PMMG");
    }


    injectStylesheet("style", CssStyleContent.PMMGStyle);
    if (daos.preferenceDao.getColorScheme() === "enhanced") {
        injectStylesheet("enhanced-colors", CssStyleContent.EnhancedColors);
    } else if (daos.preferenceDao.getColorScheme() === "icons") {
        injectStylesheet("icon-colors", CssStyleContent.IconStyle);
    }

    if (daos.preferenceDao.isAdvancedMode()) {
        injectStylesheet("advanced", CssStyleContent.AdvancedStyle);
    }

    if (daos.preferenceDao.chatDeleteHidden()) {
        injectStylesheet("chat-delete-style", CssStyleContent.ChatDeleteStyle);
    }


    //ToDo This is a hack, remove
    const cxData = await browserStore.loadT<CX_DATA>("CX_DATA")
    if (cxData.hasContent) {
        writeEphemeralStore("CX_DATA", cxData.data);
    }

    // if (preferences.PMMGExtended.fin_sheet_name && preferences.PMMGExtended.fin_spreadsheet) {
    //     const sheetURL = preferences.PMMGExtended.fin_spreadsheet;
    //     const sheetName = preferences.PMMGExtended.fin_sheet_name;
    //     window.setTimeout(() => {
    //         getPrices(sheetURL, sheetName).then(wd => webData = wd)
    //     }, 1000);
    // }


    if (!cxData.hasContent || ALWAYS_UPDATE_FIO) {
        console.log("Updating CX data from fio in 1s");
        window.setTimeout(() => getCXPrices().then((cxData) => {
            //userInfo = { CX_DATA: cxData }
            console.log(cxData);
            browserStore.save({CX_DATA: cxData}).then();
        }), 1000);
    }

    //if(preferences.PMMGExtended.recording_financials && (!preferences.PMMGExtended.last_fin_recording || (Date.now() - preferences.PMMGExtended.last_fin_recording) > 64800000)) // 72000000
    //{
        //console.warn("Fin recording not implemented yet")
        //ToDo implement fin recording
        //window.setTimeout(() => calculateFinancials(webData, userInfo, result, true), 1000);
   // }


    //ToDO test if SW is needed
    window.addEventListener("message", function (event) {
        if (event.data.message && event.data.message === "pmmg_websocket_update") {
            console.log("XoXo test received some data here too!");
        }
    });

    new ModuleRunner(
        preferences,
        [
            new DummyModule(),
        ]
    ).run();
}

//We don't use a DI framework so we just cheekily bundle our dependencies and pass them around :)
function setupDaos(browserStore: BrowserStoreType, preferences: Preferences): DaoHolder {

    return {
        preferenceDao: new PreferenceDao(browserStore, preferences),
    }
}


function injectStylesheet(identifier: string, cssCode: string) {
    const elementId = `pmmg-${identifier}`;
    const headElement = document.querySelector("head");
    if (!headElement) {
        throw { name: "Not found", message: `Head element not found when injecting ${identifier}` };
    }
    if (document.getElementById(elementId)) {
        //Already created
        console.log("Tried to double insert css sheet", identifier)
        return;
    }

    const styleElement = document.createElement("style");
    styleElement.setAttribute("type", "text/css");
    styleElement.id = elementId;
    styleElement.textContent = cssCode;
    headElement.appendChild(styleElement);
}

function injectScript(scriptName: string) {
    const browserInstance = typeof browser === "undefined" ? chrome : browser;

    var s = document.createElement('script');
    s.src = browserInstance.runtime.getURL(scriptName);
    s.onload = function() {
        s.remove();
    };
    (document.head || document.documentElement).appendChild(s);
}



document.addEventListener("DOMContentLoaded", () => initialize())
injectScript("webSocketSniffer.js");

