import timezoneDict from "./timezoneDict.min.json" with {type: "json"};
const timeregex = /^\W*(?:(?<TIME24>(?:[01]?\d|2[0-3])(?::[0-5]?\d){1,2})|(?<TIMEUNI>T?(?:[01]?\d|2[0-3]):[0-5]?\d(?::[0-5]?\d)?(?:(?:\+|\-)(?:(?:1[0-4]|0\d):[0-5]\d)|Z))|(?:(?<TIME12>(?:(?:1[012])|[1-9]))(?::[0-5]?\d){0,2} ?(?<AMPM>AM|PM|am|pm))|(?:(?<TIMEOFF>(?:[01]?\d|2[0-3])(?::[0-5]?\d){0,2}) ?(?:(?:GMT|UTC|gmt|utc)(?<MODOFF>\+|\-)(?<OFF>(?:1[0-4]|\d)(?::[0-5]?\d){0,2})))) ?(?:(?<TZ>[A-Za-z]{1,4})|(?<TZLONG>(?:[A-Z][a-z]+ )+Time))?\W*$/;
const urlregex = /^\W*(?<PROTOCOL>[a-z]+:\/{2,3})?(?<URL>[a-z0-9-]+(?:\.[a-z0-9-]+)+(?:\/[a-z0-9-_.~?#&=;,!$'()*+%]*)*)\W*$/i;

const userlocale = "cs"

try{
    const extid = chrome.runtime.id;

    chrome.runtime.onInstalled.addListener(() => {
        //chrome.tabs.create({ url: "chrome-extension://"+extid+"/extensibles/options.html"})
        //chrome.storage.local.set({apikey: "YOURKEYHERE"})
        //chrome.storage.local.set({locale: Intl.DateTimeFormat()})
    });

    chrome.runtime.onStartup.addListener(async () => {
        if(!(await chrome.alarms.get("heartbeat"))){
            chrome.alarms.create("heartbeat", {
                periodInMinutes: 0.5
            })
        }
    })

    chrome.alarms.onAlarm.addListener((alarm) => {
        if(alarm.name == "heartbeat"){
            console.log("ack")
        }
    })

    chrome.runtime.onMessage.addListener(handleMessages);
}catch(e) {console.log(e)}

function handleMessages(message, _sender, respond){

    switch(message.type){
        case "search":
            chrome.search.query({disposition: "NEW_TAB", text: message.selection});
            respond(true);
        break;

        case "check":
            respond(checkForSpecial(message.selection));
        break;
    }

    return true;
}

function checkForSpecial(data = ""){
    if(urlregex.test(data)){
        const mg = data.match(urlregex).groups;

        //Assume HTTP when no protocol is found. In case HTTPS is supported, the webpage itself should handle redirection.
        return {type:0x1, match: (mg.PROTOCOL||"http://")+mg.URL};
    }else if(timeregex.test(data)){
        return {type:0x2, match: convertTime(data.match(timeregex).groups)}
    }else if(false){//else with nlp
        return {type:0x3};
    }else{
        return {type:0x0};
    }
}

function convertTime(time){
    let tem = Temporal.Now.zonedDateTimeISO(timezoneDict[(time["TZ"]||time["TZLONG"]||"").toUpperCase()]||Temporal.Now.timeZoneId());

    if(time["TIME24"]){
        tem = tem.withPlainTime(time["TIME24"]);
    }else if(time["TIMEUNI"]){
        return Temporal.Instant.from(Temporal.Now.plainDateISO().toString()+time["TIMEUNI"]).toLocaleString(userlocale, {timeStyle : "short"});
    }else if(time["TIME12"]){
        const split = time["TIME12"].split(":");
        let hour = parseInt(split[0])+(time["AMPM"]=="AM" ? 0 : 12);
        if(hour==24){
            tem.add("P1D");
            split[0] = (hour%24).toString();
        }
        tem = tem.withPlainTime(split.join(":"));
    }else if(time["TIMEOFF"]){
        const timeParsed = time["TIMEOFF"] + (/^\d\d:\d\d(?!:)(?!\d\d)/.test(time["TIMEOFF"]) ? "" : ":00");
        const offsplit = time["OFF"].split(":");
        const str = `T${time["MODOFF"]}${offsplit[0].padStart(2, "0")}:${offsplit[1].padStart(2, "0")}`;
        return Temporal.Instant.from(`${Temporal.Now.plainDateISO().toString()}${timeParsed}${str}`).toLocaleString(userlocale, {timeStyle : "short"});
    }

    return tem.toInstant().toLocaleString(userlocale, {timeStyle : "short"});
}