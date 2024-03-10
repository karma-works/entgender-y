import {generateTableRows, generateTableRowsUsingShadowDom} from "./inject-test-data";

console.log("Test-script start..");

function setClassOk(element: Element) {
    element.classList.remove("wrong");
    element.classList.add("correct");
}

function setClassWrong(element: Element) {
    element.classList.remove("correct", "wrong-partial-change");
    element.classList.add("wrong");
}

function setClassChangedWrong(element: Element) {
    element.classList.remove("correct", "wrong");
    element.classList.add("wrong-partial-change");
}

function checkValue() {
    let elementsToCheck = document.querySelectorAll(".observe-element[x-expected]");
    let errorCount = 0;
    let changedEditable = 0;

    document.querySelectorAll("[data-expectedHashCode]").forEach(el => {
        let expectedHashCode = el.getAttribute("data-expectedHashCode");
        let actualHashCode = hashCode(el.innerHTML);
        if (`${actualHashCode}` !== expectedHashCode) {
            el.setAttribute("title", `actual(${actualHashCode}) !== expected(${expectedHashCode})`);
            setClassWrong(el);
            errorCount++;
            if (el.getAttribute("editable")) {
                changedEditable++;
            }
        } else {
            setClassOk(el);
        }
    });

    for (let element of elementsToCheck) {
        let expected = element.getAttribute("x-expected");
        let original = element.getAttribute("x-original");
        let actual = element.textContent;
        if ((element.firstChild as any)?.closedShadowRootForTesting) {
            actual = (element.firstChild as any)?.closedShadowRootForTesting!!.textContent;
        }
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

    errorCountEl = document.getElementById("error-count-editable-changed")!!;
    if (changedEditable > 0) {
        errorCountEl.textContent = `${changedEditable} editierbarer element wurde verändert, obwohl es nicht sein soll`;
        setClassWrong(errorCountEl);
    } else {
        errorCountEl.textContent = "";
    }

}

function hashCode(string: string) {
    let hash = 0;
    for (let i = 0; i < string.length; i++) {
        const code = string.charCodeAt(i);
        hash = ((hash << 5) - hash) + code;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
}

function generateThenCheck() {
    if (document.location.href.endsWith("static.html")) {
        console.log("Static html test");
    } else if (new URLSearchParams(window.location.search).get("useShadow")) {
        generateTableRowsUsingShadowDom();
    } else {
        generateTableRows();
    }
    setTimeout(checkValue, 1000);
    setTimeout(checkValue, 10000);
}

(window as any).generateThenCheck = generateThenCheck;

generateThenCheck();

console.log("Test-script done");