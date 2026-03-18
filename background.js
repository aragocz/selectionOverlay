const browser = chrome; // For Chromium browser < 146
const timeregex = /^\W*(?:(?<TIME24>(?:[01]?\d|2[0-3])(?::[0-5]?\d){1,2})|(?:T?(?<TIMEUNI>(?:[01]?\d|2[0-3]):[0-5]?\d(?::[0-5]?\d)?)(?:(?<MODUNI>\+|\-)(?<UNIOFF>[01](?:1[0-4]|\d):[0-5]\d)))|(?:(?<TIME12>(?:(?:1[012])|[1-9]))(?::[0-5]?\d){0,2} ?(?<AMPM>AM|PM|am|pm))|(?:(?<TIMEOFF>(?:[01]?\d|2[0-3])(?::[0-5]?\d){0,2}) ?(?:(?:GMT|UTC|gmt|utc)(?<MODOFF>\+|\-)(?<OFF>(?:1[0-4]|\d)(?::[0-5]?\d){0,2})))) ?(?:(?<TZ>[A-Za-z]{1,4})|(?<TZLONG>(?:[A-Z][a-z]+ )+Time))?\W*$/;
const urlregex = /^\W*(?<URL>[a-z]+:\/{2,3}[a-z0-9-]+(?:\.[a-z0-9-]+)+(?:\/[a-z0-9-_.~?#&=;,!$'()*+%]*)*)\W*$/i;

try{
    const extid = browser.runtime.id;

    browser.runtime.onInstalled.addListener(() => {
        //browser.tabs.create({ url: "browser-extension://"+extid+"/extensibles/options.html"})
        //browser.storage.local.set({apikey: "YOURKEYHERE"})
    });

    
    browser.runtime.onMessage.addListener(handleMessages);
}catch(e) {console.log(e)}

function handleMessages(message, _sender, respond){

    switch(message.type){
        case "search":
            browser.search.query({disposition: "NEW_TAB", text: message.selection});
        break;

        case "check":
            respond(checkForSpecial(message.selection));
        break;
    }

    return true;
}

function checkForSpecial(data = ""){
    if(urlregex.test(data)){
        return {type:0x1, match: data.match(urlregex).groups.url};
    }else if(timeregex.test(data)){
        const match = data.match(timeregex);
        //CALCULATE TIME HERE
        const time = null;

        return {type:0x2, match: time}
    }
}

function convertTime(){

}