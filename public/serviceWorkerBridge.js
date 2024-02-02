// Listen for window.postMessage events from the webpage,
// pass them on to the extension's service worker.
// This can't go direct from webpage to service worker, hence
// the addition of this intermediary.
const browserRef = typeof browser === "undefined" ? chrome : browser;


let func;
if(typeof listen === "undefined")
{
    function listen(event)
    {
        if (event.source !== window)
            return;

        if (event.data.message && event.data.message === "pmmg_websocket_update") {
            browserRef.runtime.sendMessage({
                message: "pmmg_websocket_update",
                payload: event.data.payload
            });
        }
        if (event.data.message && event.data.message === "prep_registration") {
            browserRef.runtime.sendMessage(event.data);
        }
    }
    func = listen;
}
else
{
    func = listen;
}


window.removeEventListener("message", func);
window.addEventListener("message", func);

chrome.runtime.connect().onDisconnect.addListener(() => {
    console.warn("SW bridge broken!")
    window.removeEventListener("message", func);
})
