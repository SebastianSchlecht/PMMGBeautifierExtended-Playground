import {detectBrowser} from "@/persistence/BrowserStore.ts";
import {processMessage} from "./ApexMessageParser.ts";



function initialize() {
    const detectedBrowser = detectBrowser();
    const browserInstance = detectedBrowser === "chromium" ? chrome : browser;

    browserInstance.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
        if (changeInfo.status === 'complete' && /^https?:\/\/apex.prosperousuniverse.com/.test(tab.url ?? "")) {
            console.log("Injecting SW bridge");
            browserInstance.scripting
                .executeScript({
                    target: { tabId: tabId },
                    files: ["serviceWorkerBridge.js"]
                })
                .then(() => {
                    console.log("Injected the SW bridge");
                });
        }
    })


    browserInstance.runtime.onMessage.addListener((message) => {
        if (message.message === "pmmg_websocket_update" && typeof message.payload === "string") {
            //console.log("Received message from sniffer", message, sender)
            processMessage(message.payload)
            return false;
        } else {
            console.log("Received some other request", message);
            // What Object is that?
            //{
            //     "message": "prep_registration",
            //     "username": "frozenice"
            // }
        }
    })




    console.log("Started service worker for", detectedBrowser);
}



initialize();