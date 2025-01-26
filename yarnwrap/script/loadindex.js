const version = (() => {
    let filename = window.location.pathname
        .split("/")
        .filter((s) => s.length !== 0)
        .slice(-1)[0];

    if (filename.endsWith(".html")) {
        return filename.split(".").slice(0, -1).join(".");
    } else {
        return filename;
    }
})();
var index = {};
var flatNameIndex = {};

let methodCount = (classCount = 0);
let indexing = document.getElementById("indexing");

async function loadJSON() {
    try {
        document.getElementById("indexing").removeAttribute("hidden");
        const response = await fetch(`../index/${version}.json`); // Adjust the path as necessary
        if (!response.ok) {
            indexing.innerText = "Network response was not ok";
            return;
        }
        index = await response.json();
        flattenIndex();
        indexing.innerText = `Search ${classCount} classes and ${methodCount} methods`;

        if (new URLSearchParams(window.location.search).get("q")) {
            infoShow();
        } else {
            updateSuggest();
        }
    } catch (error) {
        console.error("Error fetching JSON:", error);
    }
}

function flattenIndex() {
    for (const [key, value] of Object.entries(index)) {
        flatNameIndex[value.name] = {
            qualified: key.slice(9),
            type: "class",
        };
        classCount++;

        for (const methodValue of value.methods) {
            flatNameIndex[`${value.name}.${methodValue.name}`] = {
                qualified: `${key.slice(9)}.${methodValue.name}`,
                type: "class",
            };
            methodCount++;
        }
    }
}

window.onload = loadJSON();
