const storage      = browser.storage.local;
const windowSys    = browser.windows;
const regexp       = /^[a-zA-Z0-9-_]+$/; // Alphanumeric, dash, underscore


const saveSession = (elm = null, message = "Session Name\nAllowed: a-z, A-Z, 0-9, -, _") => {
    let inputTag   = document.createElement("INPUT");
    inputTag.value = new Date().toLocaleString().split(',')[0].replace(/\//g, '-');

    if (elm !== null)
        inputTag.value = elm.innerText;

    windowSys.getAll({ populate: true, windowTypes: ["normal"] }).then((windows) => {
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

        let keys       = Object.keys(sessionData);
        let keysLength = Object.keys(sessionData).length;
        let container  = selectionWindow(sessionData, keys, keysLength);
        container.prepend(inputTag);

        swal(message, {
            content: container,
            buttons: true,
        }).then((value) => {
            if (value) {
                let enteryName = inputTag.value.replace(/ /g, "_");

                if (enteryName) {
                    if (enteryName.search(regexp) == -1) {
                        saveSession("Please try again...\nAllowed: a-z, A-Z, 0-9, -, _")
                        return ;
                    }

                    console.log("Saving session...");
                    sessionData = selectionData(container, keys, keysLength);
                    saveToStorage(enteryName, JSON.stringify(sessionData));
                } else {
                    messageWindow("warning", "Canceled save...");
                }
            } else {
                messageWindow("warning", "Canceled save...");
            }
        });
    });
}

const editSession = (elm = null, message = "Editing selected session...\nAllowed: a-z, A-Z, 0-9, -, _") => {
    let id             = elm.innerText;
    let inputTag       = document.createElement("INPUT");
    let checkedTag     = document.createElement("INPUT");
    let labelTag       = document.createElement("LABEL");
    let brTag          = document.createElement("BR");

    inputTag.value     = id;
    checkedTag.type    = "checkbox";
    checkedTag.id      = "newSession";
    checkedTag.checked = false;
    labelTag.innerText = "Create New Session";
    labelTag.htmlFor   = "newSession";

    storage.get(id).then((storageResults) => {
        let json        = JSON.parse(storageResults[id]);
        let keys        = Object.keys(json);
        let keysLength  = Object.keys(json).length;
        let container   = selectionWindow(json, keys, keysLength);
        container.prepend(labelTag);
        container.prepend(checkedTag);
        container.prepend(brTag);
        container.prepend(inputTag);

        swal(message, {
            content: container,
            buttons: true,
        }).then((value) => {
            if (value) {
                let newName = inputTag.value.replace(/ /g, "_");

                if (newName) {
                    if (newName.search(regexp) == -1) {
                        editSession("Please try again...\nAllowed: a-z, A-Z, 0-9, -, _")
                        return ;
                    }

                    json = selectionData(container, keys, keysLength);
                    if (checkedTag.checked) { // if creating from collection new session
                        if (newName !== elm.innerText) {
                            newName = checkSessionListForDuplicate(newName);
                            saveToStorage(newName, JSON.stringify(json), false);
                        } else { // enforce unique name
                            let min    = 1;
                            let max    = 200000;
                            var random = Math.floor(Math.random() * (+max - +min)) + +min;
                            newName += "-" + random + "-" + Math.floor(Math.random() * (+10 - +1)) + +1;
                            saveToStorage(newName, JSON.stringify(json), false);
                        }
                    } else {
                        if (newName !== elm.innerText) { // if not creating new session and diff name rename
                            newName = checkSessionListForDuplicate(newName);
                            storage.get(id).then((storageResults) => {
                                storage.remove(id);
                                saveToStorage(newName, JSON.stringify(json), true);
                            }).then(() => {
                                elm.textContent = newName;
                            });
                        } else { // just replace
                            saveToStorage(newName, JSON.stringify(json), true);
                        }
                    }
                } else {
                    messageWindow("warning", "Canceled edit...");
                }
            } else {
                messageWindow("warning", "Canceled edit...");
            }
        });
    });
}

const importSession = () => {
    browser.tabs.create({
      url: browser.extension.getURL("../pages/import.html"),
      active: true
    });
}

const downloadSession = (elm = null) => {
    let pTag         = document.createElement("P");
    let inputTag     = document.createElement("INPUT");
    let chkBoxTag    = document.createElement("INPUT");
    let lblTag       = document.createElement("LABEL");
    let brTag        = document.createElement("BR");
    var dlAnchorElem = document.getElementById('downloadAnchorElem');
    let text         = document.createTextNode("Append Date?");
    let id           = elm.innerText;
    let fileName     = "session:" + id + ".json";
    chkBoxTag.type   = "checkbox";
    inputTag.value   = fileName;
    chkBoxTag.id     = "chkbx";
    lblTag.htmlFor   = "chkbx";
    lblTag.append(text);
    pTag.append(lblTag);
    pTag.append(chkBoxTag);
    pTag.append(brTag);
    pTag.append(inputTag);

    swal("Download Session?", {
            content: pTag,
            buttons: true,
    }).then((willDl) => {
        if (willDl) {
            if (chkBoxTag.checked) {
                fileName = "session:" + id + ":" +
                     new Date().toLocaleString().split(',')[0].replace(/\//g, "-") + ".json";
            }

            storage.get(id).then((storageResults) => {
                let json    = JSON.parse(storageResults[id]);
                let dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(json));
                dlAnchorElem.setAttribute("href", dataStr);
                dlAnchorElem.setAttribute("download", fileName);
                dlAnchorElem.setAttribute("target", "");
                dlAnchorElem.click();
            });
        }
    });
}

const loadSession = (json = null, replaceTabs = false) => {
    console.log("Loading session...");
    let keys       = Object.keys(json);
    let keysLength = Object.keys(json).length;
    try {
        browser.windows.getAll().then(windows => {
            windowSys.getCurrent({populate: true}).then(currentWindow => {
                let wasCurrentTabId = null;

                if (replaceTabs) { // Clear all windows but main then load...
                    if (keysLength == 0) {
                        messageWindow("error", "Canceled operation; no tabs in session...");
                        return ;
                    }

                    for (let i = 0; i < windows.length; i++) {
                        if (currentWindow.id != windows[i].id) {
                            windowSys.remove(windows[i].id);
                        } else {
                            let ids = [];
                            currentWindow.tabs.forEach(tab => {
                                if (!tab.active) {
                                    ids.push(tab.id);
                                } else {
                                    wasCurrentTabId = tab.id;
                                }
                            });
                            browser.tabs.remove(ids);
                        }
                    }

                    // First load tabs to current window.
                    let store = json[keys[0]];
                    store.forEach(tab => {
                        browser.tabs.create({ url: tab.link });
                    });
                    browser.tabs.remove(wasCurrentTabId);

                    // If more than one window, load tabs to new windows.
                    if (keysLength > 1) {
                        windowMaker(1, keysLength, keys, json)
                    }
                } else { // Load into new windows...
                    if (keysLength == 1) {
                        windowMaker(0, keysLength, keys, json)
                    } else if (keysLength == 0) {
                        messageWindow("error", "Canceled operation; no tabs in session...");
                    }
                }
            });
        });
    } catch (e) { console.log(e); }
}

getSavedSessionIDs();
