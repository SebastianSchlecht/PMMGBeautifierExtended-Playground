
const store: { [p: string]: unknown } = {}


export type STORE_KEYS =
    "CX_DATA" |
    "BROWSER_STORE";


export function readEphemeralStoreUnsafe<T>(key: string): T | undefined {
    return store[key] as T | undefined;
}

export function writeEphemeralStoreUnsafe(key: string, value: any) {
    store[key] = value;
}

export function ephemeralStoreHas(key: STORE_KEYS): boolean {
    return key in store;
}

export function readEphemeralStore<T>(key: STORE_KEYS): T | undefined {
    return store[key] as T | undefined;
}

export function writeEphemeralStore(key: STORE_KEYS, value: any) {
    store[key] = value;
}