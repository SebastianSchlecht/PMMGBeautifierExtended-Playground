import Preferences from "../models/Preferences.ts";
import UserInfo from "../models/UserInfo.ts";


type BrowserStorePreferenceKey = Partial<keyof Preferences | keyof UserInfo>;
export type BrowserStoreObject = {
    [a in BrowserStorePreferenceKey]?: any;
};


export type Browser = "chromium" | "firefox";
export type BrowserStore = {
    save: (data: BrowserStoreObject) => Promise<void>,
    load: (key: BrowserStorePreferenceKey | BrowserStorePreferenceKey[]) => Promise<ResultObject>,
    loadT: <T extends ResultObject>(key: BrowserStorePreferenceKey | BrowserStorePreferenceKey[]) => Promise<{ data: T, hasContent: boolean }>
}


export default function build(currentBrowser: Browser): BrowserStore {
    const genericLoad = async <T extends {}>(load: () => Promise<ResultObject>): Promise<{ data: T, hasContent: boolean }> => {
        const loadedData = await load() as T
        const hasContent = Object.keys(loadedData).length > 0;

        return { data: loadedData, hasContent }
    }

    if (currentBrowser === "chromium") {
        return {
            save: chromeSave,
            load: chromeLoad,
            loadT: (key) => genericLoad(() => chromeLoad(key))
        }
    } else {
        return {
            save: firefoxSave,
            load: firefoxLoad,
            loadT: <T>(key: BrowserStorePreferenceKey | BrowserStorePreferenceKey[]) => firefoxLoad(key) as T
        }
    }
}


export async function firefoxLoad(key: BrowserStorePreferenceKey | BrowserStorePreferenceKey[]): Promise<ResultObject> {
    return browser.storage.local.get(key);
}

export async function chromeLoad(key: BrowserStorePreferenceKey | BrowserStorePreferenceKey[]): Promise<ResultObject> {
    return chrome.storage.local.get(key)
}


export async function firefoxSave(data: {[p: string]: any}) {
    return browser.storage.local.set(data)
}

export async function chromeSave(data: {[p: string]: any}) {
    return chrome.storage.local.set(data)
}