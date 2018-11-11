document.getElementById("inputId").onchange = (e) => {
    var reader = new FileReader();
    reader.onloadend = function(obj){
        let data       = obj.target.result;
        let enteryName = prompt("What is this session's name?", "" + new Date().toLocaleString()
                                                                               .split(',')[0]);
        if (enteryName) {
            browser.storage.local.set({[enteryName]: data});
        }
    };

    if (e.target.files[0].type == "application/json")
        reader.readAsText(e.target.files[0], {encoding: "string"});
};


document.addEventListener("click", (e) => {
    if (e.button == 0) {  // Left click
        if (e.target.className == "container") {
            document.getElementById("inputId").click();
        }
    }
});
