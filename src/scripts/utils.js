const messageWindow = (type = "warning", message = "No message passed in...") => {
    swal(message, { icon: type, });
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


const checkSessionListForDuplicate = (newName) => {
    let sessions = document.getElementById("savedSessions").querySelectorAll("li");
    for (var i = 0; i < sessions.length; i++) {
        if (sessions[i].innerText === newName) {
            let min    = 1;
            let max    = 200000;
            var random = Math.floor(Math.random() * (+max - +min)) + +min;
            newName += "-" + random + "-" + Math.floor(Math.random() * (+10 - +1)) + +1;
        }
    }
    return newName;
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

const saveToStorage = (name, data, fromEdit = false) => {
    storage.get(name).then((storageResults) => {
        let json = null;
        try {
            json = JSON.parse(storageResults[name]);
            messageWindow("warning", "Overwrote session...");
        } catch (e) {
            if (fromEdit) {  // minor logic fix
                messageWindow("warning", "Overwrote session...");
            } else {
                appendToSavedSessionsList(name);
                messageWindow("success", "Saved session...");
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
            messageWindow("success", "Deleted session successfully...");
        } else {
            messageWindow("warning", "Canceled deletion...");
        }
    });
}


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
