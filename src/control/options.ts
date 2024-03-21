import {FilterType, Settings} from "./control-api";
import {urlFilterListToRegex} from "../gendersprachekorrigieren";

function querySelector<T extends HTMLElement>(sel: string): T {
    return <T>document.querySelector(sel)!!;
}

function saveOptions() {
    function getRegExpErrors(re: string) {
        try {
            urlFilterListToRegex(re).test("blabla");
        } catch (e) {
            return `${e}`
        }
    }

    chrome.storage.sync.get(function (res: Settings) {
        if (res.filterliste == "Bei Bedarf" && !querySelector<HTMLInputElement>("#ondemandstate").checked) {
            configureOndemandInActive();
        }
        if (querySelector<HTMLInputElement>("#ondemandstate").checked) {
            configureOndemandActive();
        }
        let whitelist = querySelector<HTMLTextAreaElement>("#whitelist").value.trim();
        let blacklist = querySelector<HTMLTextAreaElement>("#blacklist").value.trim();

        let err = getRegExpErrors(whitelist);
        querySelector<HTMLSpanElement>("#whitelist-error").innerText = err || "";
        err = getRegExpErrors(blacklist);
        querySelector<HTMLSpanElement>("#blacklist-error").innerText = err || "";
        let settings: Settings = {
            aktiv: querySelector<HTMLInputElement>("#aktiv").checked,
            counter: querySelector<HTMLInputElement>("#counter").checked,
            invertiert: querySelector<HTMLInputElement>("#invertiert").checked,
            hervorheben: querySelector<HTMLInputElement>("#hervorheben").checked,
            hervorheben_style: querySelector<HTMLInputElement>("#hervorheben_style").value,
            doppelformen: querySelector<HTMLInputElement>("#doppelformen").checked,
            partizip: querySelector<HTMLInputElement>("#partizip").checked,
            skip_topic: querySelector<HTMLInputElement>("#skip_topic").checked,
            filterliste: querySelector<HTMLInputElement>('input[name="filterstate"]:checked').value as FilterType,
            whitelist: whitelist,
            blacklist: blacklist,
        };
        chrome.storage.sync.set(settings);
    });
}

function configureOndemandInActive() {
    querySelector<HTMLInputElement>("#aktiv").checked = true;
    querySelector("#aktiv").removeAttribute("disabled");
    querySelector("#skipvis").style.visibility = "visible";
    querySelector("#aktiv-description").textContent = "Filterung aktiv";
    querySelector("#aktiv-description").style.color = 'inherit';
}

function configureOndemandActive() {
    querySelector<HTMLInputElement>("#aktiv").checked = false;
    querySelector("#aktiv").setAttribute("disabled", "disabled");
    querySelector("#skipvis").style.visibility = "hidden";
    querySelector("#aktiv-description").textContent = 'Filterung aktiv (Filtermodus "Nur bei Bedarf filtern" ist ausgewählt)';
    querySelector("#aktiv-description").style.color = 'grey';
}

function restoreOptions() {
    chrome.storage.sync.get(function (res: Required<Settings>) {
        querySelector<HTMLInputElement>("#aktiv").checked = res.aktiv;
        querySelector<HTMLInputElement>("#counter").checked = res.counter;
        querySelector<HTMLInputElement>("#invertiert").checked = res.invertiert;
        querySelector<HTMLInputElement>("#hervorheben").checked = res.hervorheben;
        querySelector<HTMLInputElement>("#hervorheben_style").value = res.hervorheben_style;
        querySelector<HTMLInputElement>("#doppelformen").checked = res.doppelformen;
        querySelector<HTMLInputElement>("#partizip").checked = res.partizip;
        querySelector<HTMLInputElement>("#skip_topic").checked = res.skip_topic;
        querySelector<HTMLTextAreaElement>("#whitelist").value = res.whitelist;
        querySelector<HTMLTextAreaElement>("#blacklist").value = res.blacklist;

        const filterListMapping: { [key in FilterType]: string } = {
            "Whitelist": "#whiteliststate",
            "Blacklist": "#blackliststate",
            "Bei Bedarf": "#ondemandstate",
        };

        const filterSelector = filterListMapping[res.filterliste] || "#none";
        querySelector<HTMLInputElement>(filterSelector).checked = true;

        if (res.filterliste === "Bei Bedarf") {
            configureOndemandActive();
        }

        onHighlightChange();
    });
}

export function onHighlightChange() {
    let styleInp = querySelector<HTMLInputElement>("#hervorheben_style");
    for (let e of document.getElementsByClassName('entgendy-change') as any) {
        e.setAttribute("style", styleInp.value);
    }
    verzoegertesSpeichern();
}

export function onHighlightExampleChange() {
    let value = querySelector<HTMLSelectElement>("#hervorheben-beispiele").value;
    let styleInp = querySelector<HTMLInputElement>("#hervorheben_style");
    styleInp.value = value;
    onHighlightChange();
}

let hervorheben_style = querySelector("#hervorheben_style");
hervorheben_style.onkeyup = onHighlightChange
querySelector("#hervorheben-beispiele").onchange = onHighlightExampleChange;

document.addEventListener('DOMContentLoaded', restoreOptions);

const choices = document.querySelectorAll("input");
for (let i = 0; i < choices.length; i++) {
    choices[i].addEventListener("click", saveOptions);
}

const verzoegertesSpeichern = function () {
    let callcount = 0;
    const action = function () {
        saveOptions();
    };
    const delayAction = function (action: () => void, time: number) {
        const expectcallcount = callcount;
        const delay = function () {
            if (callcount == expectcallcount) {
                action();
            }
        };
        setTimeout(delay, time);
    };
    return function () {
        ++callcount;
        delayAction(action, 1000);
    };
}();

//Verzögerung bevor Tasteneingabe abgespeichert wird
querySelector("form").onkeyup = verzoegertesSpeichern;

//Chrome-spezifisches Stylesheet für options.html
if (navigator.userAgent.toLowerCase().indexOf('chrome') > -1) {

    const link = document.createElement("link");
    link.href = "./css/chrome.css";
    link.rel = "stylesheet";

    document.getElementsByTagName("head")[0].appendChild(link);
}