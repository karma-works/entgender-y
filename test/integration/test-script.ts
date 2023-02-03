import {generateTableRows} from "./inject-test-data";

console.log("Test-script start..");

function setClassOk(element:Element) {
    element.classList.remove("wrong");
    element.classList.add("correct");
}

function setClassWrong(element:Element) {
    element.classList.remove("correct", "wrong-partial-change");
    element.classList.add("wrong");
}

function setClassChangedWrong(element:Element) {
    element.classList.remove("correct", "wrong");
    element.classList.add("wrong-partial-change");
}

function checkValue() {
    let elementsToCheck = document.querySelectorAll(".observe-element[x-expected]");
    let errorCount = 0;
    for (let element of elementsToCheck) {
        let expected = element.getAttribute("x-expected");
        let original = element.getAttribute("x-original");
        let actual = element.textContent;
        let success = expected == actual;
        if (success) {
            setClassOk(element);
        } else if (original != actual) {
            setClassChangedWrong(element);
            errorCount++;
        } else {
            setClassWrong(element);
            errorCount++;
        }
    }
    let errorCountEl = document.getElementById("error-count")!!;
    errorCountEl.textContent = `${errorCount} Fehler gefunden`;
    if (errorCount > 0) {
        setClassWrong(errorCountEl);
    } else {
        setClassOk(errorCountEl);
    }
}


if (document.location.href.endsWith("static.html")) {
    console.log("Static html test");
} else {
    generateTableRows();
}
setTimeout(checkValue, 1000);

console.log("Test-script done");