import {BrowserStore} from "../persistence/BrowserStore.ts";
import Preferences, {ColorScheme} from "../models/Preferences.ts";

//This DAO is special as the preferences will already be loaded on startup due to the initialisation of the BrowserStore
export class PreferenceDao {

    // @ts-ignore
    private browserStore: BrowserStore;
    private preferences: Preferences;

    constructor(browserStore: BrowserStore, preferences: Preferences) {
        this.browserStore = browserStore;
        this.preferences = preferences;

        if (!preferences.PMMGExtended) {
            preferences.PMMGExtended = {};
        }

        // If no module states are specified, disable screen unpack by default
        if (!preferences.PMMGExtended.disabled) {
            //ToDO ScreenUnpack is the name of the module, use ScreenUnpack.name here
            preferences.PMMGExtended.disabled = ["ScreenUnpack"];
        }
    }

    public isFirstStart(): boolean {
        return !this.preferences.PMMGExtended?.loaded_before;
    }

    public getColorScheme(): ColorScheme {
        return this.preferences.PMMGExtended?.color_scheme ?? "enhanced";
    }

    public isAdvancedMode(): boolean {
        return this.preferences.PMMGExtended?.advanced_mode ?? false;
    }

    public chatDeleteHidden(): boolean {
        return this.preferences.PMMGExtended?.chat_delete_hidden ?? false;
    }



}