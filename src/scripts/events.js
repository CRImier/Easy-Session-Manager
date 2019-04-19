let selectedItem = null;

const toggleSelect = (source, name) => {
    let checkboxes = document.getElementsByName(name);
    for (var i = 0; i < checkboxes.length; i++) {
        checkboxes[i].checked = source.checked;
    }
}

document.addEventListener("click", (e) => {
    if (e.button == 0) {  // Left click
        let name = e.target.name;

        if (/(download|delete|edit)/.test(name)) {
            if (selectedItem) {
                if (name == "download")
                    downloadSession(selectedItem);
                else if (name == "delete")
                    deleteFromStorage(selectedItem);
                else if (name == "edit")
                    editSession(selectedItem);
            } else {
                messageWindow("warning", "Select a session first...");
            }
        } else if (name == "save") {
            saveSession(selectedItem);
        } else if (name == "import") {
            importSession();
        } else if (name == "donate") {
            var dlAnchorElem = document.getElementById('downloadAnchorElem');
            dlAnchorElem.setAttribute("href", "https://www.paypal.me/ITDominator");
            dlAnchorElem.setAttribute("_blank", "");
            dlAnchorElem.click();
        }

        if (e.target.tagName == "LI" && e.target.className.includes("sessionLI")) {
            if (selectedItem) {
                if (selectedItem == e.target && selectedItem.className == "sessionLI selected") {
                    selectedItem.setAttribute("class", "sessionLI");
                    selectedItem = null;
                } else {
                    selectedItem.setAttribute("class", "sessionLI");
                    selectedItem = e.target;
                    selectedItem.setAttribute("class", "sessionLI selected");
                }
            } else {
                selectedItem = e.target;
                selectedItem.setAttribute("class", "sessionLI selected");
            }
        }
    }
});

document.addEventListener("dblclick", (e) => {
    if (e.button == 0) {  // Left click
        if (e.target.tagName == "LI" && e.target.className.includes("sessionLI")) {
            selectedItem = e.target;
            selectedItem.setAttribute("class", "sessionLI selected");
            try {
                let id = e.target.innerText.trim();
                storage.get(id).then(storageResults => {
                    let json          = JSON.parse(storageResults[id]);
                    let keys          = Object.keys(json);
                    let keysLength    = Object.keys(json).length;
                    let replaceTabs   = document.getElementsByName("replaceTabs")[0];
                    let selectiveOpen = document.getElementsByName("selectiveOpen")[0];

                    if (!selectiveOpen.checked) {
                        loadSession(json, replaceTabs.checked);
                    } else {
                        let container = selectionWindow(json, keys, keysLength);
                        swal("Selective Open", {
                                content: container,
                                buttons: true,
                        }).then((willOpen) => {
                            if (willOpen) {
                                json = selectionData(container, keys, keysLength);
                                keysLength = Object.keys(json).length;
                                if (keysLength > 0) {
                                    loadSession(json, replaceTabs.checked);
                                } else {
                                    messageWindow("warning", "Canceled operation; no tabs were selected...");
                                }
                            }
                        });
                    }
                });
            } catch (e) {
                console.log(e);
            }
        }
    }
});
