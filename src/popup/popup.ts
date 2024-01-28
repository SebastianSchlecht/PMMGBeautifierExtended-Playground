import {CLEAR_BUTTON, LOADING_INDICATOR} from "./identifiers.ts";

const clearButton = document.getElementById(CLEAR_BUTTON);
const loadingIndicator = document.getElementById(LOADING_INDICATOR);

if (clearButton && loadingIndicator) {
    clearButton.addEventListener('click', function(){ OnClear_Click(); });
} else {
    onError("Error finding elements on startup");
}


function OnClear_Click()
{
    try
    {
        browser.storage.local.remove("PMMGExtended");
        browser.storage.local.remove("PMMG-Notes");
        browser.storage.local.remove("PMMG-Lists");
        browser.storage.local.remove("PMMG-Finances");
        browser.storage.local.remove("PMMG-User-Info");
        browser.storage.local.remove("PMMG-Checklists");


    }
    catch(err)
    {
        chrome.storage.local.remove("PMMGExtended");
        chrome.storage.local.remove("PMMG-Notes");
        chrome.storage.local.remove("PMMG-Lists");
        chrome.storage.local.remove("PMMG-Finances");
        chrome.storage.local.remove("PMMG-User-Info");
        chrome.storage.local.remove("PMMG-Checklists");

    }
}

function onError(error: any)
{
    console.log(error);
}

// function SetLoadingIndicator(isLoading)
// {
//     if(isLoading){
//         configureButton.disabled = true;
//         loadingIndicator.style.visibility = "visible";
//     }else{
//         configureButton.disabled = false;
//         loadingIndicator.style.visibility = "hidden";
//     }
// }
