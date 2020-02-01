getSavedSessionIDs();

document.addEventListener("click", (e) => {
    if (e.button == 0) {  // Left click
        const target           = e.target;
        const action           = target.name;

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

        // If elm has certain action do it.
        const selectedItemName = (selectedItem !== null) ? selectedItem.getAttribute("name") : "";
        if (/(download|delete|edit)/.test(action)) {
            if (selectedItem) {
                if (action == "download")
                    downloadSession(selectedItemName);
                else if (action == "delete")
                    deleteFromStorage(selectedItem, selectedItemName);
                else if (action == "edit")
                    editSession(selectedItem, selectedItemName);
            } else {
                messageWindow("warning", "Select a session first...");
            }
        } else if (action == "save") {
            saveSession(selectedItem, selectedItemName);
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
