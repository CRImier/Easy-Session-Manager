let selectedItem = null;


const messageWindow = (type = "warning", message = "No message passed in...", target = "") => {
    let pTag   = document.createElement("P");
    let text   = document.createTextNode(message);
    let gutter = document.getElementById("message-gutter");

    if (target !== "") {
        gutter = document.getElementById(target);
    }

    pTag.className = "alert alert-" + type;
    pTag.appendChild(text);
    gutter.prepend(pTag);

    setTimeout(function () {
        clearChildNodes(gutter);
    }, 3200);
}




// UI supporters

const loadContainer = (sessionData, keys, keysLength, divID) => {
    let container   = generateSelectionWindow(sessionData, keys, keysLength);
    let divElm      = document.getElementById(divID);
    container.className = "col";
    clearChildNodes(divElm);
    divElm.append(container);
    return container;
}






/*    Selection Process    */
const generateSelectionWindow = (json = "", keys = null, keysLength = 0) => {
    let container  = document.createElement("DIV");
    let ulTemplate = document.querySelector('#ulTemplate');
    let liTemplate = document.querySelector('#liTemplate');

    for (let i = 0; i < keysLength; i++) {
        let ulClone       = document.importNode(ulTemplate.content, true);
        let ulTag         = ulClone.querySelector('.collection');
        let h2Tag         = ulClone.querySelector('.ulHeader');
        let h2Txt         = document.createTextNode("Window: " + (i + 1));

        let selAll        = ulClone.querySelector('.selAll');
        let titleAll      = ulClone.querySelector('.titleAll');
        let ulLblTag      = ulClone.querySelector('.selAllLbl');
        let ulLblTag2     = ulClone.querySelector('.titleAllLbl');
        let store         = json[keys[i]];
        let  j            = 0;

        container.id      = "editSelectionContainer";
        selAll.id         = "selectAllWin" + i;
        titleAll.id       = "selectAllTitle" + i;
        ulLblTag.htmlFor  = "selectAllWin" + i;
        ulLblTag2.htmlFor = "selectAllTitle" + i;

        selAll.addEventListener("click", function (eve) {
            toggleSelect(eve.target, "Win" + i);
        });


        titleAll.addEventListener("click", function (eve) {
            toggleTitles(eve.target, "Win" + i);
        });



        h2Tag.prepend(h2Txt);
        store.forEach(tab => {
            let liClone    = document.importNode(liTemplate.content, true);
            let inptTag    = liClone.querySelector("input");
            // link lbl
            let lblTag     = liClone.querySelector(".linkLbl");
            let labelTxt   = document.createTextNode(tab.link);
            // title lbnl
            let lblTag2    = liClone.querySelector(".titleLbl");
            let labelTxt2  = document.createTextNode(tab.title);
            inptTag.id     = "Win" + i + "Li" + j;

            lblTag.htmlFor = "Win" + i + "Li" + j;
            lblTag.title   = tab.link;

            lblTag2.htmlFor = "Win" + i + "Li" + j;
            lblTag2.title   = tab.link;

            inptTag.setAttribute("name", "Win" + i);  // Used for toggle select all

            lblTag.appendChild(labelTxt);
            lblTag2.appendChild(labelTxt2);


            ulTag.appendChild(liClone);
            j++;
        });

        container.appendChild(ulClone);
    }

    return container;
}

const checkSessionListForDuplicate = (newName) => {
    let sessions = document.getElementById("savedSessions").querySelectorAll("li");
    for (var i = 0; i < sessions.length; i++) {
        if (sessions[i].innerText === newName) {
            let min    = 1;
            let max    = 200000;
            let random = Math.floor(Math.random() * (+max - +min)) + +min;
            newName += "-" + random + "-" + Math.floor(Math.random() * (+10 - +1)) + +1;
        }
    }
    return newName;
}

const appendToSavedSessionsList = (enteryName, storeSize) => {
    const text      = document.createTextNode(storeSize + "  |  " + enteryName);
    let liTag       = document.createElement("LI");
    liTag.className = "sessionLI";

    liTag.setAttribute("name", enteryName);
    liTag.append(text);
    document.getElementById("savedSessions").append(liTag);
}



// Generics

const getStoreSize = (session) => {
    let count = 0;
    try {
        const json  = JSON.parse(session);
        const keys  = Object.keys(json);
        keys.forEach(key => {
            count += json[key].length;

        });
        return count;
    } catch (e) { }

    return count;
}

const getSessionData = (windows) => {
    let sessionData = {};
    for (let i = 0; i < windows.length; i++) {
        let links = [];
        for (var ii = 0; ii < windows[i].tabs.length; ii++) {
            if (!windows[i].tabs[ii].url.includes("about:")) {
                links.push(
                    {"link" : windows[i].tabs[ii].url.trim(),
                    "title" : windows[i].tabs[ii].title.trim()}
                );
            }
        }
        sessionData["WindowID:" + windows[i].id] = links;
    }
    return sessionData;
}

const getSelectionData = (container = null, keys = null, keysLength = 0) => {
    let sessionData = {};
    let ulTags = container.querySelectorAll("ul");

    for (let i = 0; i < keysLength; i++) {
        let links = [];

        for (var ii = 0; ii < ulTags[i].children.length; ii++) {
            let li = ulTags[i].children[ii];
            if (li.children[0].checked) {
                links.push(
                    {"link" : li.children[1].title.trim(),
                     "title" : li.children[2].innerText.trim()
                    }
                );
            }
        }

        if (links.length > 0) {
            sessionData[keys[i]] = links;
        }
    }

    return sessionData;
}

const deselectAll = (container = null) => {
    let selAlls = container.querySelectorAll('.selAll');
    for (var i = 0; i < selAlls.length; i++) {
        var selAll = selAlls[i];
        selAll.checked = false;
        toggleSelect(selAll, "Win" + i);
    }
}

const doUrlAction = (url = "https://www.paypal.me/ITDominator", fileName = "", isDownload = false) => {
    let aTagElm = document.getElementById('downloadAnchorElem');
    aTagElm.setAttribute("href", url);

    if (isDownload)
        aTagElm.setAttribute("download", fileName);

    aTagElm.setAttribute("_blank", "");
    aTagElm.click();
}




const showModal = async (modalID = "saveModal") => {
    tween(1600, "up", modalID); // in miliseconds
}

const hideModal = (modalID = "saveModal") => {
    tween(1600, "down", modalID); // in miliseconds
}

const tween = async (miliseconds, direction, modalID) => {
    const elm      = document.getElementById(modalID);
    const timeStep =  1000 / miliseconds;
    const steps    = timeStep * 100

    if (direction == "up") { // Go up
        elm.style.display = "";
        // elm.style.opacity = "1";
        for (var i = 1; i <= steps; i++) {
            await sleep(timeStep);
            elm.style.opacity = i/steps;
        }
    } else { // Go down
        for (var i = steps; i > 1; i--) {
            await sleep(timeStep);
            elm.style.opacity = i/steps;
        }
        // elm.style.opacity = "0";
        elm.style.display = "none";
    }

}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


const importSession = () => {
    browser.tabs.create({
      url: browser.extension.getURL("../pages/import.html"),
      active: true
    });
}

const toggleSelect = (source, name) => {
    let checkboxes = document.getElementsByName(name);
    for (let i = 0; i < checkboxes.length; i++) {
        checkboxes[i].checked = source.checked;
    }
}

const toggleTitles = (source, name) => {
    let checkboxes = document.getElementsByName(name);
    for (let i = 0; i < checkboxes.length; i++) {
        const parent = checkboxes[i].parentElement;
        const lElm   = parent.querySelector(".linkLbl");
        const tElm   = parent.querySelector(".titleLbl");

        if (tElm.style.display !== "none") {
            tElm.style.display = "none";
            lElm.style.display = "";
        } else {
            tElm.style.display = "";
            lElm.style.display = "none";
        }
    }
}

const clearChildNodes = (parent) => {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}
