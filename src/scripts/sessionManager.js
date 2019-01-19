const regexp       = /^[a-zA-Z0-9-_]+$/; // Alphanumeric, dash, underscore
const storage      = browser.storage.local;
const windowSys    = browser.windows;

const alertMessage = (type, message) => {
    let msgTag    = document.getElementById("allertMessage");
    let text      = document.createTextNode(message);
    let fontColor = "rgba(255, 255, 255, 1)";
    let bgColor   = "";

    if (type === "success") {
        bgColor   = "rgba(72, 125, 25, 1)";
    } else if (type === "warning") {
        bgColor   = "rgba(195, 123, 0, 1)";
    } else if (type === "error") {
        bgColor   = "rgba(125, 45, 25, 1)";
    }

    msgTag.style.backgroundColor = bgColor;
    msgTag.style.color           = fontColor;
    msgTag.style.display         = "block";
    msgTag.append(text);

    setTimeout(function () {
        let msgTag           = document.getElementById("allertMessage");
        msgTag.innerHTML     = "";
        msgTag.style.display = "none";
    }, 3000);
}

const saveSession = () => {
    let enteryName = '';

    do {
        enteryName = prompt("What is this session's name? Allowed: a-z, A-Z, -, _",
                            new Date().toLocaleString().split(',')[0].replace(/\//g, '-'));
        if (enteryName == null) break
    } while (enteryName.search(regexp) == -1);

    if (enteryName) {
        console.log("Saving session...");
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
            saveToStorage(enteryName, JSON.stringify(sessionData));
        }).then(() => {
            if (document.getElementsByName(enteryName).length == 0) {
                appendToSavedSessionsList(enteryName);
            }
        });
    } else {
        alertMessage("warning", "Canceled save...");
    }
}

const saveToStorage = (name, data) => {
    storage.set({[name]: data});
    alertMessage("success", "Saved session...");
}

const importSession = () => {
    browser.tabs.create({
      url: browser.extension.getURL("../pages/import.html"),
      active: true
    });
}

const downloadSession = () => {
    var dlAnchorElem = document.getElementById('downloadAnchorElem');
    let id           = selectedItem.innerHTML;
    fileName         = "session:" + id + ":" +
                        new Date().toLocaleString().split(',')[0]
                                                   .replace(/\//g, "-") + ".json";

    storage.get(id).then((storageResults) => {
        let json    = JSON.parse(storageResults[id]);
        let dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(json));
        dlAnchorElem.setAttribute("href", dataStr);
        dlAnchorElem.setAttribute("download", fileName);
        dlAnchorElem.click();
    });

}

const deleteFromStorage = () => {
    let action =  confirm("Do you wish to delete session: " + selectedItem.innerHTML + "?");

    if (action) {
        storage.remove(selectedItem.innerHTML).then(() => {
            selectedItem.parentElement.removeChild(selectedItem);
        });
        alertMessage("success", "Deleted session successfully...");
    } else {
        alertMessage("warning", "Canceled deletion...");
    }
}

const editSession = () => {
    let id      = selectedItem.innerHTML;
    let newName = '';

    do {
        newName = prompt("Editing selected session... Allowed: a-z, A-Z, -, _", id);
        if (newName == null) break
    } while (newName.search(regexp) == -1);

    if (newName) {
        storage.get(id).then((storageResults) => {
            storage.remove(id);
            json = JSON.parse(storageResults[id]);
            saveToStorage(newName, JSON.stringify(json));
        });
        selectedItem.textContent = newName;
    } else {
        alertMessage("warning", "Canceled edit...");
    }
}

const loadSession = (id = null) => {
    console.log("Loading session...");
    try {
        storage.get(id).then(storageResults => {
            let json        = JSON.parse(storageResults[id]);
            let keys        = Object.keys(json);
            let keysLength  = Object.keys(json).length;

            browser.windows.getAll().then(windows => {
                windowSys.getCurrent({populate: true}).then(currentWindow => {
                    let wasCurrentTabId = null;

                    // Clear all non-current windows and then current window's tabs
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

                    // If more than one window, load tabs to new windows.
                    browser.tabs.remove(wasCurrentTabId);
                    if (keysLength > 1) {
                        for (let i = 1; i < keysLength; i++) {
                            let store = json[keys[i]];
                            let urls  = [];

                            for (let j = 0; j < store.length; j++) {
                                urls.push(store[j].link);
                            }
                            windowSys.create({ url: urls });
                        }
                    }
                });
            });
        });
    } catch (e) { console.log(e); }
}

const getSavedSessionIDs = () => {
    console.log("Getting saved sessions...");
    storage.get(null).then((storageResults) => {
        let keys = Object.keys(storageResults);
        for (let key of keys) {
            appendToSavedSessionsList(key);
        }
    });
}

const appendToSavedSessionsList = (enteryName) => {
    let liTag = document.createElement("LI");
    let text  = document.createTextNode(enteryName);
    liTag.setAttribute("name", enteryName);
    liTag.append(text);
    document.getElementById("savedSessions").append(liTag);
}

getSavedSessionIDs();
