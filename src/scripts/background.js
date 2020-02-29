const message2 = "Name too long or none provided; or, unacceptable character used.";
const regexp   = /^[a-zA-Z0-9-_]+$/; // Alphanumeric, dash, underscore

let data       = null;


const prePprocessor = (obj, enteryName = '', message = "") => {
    let inputTag   = document.getElementsByName("toSaveNameImport")[0];
    inputTag.value = enteryName.replace(/ /g, "_");
    data           = obj.target.result;
    document.getElementsByName("toSaveImportErrMessage")[0].innerText = message;
}

const processor = () => {
    let inputTag   = document.getElementsByName("toSaveNameImport")[0];
    enteryName     = inputTag.value.replace(/ /g, "_");
    inputTag.value = enteryName;

    if (enteryName.length < 0 || enteryName.length > 54 || enteryName.search(regexp) == -1) {
        messageWindow("danger", message2, "modal-gutter");
        // prePprocessor(obj, "", message2);
        return ;
    }

    try {
        console.log("Importing session...");
        JSON.parse(data); // See if parsing fails and throw error
        browser.storage.local.set({[enteryName]: data});
        messageWindow("success", "Imported file successfully.");
        hideModal();
    } catch (e) {
        hideModal();
        messageWindow("error", "Failed to import data. Not a JSON parsable file.");
        return ;
    }
};

// Get files after being chosen
document.getElementById("inputId").onchange = (e) => {
    let size = e.target.files.length;
    let fileArry = e.target.files;

    // Loop throughg the chosen files...
    for (var i = 0; i < size; i++) {
        let reader = new FileReader();
        let name   = fileArry[i].name;
        name = name.split(".")[0];

        reader.onloadend = (obj) => {
            prePprocessor(obj, name);
            showModal();
        };

        if (fileArry[i].type == "application/json")
            reader.readAsText(fileArry[i], {encoding: "string"});
    }
};

// Bring up file selector...
document.addEventListener("click", (e) => {
    if (e.button == 0) {  // Left click
        const target  = e.target;
        const action  = target.name;

        if (target.className.includes("container")) {
            document.getElementById("inputId").click();
        } else if (action == "importSave") {
            processor();
        }
    }
});



const showModal = async (modalID = "saveModal") => {
    tween(1600, "up", modalID); // in miliseconds
}

const hideModal = (modalID = "saveModal") => {
    tween(1600, "down", modalID); // in miliseconds
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const tween = async (miliseconds, direction, modalID) => {
    const elm      = document.getElementById(modalID);
    const timeStep =  1000 / miliseconds;
    const steps    = timeStep * 100

    if (direction == "up") { // Go up
        elm.style.display = "";
        // elm.style.opacity = "1";
        for (var i = 1; i <= steps; i++) {
            await sleep(timeStep);
            elm.style.opacity = i/steps;
        }
    } else { // Go down
        for (var i = steps; i > 1; i--) {
            await sleep(timeStep);
            elm.style.opacity = i/steps;
        }
        // elm.style.opacity = "0";
        elm.style.display = "none";
    }

}

const messageWindow = (type = "warning", message = "No message passed in...", target = "") => {
    let pTag   = document.createElement("P");
    let text   = document.createTextNode(message);
    let gutter = document.getElementById("message-gutter");

    if (target !== "") {
        gutter = document.getElementById(target);
    }

    pTag.className = "alert alert-" + type;
    pTag.appendChild(text);
    gutter.prepend(pTag);

    setTimeout(function () {
        clearChildNodes(gutter);
    }, 3200);
}

const clearChildNodes = (parent) => {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}
