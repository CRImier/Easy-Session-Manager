let selectedItem = null;

document.addEventListener("click", (e) => {
    if (e.button == 0) {  // Left click
        if (e.target.tagName == "LI") {
            if (selectedItem) {
                if (selectedItem == e.target && selectedItem.className == "selected") {
                    selectedItem.setAttribute("class", "");
                } else {
                    selectedItem.setAttribute("class", "");
                    selectedItem = e.target;
                    selectedItem.setAttribute("class", "selected");
                }
            } else {
                selectedItem = e.target;
                selectedItem.setAttribute("class", "selected");
            }
        } else if (e.target.name == "save") {
            saveSession();
        } else if (e.target.name == "import") {
            importSession();
        } else if (selectedItem) {
            if (e.target.name == "download")
                downloadSession();
            else if (e.target.name == "delete")
                deleteFromStorage();
            else if (e.target.name == "edit")
                editSession();
        } else {
            alertMessage("warning", "Select a session first...");
        }
    }
});

document.addEventListener("dblclick", (e) => {
    if (e.button == 0) {  // Left click
        if (e.target.tagName == "LI") {
            loadSession(e.target.innerHTML.trim());
        }
    }
});
