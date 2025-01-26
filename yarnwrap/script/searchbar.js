// getting all required elements
const searchWrapper = document.querySelector(".search-input");
const inputBox = searchWrapper.querySelector("input");
const suggBox = searchWrapper.querySelector(".autocom-box");
const icon = searchWrapper.querySelector(".icon");
let linkTag = searchWrapper.querySelector("a");
let webLink;
// if user press any key and release

let lastChecked = 0;
let queued = false;
inputBox.onfocus = () => {
    document.getElementById("indexing").hidden = true;
    let elapsed = Date.now() - lastChecked;

    if (elapsed < 1000) {
        queued = true;
        setTimeout(inputBox.onkeyup, 1000 - elapsed);
    } else {
        updateSuggest();
    }
};

inputBox.onkeyup = (e) => {
    if (!/^[a-zA-Z0-9]|\.$/.test(e.key) || e.key.length !== 1) {
        return;
    }

    inputBox.onfocus();
};

window.onkeydown = (e) => {
    if (e.ctrlKey) return;
    if (e.key === "Enter" && searchWrapper.classList.contains("active")) {
        if (suggBox.children.length !== 0) {
            suggBox.children[0].onclick();
            return;
        }
    }

    if (/^[a-zA-Z0-9]|\.$/.test(e.key) && e.key.length === 1) {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
        if (new URLSearchParams(window.location.search).get("q") !== null) {
            inputBox.value = "";
        }
        inputBox.focus();
    }
};

let updateSuggest = (size) => {
    if (inputBox.value.length !== 0)
        document.getElementById("indexing").hidden = true;
    if (size === undefined) size = 20;
    window.history.pushState(null, "", window.location.pathname);

    let userData = inputBox.value;
    let emptyArray = [];
    if (userData) {
        userData = userData.toLocaleLowerCase();

        let more = false;
        function insert(priority, value, key) {
            if (
                emptyArray.length == size &&
                emptyArray[emptyArray.length - 1][0] > priority
            ) {
                return;
            }

            li = document.createElement("li");
            li.setAttribute("qname", value.qualified);
            li.setAttribute("type", value.type);

            span1 = document.createElement("span");
            span1.classList.add("label");
            span1.innerText = key;

            span2 = document.createElement("span");
            span2.classList.add("qname");
            span2.innerText = value.qualified;

            li.appendChild(span1);
            li.appendChild(span2);

            for (let i = emptyArray.length; i > 0; i--) {
                if (emptyArray[i - 1][0] > priority) {
                    emptyArray.splice(i, 0, [priority, li]);
                    if (emptyArray.length > size) {
                        more = true;
                        emptyArray.pop();
                    }
                    return;
                }
            }

            emptyArray.splice(0, 0, [priority, li]);
            if (emptyArray.length > size) {
                more = true;
                emptyArray.pop();
            }
        }

        for (const [key, value] of Object.entries(flatNameIndex)) {
            if (value.qualified.toLocaleLowerCase().includes(userData)) {
                insert(
                    key.toLocaleLowerCase().includes(userData)
                        ? userData.length / key.length
                        : userData.length / value.qualified.length,
                    value,
                    key,
                );
            }
        }

        if (more) {
            let li = document.createElement("li");
            li.innerText = "Load more";
            li.setAttribute("size", emptyArray.length + Math.min(100, size));
            emptyArray.push([null, li]);
        }

        searchWrapper.classList.add("active"); //show autocomplete box
        infoHide();
        showSuggestions(emptyArray.map((arr) => arr[1]));
        let allList = suggBox.querySelectorAll("li");
        for (let i = 0; i < allList.length; i++) {
            //adding onclick attribute in all li tag
            allList[i].setAttribute("onclick", "select(this)");
        }
    } else {
        searchWrapper.classList.remove("active"); //hide autocomplete box
    }
};

function select(element) {
    if (element.innerText === "Load more") {
        updateSuggest(element.getAttribute("size"));
        return;
    }

    inputBox.value = element.getAttribute("qname");

    let params = new URLSearchParams(window.location.search);
    params.set("q", inputBox.value);
    history.pushState(null, "", "?" + params.toString());
    searchWrapper.classList.remove("active");
    infoShow();
}
function showSuggestions(list) {
    if (list.length === 0) searchWrapper.classList.remove("active");
    else suggBox.replaceChildren(...list);
}
