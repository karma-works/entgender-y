import {Request, Response, Settings} from "./control-api";
import MessageSender = chrome.runtime.MessageSender;

let settings: Partial<Settings> = {};

function updateSetting(setting: Partial<Settings>) {
    chrome.storage.sync.set(setting);
}

const DefaultSettings: Required<Settings> = {
    aktiv: true,
    invertiert: false,
    counter: true,
    doppelformen: true,
    partizip: false,
    skip_topic: false,
    filterliste: "Blacklist",
    whitelist: ".gv.at\n.ac.at\nderstandard.at\ndiestandard.at\nhttps://ze.tt/",
    blacklist: "stackoverflow.com\ngithub.com\nhttps://developer\nhttps://de.wikipedia.org/wiki/Gendersternchen",
    hervorheben_style: "text-decoration: underline wavy blue;",
    hervorheben: false,
};


function updateSettings() {
    chrome.storage.sync.get(function (res: Settings) {
        let settingsUpdate: Partial<Settings> = {};
        let needsUpdate = false;

        for (const key of Object.keys(DefaultSettings) as Array<keyof Settings>) {
            if (res[key] === undefined || res[key] === 'undefined') {
                // @ts-ignore
                settingsUpdate[key] = DefaultSettings[key];
                needsUpdate = true;
            }
        }

        if (needsUpdate) {
            updateSetting(settingsUpdate);

            chrome.storage.sync.get(function (resagain: Settings) {
                settings = resagain;
            });
        } else {
            settings = res;
        }
        updateIcon();
    });
}

function handleMessage(request: Request, sender: MessageSender, sendResponse: (response?: any) => void) {
    if (request.action == "needOptions") {
        sendResponse({
            response: JSON.stringify(settings)
        });
    } else if (sender.tab && request.type == "count" && request.countBinnenIreplacements + request.countDoppelformreplacements + request.countPartizipreplacements > 0) {
        const displayednumber = request.countBinnenIreplacements + request.countDoppelformreplacements + request.countPartizipreplacements;
        chrome.browserAction.setBadgeText({
            text: "" + displayednumber + "",
            tabId: sender.tab.id
        });
        /* Folgende Anzeige bereitet Probleme im Overflow-Menü von Firefox*/
        if (!settings.doppelformen && !settings.partizip) {
            chrome.browserAction.setTitle({
                title: "Filterung aktiv\n\nGefilterte Elemente auf dieser Seite\nBinnen-Is: " + request.countBinnenIreplacements,
                tabId: sender.tab.id
            });
        } else if (settings.doppelformen && !settings.partizip) {
            chrome.browserAction.setTitle({
                title: "Filterung aktiv\n\nGefilterte Elemente auf dieser Seite\nBinnen-Is: " + request.countBinnenIreplacements + "\nDoppelformen: " + request.countDoppelformreplacements,
                tabId: sender.tab.id
            });
        } else if (!settings.doppelformen && settings.partizip) {
            chrome.browserAction.setTitle({
                title: "Filterung aktiv\n\nGefilterte Elemente auf dieser Seite\nBinnen-Is: " + request.countBinnenIreplacements + "\nPartizipformen: " + request.countPartizipreplacements,
                tabId: sender.tab.id
            });
        } else if (settings.doppelformen && settings.partizip) {
            chrome.browserAction.setTitle({
                title: "Filterung aktiv\n\nGefilterte Elemente auf dieser Seite\nBinnen-Is: " + request.countBinnenIreplacements + "\nDoppelformen: " + request.countDoppelformreplacements + "\nPartizipformen: " + request.countPartizipreplacements,
                tabId: sender.tab.id
            });
        }
    }
}

function sendMessage(tabId: number, message: Response) {
    chrome.tabs.sendMessage(tabId, message);
}

function sendMessageToTabs(tabs: chrome.tabs.Tab[]) {
    for (let tab of tabs) {
        if (tab.id == null) {
            continue;
        }
        sendMessage(
            tab.id, {
                response: JSON.stringify(settings),
                type: "ondemand"
            });
    }
}

function updateIcon() {
    chrome.storage.sync.get(function (res: Settings) {
        if (res.filterliste == "Bei Bedarf") {
            chrome.browserAction.setTitle({
                title: 'Klick entgendert Binnen-Is auf dieser Seite'
            });
            if (res.invertiert !== true) {
                chrome.browserAction.setIcon({
                    path: 'images/iconOff.png'
                });
            } else if (res.invertiert === true) {
                chrome.browserAction.setIcon({
                    path: 'images/iconOffi.png'
                });
            }
        } else if (res.aktiv === true) {
            chrome.browserAction.setTitle({
                title: 'Filterung aktiv'
            });
            if (res.invertiert !== true) {
                chrome.browserAction.setIcon({
                    path: 'images/iconOn.png'
                });
            } else if (res.invertiert === true) {
                chrome.browserAction.setIcon({
                    path: 'images/iconOni.png'
                });
            }
        } else {
            chrome.browserAction.setTitle({
                title: 'Entgenderung deaktiviert'
            });
            if (res.invertiert !== true) {
                chrome.browserAction.setIcon({
                    path: 'images/iconOff.png'
                });
            } else if (res.invertiert === true) {
                chrome.browserAction.setIcon({
                    path: 'images/iconOffi.png'
                });
            }
        }
    });
}

function ButtonClickHandler() {
    chrome.storage.sync.get(function (res: Settings) {
        if (res.filterliste == "Bei Bedarf") {
            chrome.tabs.query({
                currentWindow: true,
                active: true
            }, function (tabs) {
                sendMessageToTabs(tabs);
                if (res.invertiert !== true) {
                    chrome.browserAction.setIcon({
                        path: 'images/iconOn.png',
                        tabId: tabs[0].id
                    });
                } else if (res.invertiert === true) {
                    chrome.browserAction.setIcon({
                        path: 'images/iconOni.png',
                        tabId: tabs[0].id
                    });
                }
            });
        } else if (res.aktiv === true) {
            updateSetting({
                aktiv: false
            });
        } else {
            updateSetting({
                aktiv: true
            });
            settings.aktiv = true;
            chrome.tabs.query({
                currentWindow: true,
                active: true
            }, function (tabs) {
                sendMessageToTabs(tabs);
            });
        }
    });
}

updateSettings();

//Kommunikation mit Content-Script
chrome.runtime.onMessage.addListener(handleMessage);

//Ein/aus bei Toolbar Klick
chrome.browserAction.onClicked.addListener(ButtonClickHandler);

//Icon aktualisieren bei Änderungen in Optionen
chrome.storage.onChanged.addListener(updateSettings);