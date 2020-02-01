let selectedItem = null;

// UI supporters

/*    Selection Process    */
const generateSelectionWindow = (json = "", keys = null, keysLength = 0) => {
    let container  = document.createElement("DIV");
    let ulTemplate = document.querySelector('#ulTemplate');
    let liTemplate = document.querySelector('#liTemplate');

    for (let i = 0; i < keysLength; i++) {
        let ulClone      = document.importNode(ulTemplate.content, true);
        let ulTag        = ulClone.querySelector('.collection');
        let selAll       = ulClone.querySelector('input');
        let h2Tag        = ulClone.querySelector('.ulHeader');
        let ulLblTag     = ulClone.querySelector('label');
        let h2Txt        = document.createTextNode("Window: " + (i + 1));
        let store        = json[keys[i]];
        let  j           = 0;

        container.id     = "editSelectionContainer";
        selAll.id        = "selectAllWin" + i;
        ulLblTag.htmlFor = "selectAllWin" + i;
        selAll.addEventListener("click", function (eve) {
            toggleSelect(eve.target, "Win" + i);
        });
        h2Tag.appendChild(h2Txt);

        store.forEach(tab => {
            let liClone    = document.importNode(liTemplate.content, true);
            let inptTag    = liClone.querySelector("input");
            let lblTag     = liClone.querySelector("label");
            let labelTxt   = document.createTextNode(tab.link);
            inptTag.id     = "Win" + i + "Li" + j;
            lblTag.htmlFor = "Win" + i + "Li" + j;
            lblTag.title   = tab.link;
            inptTag.setAttribute("name", "Win" + i);  // Used for toggle select all
            lblTag.appendChild(labelTxt);
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

const appendToSavedSessionsList = (enteryName) => {
    let liTag       = document.createElement("LI");
    let text        = document.createTextNode(enteryName.trim());
    liTag.className = "sessionLI";

    liTag.setAttribute("name", enteryName.trim());
    liTag.append(text);
    document.getElementById("savedSessions").append(liTag);
}



// Generics

const getSessionData = (windows) => {
    let sessionData = {};
    for (let i = 0; i < windows.length; i++) {
        let links = [];
        for (var ii = 0; ii < windows[i].tabs.length; ii++) {
            if (!windows[i].tabs[ii].url.includes("about:")) {
                links.push(
                    {"link" : windows[i].tabs[ii].url.trim()}
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
                    {"link" : li.children[1].innerText.trim()}
                );
            }
        }

        if (links.length > 0) {
            sessionData[keys[i]] = links;
        }
    }

    return sessionData;
}

const doUrlAction = (url = "https://www.paypal.me/ITDominator", fileName = "", isDownload = false) => {
    let aTagElm = document.getElementById('downloadAnchorElem');
    aTagElm.setAttribute("href", url);

    if (isDownload)
        aTagElm.setAttribute("download", fileName);

    aTagElm.setAttribute("_blank", "");
    aTagElm.click();
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
