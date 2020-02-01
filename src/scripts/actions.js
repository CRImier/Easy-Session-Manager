const messageWindow = (type = "warning", message = "No message passed in...") => {
    swal(message, { icon: type, });
}

const getSavedSessionIDs = () => {
    storageApi.get(null).then((results) => {
        const sessions = Object.keys(results);
        for (let session of sessions) {
            appendToSavedSessionsList(session);
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

const saveToStorage = (name, data, action = "undefined", willReplace = false) => {
    storageApi.get(name).then((results) => {
        try {
            // If save finds a session successfully then check if replacing
            const json = JSON.parse(results[name]);
            if (!willReplace) {
                swal({
                    title: "Replace?",
                    text: "Found a session with that name! Do you want to replace it?",
                    icon: "warning",
                    buttons: true,
                    dangerMode: true,
                }).then((willReplace) => {
                    if (willReplace) {
                        storageApi.set({[name]: data});
                        messageWindow("warning", "Overwrote session...");
                    } else {
                        messageWindow("warning", "Canceled " + action + "...");
                    }
                });
            } else {
                storageApi.set({[name]: data});
                messageWindow("warning", "Overwrote session...");
            }
        } catch (e) {
            if (action !== "edit") {
                appendToSavedSessionsList(name);
                messageWindow("success", "Saved session...");
                storageApi.set({[name]: data});
            } else {
                messageWindow("warning", "Overwrote session...");
                storageApi.set({[name]: data});
            }
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
            storageApi.remove(elm.innerText).then(() => {
                elm.parentElement.removeChild(elm);
            });
            selectedItem = null; // reset selectedItem
            messageWindow("success", "Deleted session successfully...");
        } else {
            messageWindow("warning", "Canceled deletion...");
        }
    });
}
