const message2    = "Name too long or none provided; or, unacceptable character used.";
const storageApi  = browser.storage.local;
const tabsApi     = browser.tabs;
const windowApi   = browser.windows;
const regexp      = /^[a-zA-Z0-9-_]+$/; // Alphanumeric, dash, underscore
let willReplace   = false;

// Used as holder for vertain actions and 'cross' modal routs
let container     = null;
let holderElm     = null;
let holderName    = null;
let holderData    = null;
let holderSize    = null;

let keys          = null;
let keysLength    = null;


const resetArgs = (modal = "") => {
    if (modal !== "") {
        hideModal(modal);
    }

    willReplace = false;
    container   = null;

    holderElm   = null;
    holderName  = null;
    holderData  = null;
    holderSize  = null;
    keys        = null;
    keysLength  = null;
}


const preSaveSession = (elm = null, name = null, message = "") => {
    let inputTag    = document.getElementsByName("toSaveName")[0];
    inputTag.value  = new Date().toLocaleString().split(',')[0].replace(/\//g, '-');

    if (elm !== null) {
        inputTag.value = name;
        willReplace    = true;
    }

    document.getElementsByName("toSaveErrMessage")[0].innerText = message;

    windowApi.getAll({ populate: true, windowTypes: ["normal"] }).then((windows) => {
        let sessionData = getSessionData(windows);
        keys            = Object.keys(sessionData);
        keysLength      = Object.keys(sessionData).length;
        container       = loadContainer(sessionData, keys, keysLength, "saveList");
    });
}

const saveSession = (elm = null, name = null) => {
    let inputTag   = document.getElementsByName("toSaveName")[0];
    let enteryName = inputTag.value.replace(/ /g, "_");

    if (enteryName.length < 0 || enteryName.length > 54 || enteryName.search(regexp) == -1) {
        preSaveSession(elm, name, message2);
        return ;
    }

    console.log("Saving session...");
    sessionData = getSelectionData(container, keys, keysLength);
    saveToStorage(enteryName, JSON.stringify(sessionData), "save", willReplace, elm);
    resetArgs("saveModal");
}




const preEditSession = (elm = null, name = null, message = "") => {
    let inputTag     = document.getElementsByName("toEditName")[0];
    let id           = name;
    inputTag.value   = name;

    document.getElementsByName("toEditErrMessage")[0].innerText = message;

    storageApi.get(id).then((results) => {
        try {
            let sessionData = JSON.parse(results[id]);
            keys            = Object.keys(sessionData);
            keysLength      = Object.keys(sessionData).length;
            container       = loadContainer(sessionData, keys, keysLength, "editList");
        } catch (e) {
                messageWindow("warning", "Canceled edit; couldn't load any data...");
                resetArgs();
                return ;
        }
    });
}

const editSession = (elm = null, name = null, message = "") => {
    let newSessionTag = document.getElementsByName("toEditNewSession")[0];
    let inputTag      = document.getElementsByName("toEditName")[0];
    let newName       = inputTag.value.replace(/ /g, "_");
    const id          = name;

    if (newName.length < 0 || newName.length > 54 || newName.search(regexp) == -1) {
        preEditSession(elm, name, message2);
        return ;
    }

    let sessionData = getSelectionData(container, keys, keysLength);
    const strData   = JSON.stringify(sessionData);
    if (newSessionTag.checked) { // If creating new session
        newName   = checkSessionListForDuplicate(newName);
        saveToStorage(newName, strData, "save", false, elm);
    } else {
        if (newName == name) { // If not creating new session and are the same name
            storageApi.get(id).then((results) => {
                storageApi.remove(id);
                saveToStorage(newName, strData, "edit", true, elm);
            }).then(() => {
                const size = getStoreSize(strData);
                elm.innerText = size + "  |  " + newName;
                elm.setAttribute("name", newName);
            });
        } else { // If not creating new session and names are not the same rename
            storageApi.get(id).then((results) => {
                newName = checkSessionListForDuplicate(newName);
                storageApi.remove(id);
                saveToStorage(newName, strData, "edit", false, elm);
            }).then(() => {
                const size = getStoreSize(strData);
                elm.innerText = size + "  |  " + newName;
                elm.setAttribute("name", newName);
            });
        }
    }

    resetArgs("editModal");
}




const preDownloadSession = (session = null) => {
    let fileName = session;
    document.getElementsByName("toDownloadName")[0].value = fileName;
}

const downloadSession = (session = null) => {
    let chkBoxTag = document.getElementsByName("appendDateDlModal")[0];
    let fileName  = document.getElementsByName("toDownloadName")[0].value;
    const id      = session;

    if (chkBoxTag.checked) {
        fileName = "session_" + fileName + "_" + new Date().toLocaleString()
                                                .split(',')[0]
                                                .replace(/\//g, "-") + ".json";
    } else {
        fileName = "session_" + fileName + ".json";
    }

    storageApi.get(id).then((results) => {
        let sessionData = JSON.parse(results[id]);
        let dataStr     = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(sessionData));
        console.log("Downloading: " + id);
        doUrlAction(dataStr, fileName, true);
    });
}




const preLoadSession = (id) => {
    storageApi.get(id).then(results => {
        try {
            let sessionData   = JSON.parse(results[id]);
            let keys          = Object.keys(sessionData);
            let keysLength    = Object.keys(sessionData).length;
            let replaceTabs   = document.getElementsByName("replaceTabs")[0];
            let selectiveOpen = document.getElementsByName("selectiveOpen")[0];

            if (!selectiveOpen.checked) {
                asyn = () => {
                    loadSession(sessionData, replaceTabs.checked);
                }
                asyn();
            } else {
                container = loadContainer(sessionData, keys, keysLength, "loadList");
                asyn = () => {
                    setKeyData(keys, keysLength);
                }
                asyn();
                showModal("loadModal");
            }
        } catch (e) {
            messageWindow("error", "Couldn't load session:\n" + e);
        }
    });
}

// Supports startLoadSession getting the proper data...
const setKeyData = (_keys, _keysLength) => {
    keys = _keys;
    keysLength = _keysLength;
}

const startLoadSession = () => {
    sessionData = getSelectionData(container, keys, keysLength);
    keysLength  = Object.keys(sessionData).length;
    if (keysLength > 0) {
        loadSession(sessionData, replaceTabs.checked);
        hideModal("loadModal");
    } else {
        hideModal("loadModal");
        messageWindow("warning", "Canceled Operation: No tabs were selected...");
    }
}

const loadSession = (json = null, replaceTabs = false) => {
    let keys       = Object.keys(json);
    let keysLength = Object.keys(json).length;
    try {
        browser.windows.getAll().then(windows => {
            windowApi.getCurrent({populate: true}).then(currentWindow => {
                let wasCurrentTabId = null;

                if (replaceTabs) { // Clear all windows but main then load...
                    if (keysLength == 0) {
                        messageWindow("error", "Canceled operation; no tabs in session...");
                        return ;
                    }

                    for (let i = 0; i < windows.length; i++) {
                        if (currentWindow.id != windows[i].id) {
                            windowApi.remove(windows[i].id);
                        } else {
                            let ids = [];
                            currentWindow.tabs.forEach(tab => {
                                if (!tab.active) {
                                    ids.push(tab.id);
                                } else {
                                    wasCurrentTabId = tab.id;
                                }
                            });
                            tabsApi.remove(ids);
                        }
                    }

                    // First load tabs to current window.
                    let store = json[keys[0]];
                    store.forEach(tab => {
                        tabsApi.create({ url: tab.link });
                    });
                    tabsApi.remove(wasCurrentTabId);

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
    } catch (e) {
        messageWindow("error", "Couldn't load session:\n" + e);
    }
}



const confirmSessionOverwrite = () => {
    storageApi.set({[holderName]: holderData});
    holderElm = document.getElementsByName(holderName)[0];
    holderElm.innerText = holderSize + "  |  " + holderName;
    holderElm.name      = holderName;
    messageWindow("warning", "Overwrote session...");
    resetArgs("confModal");
}
