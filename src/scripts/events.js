let selectedItem = null;

const toggleSelect = (name) => {
    let checkboxes = document.getElementsByName(name);
    for (var i = 0; i < checkboxes.length; i++) {
        checkboxes[i].checked = !checkboxes[i].checked;
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
                swal("Select a session first...", {
                    icon: "warning",
                });
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
                let id = e.target.innerHTML.trim();
                storage.get(id).then(storageResults => {
                    let json          = JSON.parse(storageResults[id]);
                    let keys          = Object.keys(json);
                    let keysLength    = Object.keys(json).length;
                    let replaceTabs   = document.getElementsByName("replaceTabs")[0];
                    let selectiveOpen = document.getElementsByName("selectiveOpen")[0];

                    if (!selectiveOpen.checked) {
                        loadSession(json, replaceTabs.checked);
                    } else {
                        let container  = document.createElement("DIV");
                        let ulTemplate = document.querySelector('#ulTemplate');
                        let liTemplate = document.querySelector('#liTemplate');

                        for (let i = 0; i < keysLength; i++) {
                            let ulClone = document.importNode(ulTemplate.content, true);
                            let ulTag   = ulClone.querySelector('.collection');
                            let h2Txt   = document.createTextNode("Window: " + (i + 1));
                            let store   = json[keys[i]];
                            let  j      = 0;

                            store.forEach(tab => {
                                let liClone    = document.importNode(liTemplate.content, true);
                                let inptTag    = liClone.querySelector("input");
                                let lblTag     = liClone.querySelector("label");
                                let labelTxt   = document.createTextNode(tab.link);
                                inptTag.id     = "Win" + i + "Li" + j;
                                lblTag.htmlFor = "Win" + i + "Li" + j;
                                lblTag.title   = tab.link;
                                inptTag.setAttribute("name", "Win" + i);
                                lblTag.appendChild(labelTxt);
                                ulTag.appendChild(liClone);
                                j++;
                            });

                            container.id = "editSelectionContainer";
                            ulClone.querySelector('#selectAll')
                                   .addEventListener("click", function () {
                                toggleSelect("Win" + i);
                            });
                            ulClone.querySelector('.ulHeader').appendChild(h2Txt);
                            container.appendChild(ulClone);
                        }

                        swal("Selective Open", {
                                content: container,
                                buttons: true,
                        }).then((willOpen) => {
                            if (willOpen) {
                                let sessionData = {};
                                let ulTags = container.querySelectorAll("ul");

                                for (let i = 0; i < keysLength; i++) {
                                    let links = [];

                                    for (var ii = 0; ii < ulTags[i].children.length; ii++) {
                                        let li = ulTags[i].children[ii];
                                        if (li.children[0].checked) {
                                            links.push(
                                                {"link" : li.children[1].title.trim()}
                                            );
                                        }
                                    }

                                    if (links.length > 0) {
                                        sessionData[keys[i]] = links;
                                    }
                                }

                                json = sessionData;
                                keysLength = Object.keys(json).length;
                                if (keysLength > 0) {
                                    loadSession(json, replaceTabs.checked);
                                } else {
                                    swal("Canceled operation; no tabs were selected...", {
                                        icon: "warning",
                                    });
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
