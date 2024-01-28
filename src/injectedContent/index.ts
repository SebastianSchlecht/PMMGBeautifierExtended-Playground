import Preferences from "./models/Preferences.ts";
import { CssStyleContent } from "./Styles.ts";
import {CX_DATA} from "./models/UserInfo.ts";
import {writeEphemeralStore} from "./persistence/DataStore.ts";
import BrowserStore, {chromeLoad, firefoxLoad} from "./persistence/BrowserStore.ts";
import {getCXPrices} from "./BackgroundRunner.ts";
import {ModuleRunner} from "./ModuleRunner.ts";
import {DummyModule} from "./modules/DummyModule.ts";


type Browser = "chromium" | "firefox";
const PREFERENCE_STORAGE_KEY = "PMMGExtended" as const;
const ALWAYS_UPDATE_FIO = false as const;

export function initialize() {
    tryInitializeFirefox()
        .catch(() => tryInitializeChrome())
        .catch(() => console.error("Could not initialize application"))
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
    writeEphemeralStore("BROWSER_STORE", browserStore);

    console.log(browserStore.load(["PMMGExtended", "CX_DATA"]))

    if (!preferences.PMMGExtended) {
        preferences.PMMGExtended = {};
    }

    if (!preferences.PMMGExtended.loaded_before) {
        console.log("First Time Loading PMMG");
    }

    // If no module states are specified, disable screen unpack by default
    if (!preferences.PMMGExtended.disabled) {
        //ToDO ScreenUnpack is the name of the module, use ScreenUnpack.name here
        preferences.PMMGExtended.disabled = ["ScreenUnpack"];
    }


    injectStylesheet("style", CssStyleContent.PMMGStyle);
    if (preferences.PMMGExtended.color_scheme === "enhanced" || !preferences.PMMGExtended.color_scheme) {
        injectStylesheet("enhanced-colors", CssStyleContent.EnhancedColors);
    } else if (preferences.PMMGExtended.color_scheme === "icons") {
        injectStylesheet("icon-colors", CssStyleContent.IconStyle);
    }

    if (preferences.PMMGExtended.advanced_mode) {
        injectStylesheet("advanced", CssStyleContent.AdvancedStyle);
    }

    if (preferences.PMMGExtended.chat_delete_hidden) {
        injectStylesheet("chat-delete-style", CssStyleContent.ChatDeleteStyle);
    }


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

    if(preferences.PMMGExtended.recording_financials && (!preferences.PMMGExtended.last_fin_recording || (Date.now() - preferences.PMMGExtended.last_fin_recording) > 64800000)) // 72000000
    {
        console.warn("Fin recording not implemented yet")
        //ToDo implement fin recording
        //window.setTimeout(() => calculateFinancials(webData, userInfo, result, true), 1000);
    }


    new ModuleRunner(
        preferences,
        [
            new DummyModule(),
        ]
    ).run();
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





initialize();