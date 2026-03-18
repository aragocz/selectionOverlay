let selecting = false;
let selText = "";

const style = document.createElement("style");
style.textContent = `
  #selectionOverlay {
    position: absolute;
    z-index: 2147483647;
    /* Drop shadow applies nicely to the whole shape, including the triangle */
    filter: drop-shadow(0px 4px 8px rgba(0,0,0,0.3)); 
  }
  .ext-tooltip-container {
    display: flex;
    align-items: center;
    background-color: #232428; /* Dark grey from your image */
    border-radius: 6px;
    padding: 4px 6px;
  }
  .ext-tooltip-btn {
    cursor: pointer;
    color: #eab768; /* Orange-ish text */
    padding: 6px 12px;
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 14px;
    font-weight: 500;
    user-select: none;
    border-radius: 4px;
    transition: background-color 0.15s ease;
  }
  .ext-tooltip-btn:hover {
    background-color: #3b3d44; /* Lighter grey on hover */
  }
  .ext-tooltip-divider {
    width: 1px;
    height: 16px;
    background-color: rgba(255, 255, 255, 0.08); /* Subtle vertical line */
    margin: 0 2px;
  }
  .ext-tooltip-caret {
    width: 0;
    height: 0;
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-top: 8px solid #232428; /* Matches container background */
    margin: 0 auto;
    margin-top: -1px; /* Pulls it up slightly for a seamless connection */
  }
`;
document.head.appendChild(style);

const overlay = document.createElement("div");
overlay.id = "selectionOverlay";
overlay.innerHTML = `
  <div class="ext-tooltip-container">
    <div class="ext-tooltip-btn" id="ext-btn-search">Search</div>
    <div class="ext-tooltip-divider"></div>
    <div class="ext-tooltip-btn" id="ext-btn-copy">Copy</div>
  </div>
  <div class="ext-tooltip-caret"></div>
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

    const rect = selection.getRangeAt(0).getBoundingClientRect()

    if(selection.type == "Range" && selText != "" && rect.width > 0){
        createOverlay(rect);
    }
}

function createOverlay(rect){
    document.body.appendChild(overlay);
    overlay.style.left = (rect.left+window.scrollX+(rect.width/2)-(overlay.offsetWidth/2)).toString()+"px"
    overlay.style.top = (rect.top+window.scrollY-overlay.offsetHeight-14).toString()+"px"
}

function destroyOverlay(){
    if(!overlay.parentNode) return;
    document.body.removeChild(overlay);
}