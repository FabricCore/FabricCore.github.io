let info = document.getElementById("info");
let contained = document.getElementById("contained");

function infoHide() {
    info.setAttribute("hidden", true);
    contained.setAttribute("hidden", true);
}

window.onpopstate = infoShow;

function infoShow() {
    document.activeElement.blur();
    let query = new URLSearchParams(window.location.search).get("q");

    if (query === null) {
        info.setAttribute("hidden", true);
        contained.setAttribute("hidden", true);
        inputBox.value = "";
        return;
    }

    let method;

    if (index[`yarnwrap.${query}`] === undefined) {
        method = query.split(".").slice(-1)[0];
        query = query.split(".").slice(0, -1).join(".");

        if (
            index[`yarnwrap.${query}`] === undefined ||
            index[`yarnwrap.${query}`].methods.every((m) => m.name != method)
        ) {
            history.pushState(null, "", window.location.pathname);
            inputBox.innerText = "";
            return;
        }

        inputBox.value = `${query}.${method}`;
    } else {
        inputBox.value = query;
    }

    showClass(index[`yarnwrap.${query}`]);
    contained.innerHTML = `<span id="wrap">wrapperContained</span><span id="wrapperCol">:</span> <span id="wrapPackage">net.minecraft.${query.split(".").slice(0, -1)}.</span><span id="wrapName">${query.split(".").slice(-1)[0]}`;

    info.removeAttribute("hidden");
    contained.removeAttribute("hidden");

    if (method !== undefined) {
        let selected = document.getElementById(`method-${method}`);
        window.scrollTo({
            top: selected.offsetTop,
            behavior: "smooth",
        });
        selected.classList.add("flash");
    }
}

function showClass(obj) {
    document.getElementById("indexing").hidden = true;
    let methods = document.getElementById("methods");
    let children = [];

    for (const method of obj.methods) {
        let div = document.createElement("div");
        let h3 = document.createElement("h3");
        let ol = document.createElement("ol");

        if (method.is_constructor)
            h3.innerHTML += `<span class="mTypeHint">Public constructor</span>`;
        else if (method.is_static)
            h3.innerHTML += `<span class="mTypeHint">Static method</span>`;
        else 
            h3.innerHTML += `<span class="mTypeHint">Object method</span>`;

        h3.innerHTML += `<span class="mClass">${obj.name}</span><span class="mCol">::</span><span class="mName">${method.name}</span> <span class="mArrow">↩</span> <span class="mRetGroup"><span class="mRet">${method.value
            .split(".")
            .slice(0, -1)
            .map((s) => `${s}.`)
            .join(
                "",
            )}</span><span class="mRetName">${method.value.split(".").slice(-1)[0]}</span></span>`;

        if (method.is_constructor) method.value = "(constructor)";

        if (
            method.value.startsWith("yarnwrap.") ||
            method.value == "(constructor)"
        ) {
            h3.getElementsByClassName("mRetGroup")[0].onclick = () => {
                let params = new URLSearchParams(window.location.search);
                let newQ =
                    method.value == "(constructor)"
                        ? params.get("q")
                        : method.value.split(".").slice(1).join(".");
                params.set("q", newQ);
                history.pushState(null, "", "?" + params.toString());
                window.scrollTo({
                    top: 0,
                    behavior: params.get("q") === newQ ? "smooth" : "none",
                });
                infoShow();
            };
            h3.getElementsByClassName("mRetGroup")[0].classList.add(
                "clickable",
            );
        }

        div.id = `method-${method.name}`;

        for (const arg of method.args) {
            let li = document.createElement("li");
            let name = document.createElement("span");

            name.innerHTML = `<span class="argName">${arg.name}</span><span class="argCol">:</span> <span class="argTypeGroup"><span class="argValue">${arg.value
                .split(".")
                .slice(0, -1)
                .map((s) => `${s}.`)
                .join(
                    "",
                )}</span><span class="argValName">${arg.value.split(".").slice(-1)[0]}</span></span>`;

            if (arg.value.startsWith("yarnwrap.")) {
                name.getElementsByClassName("argTypeGroup")[0].onclick = () => {
                    let params = new URLSearchParams(window.location.search);
                    params.set("q", method.value.split(".").slice(1).join("."));
                    history.pushState(null, "", "?" + params.toString());
                    window.scrollTo({
                        top: 0,
                    });
                    infoShow();
                };
                name.getElementsByClassName("argTypeGroup")[0].classList.add(
                    "clickable",
                );
            }

            li.appendChild(name);
            ol.appendChild(li);
        }

        div.appendChild(h3);

        if (method.args.length === 0) {
            let hint = document.createElement("p");
            hint.innerText = "[no parameters]";
            hint.classList.add("noParam");
            div.appendChild(hint);
        } else {
            div.appendChild(ol);
        }

        div.appendChild(document.createElement("br"));
        children.push(div);
    }

    methods.replaceChildren(...children);
}
