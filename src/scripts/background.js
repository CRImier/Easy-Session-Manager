let processor = (obj, name) => {
    let data = obj.target.result;
    let enteryName = prompt("What is this session's name?", "" + name);
    console.log(name);
    if (enteryName) {
        browser.storage.local.set({[enteryName]: data});
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
