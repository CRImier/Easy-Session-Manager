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
                            let sessions = document.getElementById("savedSessions").querySelectorAll("li");
                            console.log(sessions);
                            for (var i = 0; i < sessions.length; i++) {
                                if (sessions[i].innerText === newName) {
                                    let min    = 1;
                                    let max    = 200000;
                                    var random = Math.floor(Math.random() * (+max - +min)) + +min;
                                    newName += "-" + random + "-" + Math.floor(Math.random() * (+10 - +1)) + +1;
                                }
                            }
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
                appendToSavedSessionsList(name);
                swal("Saved session...", {
                    icon: "success",
                });
            }
        } finally {
            storage.set({[name]: data});
        }
    });
}

const deleteFromStorage = (elm = null) => {
    swal({
        title: "Are you sure?",
        text: "Do you wish to delete session:\n" + elm.innerText + "?",
        icon: "warning",
        buttons: true,
        dangerMode: true,
    }).then((willDelete) => {
        if (willDelete) {
            storage.remove(elm.innerText).then(() => {
                elm.parentElement.removeChild(elm);
            });
            selectedItem = null; // reset selectedItem
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
                    if (keysLength > 0) {
                        windowMaker(0, keysLength, keys, json)
                    }
                }

            });
        });
    } catch (e) { console.log(e); }
}

const windowMaker = (i, keysLength, keys, json) => {
    for (; i < keysLength; i++) {
        let store = json[keys[i]];
        let urls  = [];

        for (let j = 0; j < store.length; j++) {
            urls.push(store[j].link);
        }
        windowSys.create({ url: urls });
    }
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
    let liTag   = document.createElement("LI");
    let text    = document.createTextNode(enteryName.trim());
    liTag.setAttribute("name", enteryName.trim());
    liTag.className = "sessionLI";
    liTag.append(text);
    document.getElementById("savedSessions").append(liTag);
}

getSavedSessionIDs();




/*    Selection Process    */

const selectionWindow = (json = "", keys = null, keysLength = 0) => {
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

const selectionData = (container = null, keys = null, keysLength = 0) => {
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
