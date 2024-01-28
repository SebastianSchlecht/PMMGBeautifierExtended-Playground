
export default interface UserInfo {
    CX_DATA?: CX_DATA
}

export interface CX_DATA {
    cx_price_age: number,
    cx_prices: CX_PRICE;
}

interface CX_PRICE {
    [cxName: string]: CX_INFO,
}

export const CX_DATA_CATEGORY = ["AskPrice" , "BidPrice" , "Average" , "AskAvail" , "BidAvail"] as const;
type CxDataCategoryType = typeof CX_DATA_CATEGORY[number];
//export BLA =

type CX_INFO = {
    [p in CxDataCategoryType]: ItemInfo;
};

interface ItemInfo {
    [ticker: string]: unknown;
}