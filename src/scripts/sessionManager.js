const storage      = browser.storage.local;
const windowSys    = browser.windows;
const regexp       = /^[a-zA-Z0-9-_]+$/; // Alphanumeric, dash, underscore


const saveSession = (message = "What is this session's name? Allowed: a-z, A-Z, -, _") => {
    let inputTag   = document.createElement("INPUT");
    inputTag.value = new Date().toLocaleString().split(',')[0].replace(/\//g, '-');

    swal(message, {
        content: inputTag,
        buttons: true,
    }).then((value) => {
        if (value) {
            let enteryName = inputTag.value.replace(/ /g, "_");
            if (enteryName) {
                if (enteryName.search(regexp) == -1) {
                    saveSession("Please try again...\nAllowed: a-z, A-Z, -, _")
                    return ;
                }

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
                swal("Canceled save...", {
                    icon: "warning",
                });
            }
        } else {
            swal("Canceled save...", {
                icon: "warning",
            });
        }
    });
}

const editSession = (message = "Editing selected session... Allowed: a-z, A-Z, -, _") => {
    let id         = selectedItem.innerHTML;
    let inputTag   = document.createElement("INPUT");
    inputTag.value = id;

    swal(message, {
        content: inputTag,
        buttons: true,
    }).then((value) => {
        if (value) {
            let newName = inputTag.value.replace(/ /g, "_");

            if (newName) {
                if (newName.search(regexp) == -1) {
                    editSession("Please try again...\nAllowed: a-z, A-Z, -, _")
                    return ;
                }

                storage.get(id).then((storageResults) => {
                    storage.remove(id);
                    json = JSON.parse(storageResults[id]);
                    saveToStorage(newName, JSON.stringify(json), true);
                });

                selectedItem.textContent = newName;
            } else {
                swal("Canceled edit...", {
                    icon: "warning",
                });
            }
        } else {
            swal("Canceled edit...", {
                icon: "warning",
            });
        }
    });
}

const saveToStorage = (name, data, fromEdit = false) => {
    storage.get(name).then((storageResults) => {
        let json = null;
        try {
            json = JSON.parse(storageResults[name]);
            swal("Overwrote session...", {
                icon: "warning",
            });
        } catch (e) {
            if (fromEdit) {  // minor logic fix
                swal("Overwrote session...", {
                    icon: "warning",
                });
            } else {
                swal("Saved session...", {
                    icon: "success",
                });
            }
        } finally {
            storage.set({[name]: data});
        }
    });
}

const deleteFromStorage = () => {
    swal({
        title: "Are you sure?",
        text: "Do you wish to delete session:\n" + selectedItem.innerHTML + "?",
        icon: "warning",
        buttons: true,
        dangerMode: true,
    }).then((willDelete) => {
        if (willDelete) {
            storage.remove(selectedItem.innerHTML).then(() => {
                selectedItem.parentElement.removeChild(selectedItem);
            });
            swal("Deleted session successfully...", {
                icon: "success",
            });
        } else {
            swal("Canceled deletion...", {
                icon: "warning",
            });
        }
    });
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
                        new Date().toLocaleString().split(',')[0].replace(/\//g, "-") + ".json";

    storage.get(id).then((storageResults) => {
        let json    = JSON.parse(storageResults[id]);
        let dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(json));
        dlAnchorElem.setAttribute("href", dataStr);
        dlAnchorElem.setAttribute("download", fileName);
        dlAnchorElem.click();
    });

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
