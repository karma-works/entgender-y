import {FilterType, Settings} from "./control-api";

function querySelector<T extends HTMLElement>(sel: string): T {
    return <T>document.querySelector(sel)!!;
}
function saveOptions() {
    chrome.storage.sync.get(function (res: Settings) {
        if (res.filterliste == "Bei Bedarf" && querySelector<HTMLInputElement>("#ondemandstate").checked !== true) {
            configureOndemandInActive();
        }
        if (querySelector<HTMLInputElement>("#ondemandstate").checked) {
            configureOndemandActive();
        }
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
            whitelist: querySelector<HTMLTextAreaElement>("#whitelist").value.trim(),
            blacklist: querySelector<HTMLTextAreaElement>("#blacklist").value.trim()
        };
        chrome.storage.sync.set(settings);
    });
}

function configureOndemandInActive() {
    querySelector<HTMLInputElement>("#aktiv").checked = true;
    querySelector("#aktiv").removeAttribute("disabled");
    querySelector("#skipvis").style.visibility = "visible";
    querySelector("aktiv-description").textContent = "Filterung aktiv";
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

        if (res.filterliste == "Whitelist") {
            querySelector<HTMLInputElement>("#whiteliststate").checked = true;
        } else if (res.filterliste == "Blacklist") {
            querySelector<HTMLInputElement>("#blackliststate").checked = true;
        } else if (res.filterliste == "Bei Bedarf") {
            querySelector<HTMLInputElement>("#ondemandstate").checked = true;
            configureOndemandActive();
        } else {
            querySelector<HTMLInputElement>("#none").checked = true;
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
    return function (eventtrigger?: any) {
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