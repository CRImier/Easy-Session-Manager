const messageWindow = (type = "warning", message = "No message passed in...") => {
    Swal.fire({
        text: message,
        icon: type
    });
}

const getSavedSessionIDs = () => {
    storageApi.get(null).then((results) => {
        const sessions = Object.keys(results);
        for (let session of sessions) {
            storageApi.get(session).then((results) => {
                size = getStoreSize(results[session]);
                appendToSavedSessionsList(session, size);
            });
        }
    });
}

const saveToStorage = (name, data, action = "undefined", willReplace = false, sveElm = null) => {
    storageApi.get(name).then((results) => {
        const size = getStoreSize(data); // Must be outside try block for catch block to see it
        try {
            const json = JSON.parse(results[name]); // If a session is found
            if (!willReplace) {
                 Swal.fire({
                    title: "Replace?",
                    text: "Found a session with that name! Do you want to replace it?",
                    icon: "warning",
                    showCloseButton: true,
                    showCancelButton: true,
                }).then((willReplace) => {
                    if (willReplace.value) {
                        storageApi.set({[name]: data});
                        sveElm.innerText = size + "  |  " + name;
                        sveElm.name      = name;
                        messageWindow("warning", "Overwrote session...");
                    } else {
                        messageWindow("warning", "Canceled " + action + "...");
                    }
                });
            } else {
                sveElm.innerText = size + "  |  " + name;
                sveElm.name      = name;
                storageApi.set({[name]: data});
                messageWindow("warning", "Overwrote session...");
            }
        } catch (e) {
            if (action !== "edit") {
                appendToSavedSessionsList(name, size);
                messageWindow("success", "Saved session...");
                storageApi.set({[name]: data});
            } else {
                storageApi.set({[name]: data});
                messageWindow("warning", "Overwrote session...");
            }
        }
    });
}

const deleteFromStorage = (elm = null, name = null) => {
     Swal.fire({
        title: "Are you sure?",
        text: "Do you wish to delete session:\n" + name + "?",
        icon: "warning",
        showCloseButton: true,
        showCancelButton: true,
    }).then((willDelete) => {
        if (willDelete.value) {
            storageApi.remove(name).then(() => {
                elm.parentElement.removeChild(elm);
            });
            selectedItem = null; // reset selectedItem
            messageWindow("success", "Deleted session successfully...");
        } else {
            messageWindow("warning", "Canceled deletion...");
        }
    });
}

const windowMaker = (i, keysLength, keys, json) => {
    for (; i < keysLength; i++) {
        let store = json[keys[i]];
        let urls  = [];

        for (let j = 0; j < store.length; j++) {
            urls.push(store[j].link);
        }
        windowApi.create({ url: urls });
    }
}
