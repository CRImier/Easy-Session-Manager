const regexp = /^[a-zA-Z0-9-_]+$/; // Alphanumeric, dash, underscore


const alertMessage = (type, message) => {
    let msgTag    = document.getElementById("allertMessage");
    let text      = document.createTextNode(message);
    let fontColor = "rgba(255, 255, 255, 1)";
    let bgColor   = "";

    if (type === "success") {
        bgColor   = "rgba(72, 125, 25, 1)";
    } else if (type === "warning") {
        bgColor   = "rgba(195, 123, 0, 1)";
    } else if (type === "error") {
        bgColor   = "rgba(125, 45, 25, 1)";
    }

    msgTag.style.backgroundColor = bgColor;
    msgTag.style.color           = fontColor;
    msgTag.style.display         = "block";
    msgTag.append(text);

    setTimeout(function () {
        let msgTag           = document.getElementById("allertMessage");
        msgTag.innerHTML     = "";
        msgTag.style.display = "none";
    }, 4000);
}

const processor = (obj, enteryName = '') => {
    let data  = obj.target.result;

    do {
        enteryName = prompt("What is this session's name? Allowed: a-z, A-Z, -, _", '' + enteryName);
        if (enteryName == null) break
    } while (enteryName.search(regexp) == -1);

    if (enteryName) {
        try {
            console.log("Importing session...");
            JSON.parse(data);
            browser.storage.local.set({[enteryName]: data});
            alertMessage("success", "Imported file successfully.")
        } catch (e) {
            alertMessage("error", "Failed to import data. Not a JSON parsable file.");
            return ;
        }
    } else {
        alertMessage("warning", "Canceled import.");
    }
};

document.getElementById("inputId").onchange = (e) => {
    let size = e.target.files.length;
    let fileArry = e.target.files;

    for (var i = 0; i < size; i++) {
        let reader = new FileReader();
        let name   = fileArry[i].name;
        name = name.split(".")[0];

        reader.onloadend = (obj) => { processor(obj, name); };

        if (fileArry[i].type == "application/json")
            reader.readAsText(fileArry[i], {encoding: "string"});
    }
};


document.addEventListener("click", (e) => {
    if (e.button == 0) {  // Left click
        if (e.target.className == "container") {
            document.getElementById("inputId").click();
        }
    }
});
