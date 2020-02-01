const message1 = "[ Session Name ] Allowed: a-z, A-Z, 0-9, -, _";
const message2    = "Allowed: a-z, A-Z, 0-9, -, _ Please try again...\nName too long or none provided; or, unacceptable character used.";
const storageApi  = browser.storage.local;
const tabsApi     = browser.tabs;
const windowApi   = browser.windows;
const regexp      = /^[a-zA-Z0-9-_]+$/; // Alphanumeric, dash, underscore


const saveSession = (elm = null, message = message1) => {
    let inputTag    = document.createElement("INPUT");
    let willReplace = false;
    inputTag.value  = new Date().toLocaleString().split(',')[0].replace(/\//g, '-');

    if (elm !== null) {
        inputTag.value = elm.innerText;
        willReplace    = true;
    }

    windowApi.getAll({ populate: true, windowTypes: ["normal"] }).then((windows) => {
        let sessionData = getSessionData(windows);
        let keys        = Object.keys(sessionData);
        let keysLength  = Object.keys(sessionData).length;
        let container   = generateSelectionWindow(sessionData, keys, keysLength);
        container.prepend(inputTag);

        swal(message, {
            content: container,
            buttons: true,
            customClass: 'swal-modal',
        }).then((value) => {
            if (value) {
                let enteryName = inputTag.value.replace(/ /g, "_");

                if (enteryName.length < 0 || enteryName.length > 54 || enteryName.search(regexp) == -1) {
                    saveSession(elm, message2);
                    return ;
                }

                console.log("Saving session...");
                sessionData = getSelectionData(container, keys, keysLength);
                saveToStorage(enteryName, JSON.stringify(sessionData), "save", willReplace);
            } else {
                messageWindow("warning", "Canceled save...");
            }
        });
    });
}

const editSession = (elm = null, message = message1) => {
    let id             = elm.innerText;
    let inputTag       = document.createElement("INPUT");
    let newSessionCheckTag     = document.createElement("INPUT");
    let labelTag       = document.createElement("LABEL");
    let brTag          = document.createElement("BR");

    inputTag.value     = id;
    newSessionCheckTag.type    = "checkbox";
    newSessionCheckTag.id      = "newSession";
    newSessionCheckTag.checked = false;
    labelTag.innerText = "Create New Session";
    labelTag.htmlFor   = "newSession";

    storageApi.get(id).then((results) => {
        let json        = JSON.parse(results[id]);
        let keys        = Object.keys(json);
        let keysLength  = Object.keys(json).length;
        let container   = generateSelectionWindow(json, keys, keysLength);
        container.prepend(labelTag);
        container.prepend(newSessionCheckTag);
        container.prepend(brTag);
        container.prepend(inputTag);

        console.log("Editing session...");
        swal(message, {
            content: container,
            buttons: true,
            customClass: 'swal-modal',
        }).then((value) => {
            if (value) {
                let newName = inputTag.value.replace(/ /g, "_");

                if (newName.length < 0 || newName.length > 54 || newName.search(regexp) == -1) {
                    editSession(elm, message2);
                    return ;
                }

                json = getSelectionData(container, keys, keysLength);
                // If creating from collection new session
                if (newSessionCheckTag.checked) {
                    if (newName !== elm.innerText) {
                        newName = checkSessionListForDuplicate(newName);
                        saveToStorage(newName, JSON.stringify(json), "save");
                    } else { // Enforce unique name
                        let min    = 1;
                        let max    = 200000;
                        var random = Math.floor(Math.random() * (+max - +min)) + +min;
                        newName += "-" + random + "-" + Math.floor(Math.random() * (+10 - +1)) + +1;
                        saveToStorage(newName, JSON.stringify(json), "edit");
                    }
                } else {
                    // If not creating new session and diff name enforced; generate new name
                    if (newName !== elm.innerText) {
                        newName = checkSessionListForDuplicate(newName);
                        storageApi.get(id).then((results) => {
                            storageApi.remove(id);
                            saveToStorage(newName, JSON.stringify(json), "edit");
                        }).then(() => {
                            elm.textContent = newName;
                        });
                    } else { // Replace found session
                        saveToStorage(newName, JSON.stringify(json), "edit", true);
                    }
                }
            } else {
                messageWindow("warning", "Canceled edit...");
            }
        });
    });
}

const downloadSession = (elm = null) => {
    let pTag       = document.createElement("P");
    let inputTag   = document.createElement("INPUT");
    let chkBoxTag  = document.createElement("INPUT");
    let lblTag     = document.createElement("LABEL");
    let brTag      = document.createElement("BR");
    let aTagElm    = document.getElementById('downloadAnchorElem');
    let text       = document.createTextNode("Append Date?");
    let id         = elm.innerText;
    let fileName   = "session:" + id + ".json";

    chkBoxTag.type = "checkbox";
    inputTag.value = fileName;
    chkBoxTag.id   = "chkbx";
    lblTag.htmlFor = "chkbx";
    lblTag.append(text);
    pTag.append(lblTag);
    pTag.append(chkBoxTag);
    pTag.append(brTag);
    pTag.append(inputTag);

    swal("Download Session?", {
            content: pTag,
            buttons: true,
            customClass: 'swal-modal',
    }).then((willDl) => {
        if (willDl) {
            if (chkBoxTag.checked) {
                fileName = "session:" + id + ":" +
                     new Date().toLocaleString().split(',')[0].replace(/\//g, "-") + ".json";
            }

            storageApi.get(id).then((results) => {
                let json    = JSON.parse(results[id]);
                console.log("Downloading: " + id);
                let dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(json));
                doUrlAction(dataStr, fileName, true);
            });
        }
    });
}

const preLoadSession = (id) => {
    storageApi.get(id).then(results => {
        try {
            let json          = JSON.parse(results[id]);
            let keys          = Object.keys(json);
            let keysLength    = Object.keys(json).length;
            let replaceTabs   = document.getElementsByName("replaceTabs")[0];
            let selectiveOpen = document.getElementsByName("selectiveOpen")[0];

            if (!selectiveOpen.checked) {
                loadSession(json, replaceTabs.checked);
            } else {
                let container = generateSelectionWindow(json, keys, keysLength);
                swal("Selective Open", {
                    content: container,
                    buttons: true,
                }).then((willOpen) => {
                    if (willOpen) {
                        json = getSelectionData(container, keys, keysLength);
                        keysLength = Object.keys(json).length;
                        if (keysLength > 0) {
                            loadSession(json, replaceTabs.checked);
                        } else {
                            messageWindow("warning", "Canceled Operation: No tabs were selected...");
                        }
                    }
                });
            }
        } catch (e) {
            messageWindow("error", "Couldn't load session:\n" + e);
        }
    });
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
