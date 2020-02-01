const message1 = "What is this session's name? Allowed: a-z, A-Z, -, _";
const regexp   = /^[a-zA-Z0-9-_]+$/; // Alphanumeric, dash, underscore

const processor = (obj, enteryName = '', message = message1) => {
    let data       = obj.target.result;
    let inputTag   = document.createElement("INPUT");
    inputTag.value = enteryName;

    swal(message, {
        content: inputTag,
        buttons: true,
        customClass: 'swal-modal',
    }).then((value) => {
        if (value) {
            enteryName = inputTag.value.replace(/ /g, "_");

            if (enteryName.length < 0 || enteryName.length > 54 || enteryName.search(regexp) == -1) {
                processor(obj, "", "Allowed: a-z, A-Z, 0-9, -, _ Please try again...\nName too long or none provided; or, unacceptable character used.");
                return ;
            }

            try {
                console.log("Importing session...");
                JSON.parse(data);
                browser.storage.local.set({[enteryName]: data});
                swal("Imported file successfully.", {
                    icon: "success",
                });
            } catch (e) {
                swal("Failed to import data. Not a JSON parsable file.", {
                    icon: "error",
                });
                return ;
            }
        } else {
            swal("Canceled import.", {
                icon: "warning",
            });
        }
    });
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
