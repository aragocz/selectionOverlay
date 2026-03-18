try{
    const extid = browser.runtime.id;
    var currtab;
    var currurl;
    var attackurl;
    var tabiddd;


    browser.runtime.onInstalled.addListener(() => {
        //browser.tabs.create({ url: "browser-extension://"+extid+"/extensibles/options.html"})
        //browser.storage.local.set({apikey: "YOURKEYHERE"})
    });

    function pageLoad(tabId, changeInfo, tab){
        /*if(changeInfo.status === "complete"){
            
        }*/
       tab
    }

    browser.tabs.onUpdated.addListener(pageLoad)

}catch(e) {console.log(e)}


