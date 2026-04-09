let selecting = false;
let selText = "";
const ac = new AbortController();
let special = false;

const overlay = document.createElement("div");
overlay.id = "selectionOverlay";
overlay.classList
overlay.innerHTML = `
    <div class="ext-tooltip-container">
        <div id="ext-special" class="ext-hidden">
            <div class="ext-tooltip-btn" id="ext-btn-special"></div>
            <div class="ext-tooltip-divider"></div>
        </div>
        <div class="ext-tooltip-btn" id="ext-btn-search">Search</div>
        <div class="ext-tooltip-divider"></div>
        <div class="ext-tooltip-btn" id="ext-btn-copy">Copy</div>
    </div>
`;

overlay.addEventListener("mousedown", (e) => e.stopPropagation());
overlay.addEventListener("mouseup", (e) => e.stopPropagation());

//setTimeout(...,0) sends call to end of stack, allowing selectionchange to update before evalSelection fires
document.addEventListener("mouseup", () => {selecting = false;setTimeout(evalSelection, 0)});
document.addEventListener("mousedown", () => {selecting = true;destroyOverlay()});
document.addEventListener("selectionchange", () => {if(!selecting) evalSelection});
document.addEventListener("scroll", () => {if(!selecting) destroyOverlay()});

function evalSelection(){
    if(selecting) return;
    destroyOverlay();

    const selection = window.getSelection();
    selText = selection.toString().trim();

    if(selection.rangeCount <= 0) return;

    const rect = selection.getRangeAt(0).getBoundingClientRect();

    if(selection.type == "Range" && selText != "" && rect.width > 0){
        createOverlay(rect);
    }
}

function createOverlay(rect){
    document.body.appendChild(overlay);
    const container = overlay.querySelector(".ext-tooltip-container");

    sendExtensionMessage("check", {selection: window.getSelection().toString()}, (res) => {
        if(res.type == 0x0) return;
        special = true;
        overlay.querySelector("#ext-special").classList.remove("ext-hidden");
        const specbutton = document.querySelector("#ext-btn-special");
        switch(res.type){
            case 0x1:
                specbutton.innerHTML = "Open";
                specbutton.addEventListener("click", () => {
                    window.open(res.match, "_blank");
                }, {signal: ac.signal});
            break;

            case 0x2:
                specbutton.innerHTML = res.match;
            break;
        }
    });

    container.classList.remove("inverted");

    if(rect.top > overlay.offsetHeight+14){
        overlay.style.top = (rect.top+window.scrollY-overlay.offsetHeight-14).toString()+"px";
    }else {
        container.classList.add("inverted");
        overlay.style.top = (rect.bottom+window.scrollY+14).toString()+"px";
    }

    overlay.style.left = (rect.left+window.scrollX+(rect.width/2)-(overlay.offsetWidth/2)).toString()+"px";
    overlay.querySelector("#ext-btn-search").addEventListener("click", () => sendExtensionMessage("search", {selection: window.getSelection().toString()}, ()=>{}));
    overlay.querySelector("#ext-btn-copy").addEventListener("click", () => navigator.clipboard.writeText(window.getSelection().toString()).then(() => destroyOverlay()));

}

function destroyOverlay(){
    if(!overlay.parentNode) return;
    document.body.removeChild(overlay);

    if(special){
        overlay.querySelector("#ext-special").classList.add("ext-hidden");
        ac.abort(0);
        special = false;
    }
}

async function sendExtensionMessage(type, obj, cb){
    const payload = obj;
    payload.type = type;
    const res = await chrome.runtime.sendMessage(payload);
    
    cb(res);
}