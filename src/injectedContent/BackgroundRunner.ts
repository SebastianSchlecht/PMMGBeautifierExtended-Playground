import WebData from "./models/WebData.ts";
import {CX_DATA, CX_DATA_CATEGORY} from "./models/UserInfo.ts";

const SECONDS = 1000;

export async function getPrices(sheetURL: string, sheetName: string): Promise<WebData> {
    return new Promise((resolve, reject) => {
        // Parse the URL
        const sheetID = sheetURL.match(/\/d\/([^\/]+)/);
        if (!sheetID || !sheetID[1])
        {
            return reject();
        }

        const xhr = new XMLHttpRequest();
        xhr.ontimeout = () => {
            console.error("PMMG", "Custom Prices Timeout");
            reject();
        }
        xhr.onerror = () => reject();
        xhr.onreadystatechange = () => {
            if (xhr.readyState == XMLHttpRequest.DONE) {
                const webData = parsePriceData();
                webData ? resolve(webData) : reject();
            }
        }

        const address = "https://script.google.com/macros/s/AKfycbwdxGx-OBVslFeXSSv-F_d55X_BTPs20vTMNiT8D9eIAkbcckXh9XAkX9fdBMIv1XrY/exec?id=" + sheetID[1] + "&sheet=" + sheetName;
        xhr.timeout = 10 * SECONDS;
        xhr.open("GET", address, true);
        xhr.send(null);


        function parsePriceData() {
            try {
                const priceData = JSON.parse(xhr.responseText);
                if (priceData.error) {
                    console.error("PMMG", "Custom prices", priceData.error);
                    return
                }
                if (!priceData.prices) {
                    console.warn("PMMG: No Data from Custom Prices");
                }


                const webData: WebData = { custom_prices: {} };
                priceData.prices.forEach((price: any) => {
                    webData.custom_prices[price[0]] = price[1]
                });
                console.log("WebData Prices", webData.custom_prices);
                return webData;
            } catch (e) {
                console.error("PMMG", "Received bad data from custom prices");
            }
        }
    })
}

export async function getCXPrices(): Promise<CX_DATA> {

    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.ontimeout = () => {
            console.error("PMMG", "Custom Prices Timeout");
            return reject();
        }
        xhr.onreadystatechange = () => {
            if (xhr.readyState == XMLHttpRequest.DONE) {
                const parsedPriceData = parsePriceData();
                if (parsedPriceData !== undefined) {
                    resolve(parsedPriceData);
                } else {
                    reject();
                }
            }
        }

        xhr.onerror = () => {
            reject();
        }

        const address = "https://rest.fnar.net" + "/rain/prices";
        xhr.timeout = 10 * SECONDS;
        xhr.open("GET", address, true);
        xhr.send(null);



        function parsePriceData() {
            console.log("PMMG: Retrieved CX Prices");

            const CXs = ["AI1", "CI1", "CI2", "IC1", "NC1", "NC2"]; // All the CXs

            try {
                const priceData = JSON.parse(xhr.responseText);
                const cxData: CX_DATA = { cx_prices: {}, cx_price_age: Date.now() };

                CXs.forEach((CX) => {
                    cxData.cx_prices[CX] = { AskPrice: {}, BidPrice: {}, AskAvail: {}, BidAvail: {}, Average: {} };
                    CX_DATA_CATEGORY.forEach((category) => {
                        cxData.cx_prices[CX][category] = {};
                        priceData.forEach((mat: any) => {
                            const ticker = mat["Ticker"] as string;
                            cxData.cx_prices[CX][category][ticker] = mat[CX + "-" + category];
                        })
                    })
                });

                return cxData;
            } catch (e) {
                console.log("PMMG: Bad Data from Rain Prices");
                return undefined;
            }
        }
    })
}