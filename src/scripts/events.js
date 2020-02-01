getSavedSessionIDs();

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
            doUrlAction("https://www.paypal.me/ITDominator",);
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
            let id       = selectedItem.innerText.trim();
            selectedItem.setAttribute("class", "sessionLI selected");
            preLoadSession(id);
        }
    }
});
