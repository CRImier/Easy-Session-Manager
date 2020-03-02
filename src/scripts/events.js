getSavedSessionIDs();

document.addEventListener("click", (e) => {
    if (e.button == 0) {  // Left click
        const target  = e.target;
        const action  = target.getAttribute("name");


        // Set selection first before doing any actions...
        if (target.tagName == "LI" && target.className.includes("sessionLI")) {
            if (selectedItem) {
                if (selectedItem == target && selectedItem.className == "sessionLI selected") {
                    selectedItem.setAttribute("class", "sessionLI");
                    selectedItem = null;
                } else {
                    selectedItem.setAttribute("class", "sessionLI");
                    selectedItem = target;
                    selectedItem.setAttribute("class", "sessionLI selected");
                }
            } else {
                selectedItem = target;
                selectedItem.setAttribute("class", "sessionLI selected");
            }
        }

        const selectedItemName = (selectedItem !== null) ? selectedItem.getAttribute("name") : "";

        // Modals
        if (/(saveModalLauncher|editModalLauncher|deleteModalLauncher|downloadModalLauncher)/.test(action)) {
            if (action == "saveModalLauncher") {
                preSaveSession(selectedItem, selectedItemName);
                showModal("saveModal");
                return ;
            }

            if (selectedItem) {
                if (action == "editModalLauncher") {
                    preEditSession(selectedItem, selectedItemName);
                    showModal("editModal");
                } else if (action == "deleteModalLauncher") {
                    document.getElementsByName("toDeleteName")[0].innerText = selectedItemName;
                    showModal("deleteModal");
                } else if (action == "downloadModalLauncher") {
                    preDownloadSession(selectedItemName);
                    showModal("downloadModal");
                }
            } else {
                messageWindow("warning", "Select a session first...");
            }

            return ;
        }

        if (/(closeSave|closeEdit|closeDownload|closeDelete|closeConfirm|closeLoad)/.test(action)) {
            if (action.includes("closeSave")) {
                hideModal("saveModal");
            } else if (action.includes("closeEdit")) {
                hideModal("editModal");
            } else if (action.includes("closeDownload")) {
                hideModal("downloadModal");
            } else if (action.includes("closeDelete")) {
                hideModal("deleteModal");
            } else if (action.includes("closeConfirm")) {
                hideModal("confModal");
            } else if (action.includes("closeLoad")) {
                hideModal("loadModal");
            }
        }


        // Actions
        if (/(download|delete|edit|load)/.test(action)) {
            if (selectedItem) {
                if (action == "download") {
                    downloadSession(selectedItemName);
                } else if (action == "delete") {
                    deleteFromStorage(selectedItem, selectedItemName);
                    hideModal("deleteModal");
                } else if (action == "edit") {
                    editSession(selectedItem, selectedItemName);
                } else if (action == "load") {
                    startLoadSession();
                }
            }
        } else if (action == "save") {
            saveSession(selectedItem, selectedItemName);
        } else if (action == "confirm") {
            confirmSessionOverwrite();
        } else if (action == "import") {
            importSession();
        } else if (action == "donate") {
            doUrlAction("https://www.paypal.me/ITDominator",);
        }
    }
});


document.addEventListener("dblclick", (e) => {
    if (e.button == 0) {  // Left click
        if (e.target.tagName == "LI" && e.target.className.includes("sessionLI")) {
            selectedItem = e.target;
            const id     = selectedItem.getAttribute("name");
            selectedItem.setAttribute("class", "sessionLI selected");
            preLoadSession(id);
        }
    }
});
