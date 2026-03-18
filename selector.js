let selecting = false;
let selText = "";

const overlay = document.createElement("div");
overlay.id = "selectionOverlay";
overlay.innerHTML = `
    <div class="ext-tooltip-container">
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
    sendExtensionMessage({selection: window.getSelection().toString()}, (res) => {
        console.log(res);
    });
    

    document.body.appendChild(overlay);
    const container = overlay.querySelector(".ext-tooltip-container");

    container.classList.remove("inverted");

    if(rect.top > overlay.offsetHeight+14){
        overlay.style.top = (rect.top+window.scrollY-overlay.offsetHeight-14).toString()+"px";
    }else {
        container.classList.add("inverted");
        overlay.style.top = (rect.bottom+window.scrollY+14).toString()+"px";
    }

    overlay.style.left = (rect.left+window.scrollX+(rect.width/2)-(overlay.offsetWidth/2)).toString()+"px";
}

function destroyOverlay(){
    if(!overlay.parentNode) return;
    document.body.removeChild(overlay);
}

async function sendExtensionMessage(type, obj, cb){
    const payload = new Object.fromEntries(obj);
    payload.type = type;
    const browser = chrome;
    const res = await browser.runtime.sendMessage(payload);
    cb(res);
}