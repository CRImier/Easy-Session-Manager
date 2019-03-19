let selectedItem = null;

document.addEventListener("click", (e) => {
    if (e.button == 0) {  // Left click
        let name = e.target.name;
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
        } else if (name == "save") {
            saveSession();
        } else if (name == "import") {
            importSession();
        } else if (selectedItem) {
            if (name == "download")
                downloadSession();
            else if (name == "delete")
                deleteFromStorage();
            else if (name == "edit")
                editSession();
        } else if (/(download|delete|edit)/.test(name)) {
            swal("Select a session first...", {
                icon: "warning",
            });
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
