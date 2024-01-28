
export default interface Preferences {
    "PMMGExtended"?: PMMGPreferences,
}

export interface PMMGPreferences {
    loaded_before?: boolean,
    disabled?: string[],
    color_scheme?: ColorScheme,
    advanced_mode?: boolean,
    chat_delete_hidden?: boolean,
    recording_financials?: boolean,
    fin_spreadsheet?: string,
    fin_sheet_name?: string,
    last_fin_recording?: number,
}


type ColorScheme = "enhanced" | "icons"
