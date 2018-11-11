const storage   = browser.storage.local;
const windowSys = browser.windows;


const saveSession = () => {
    let enteryName = prompt("What is this session's name?", "" + new Date().toLocaleString()
                                                                           .split(',')[0]);

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
        console.log("Canceled save...");
    }
}

const saveToStorage = (name, data) => {
    storage.set({[name]: data});
}

const downloadSession = () => {
    var dlAnchorElem = document.getElementById('downloadAnchorElem');
    let id           = selectedItem.innerHTML;
    fileName         = "session:" + id + ":" +
                        new Date().toLocaleString().split(',')[0]
                                                   .replace("/", "-") + ".json";

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
    }
}

const editSession = () => {
    let id      = selectedItem.innerHTML;
    let newName = prompt("Editing selected session...", id);

    if (newName != null) {
        storage.get(id).then((storageResults) => {
            storage.remove(id);
            json = JSON.parse(storageResults[id]);
            saveToStorage(newName, JSON.stringify(json));
        });
        selectedItem.innerHTML = newName;
    }
}

const loadSession = (id = null) => {
    console.log("Loading session...");
    try {
        storage.get(id).then((storageResults) => {
            let json = JSON.parse(storageResults[id]);
            let keys = Object.keys(json);

            browser.windows.getAll().then((windows) => {
                windowSys.getCurrent({populate: true}).then((currentWindow) => {
                    // Clear out windows
                    for (var i = 0; i < windows.length; i++) {
                        if (currentWindow.id != windows[i].id) {
                            windowSys.remove(windows[i].id);
                        }
                    }
                }, windows);
            });

            // Open windows and populate with proper tabs
            keys.forEach((key) => {
                let store = json[key];
                let urls  = [];

                for (var i = 0; i < store.length; i++) {
                    urls.push(store[i].link);
                }

                windowSys.create({ url: urls });
            });

            // Finalize clear out windows
            windowSys.getCurrent({populate: true}).then((currentWindow) => {
                windowSys.remove(currentWindow.id);
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
