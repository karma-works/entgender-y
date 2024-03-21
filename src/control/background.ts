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
    } else if (sender.tab && request.type == "count") {
        let totalCount = request.countBinnenIreplacements + request.countDoppelformreplacements + request.countPartizipreplacements;
        if (totalCount > 0) {
            chrome.browserAction.setBadgeText({
                text: totalCount.toString(),
                tabId: sender.tab.id
            });

            let titleDetails = ["Filterung aktiv", "Gefilterte Elemente auf dieser Seite"];

            /* Folgende Anzeige bereitet Probleme im Overflow-Menü von Firefox*/
            titleDetails.push(`Binnen-Is: ${request.countBinnenIreplacements}`);
            if (settings.doppelformen) {
                titleDetails.push(`Doppelformen: ${request.countDoppelformreplacements}`);
            }
            if (settings.partizip) {
                titleDetails.push(`Partizipformen: ${request.countPartizipreplacements}`);
            }

            chrome.browserAction.setTitle({
                title: titleDetails.join('\n'),
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
        let title;
        let iconPath;

        if (res.filterliste === "Bei Bedarf") {
            title = 'Klick entgendert Binnen-Is auf dieser Seite';
            iconPath = res.invertiert ? 'images/iconOffi.png' : 'images/iconOff.png';
        } else if (res.aktiv) {
            title = 'Filterung aktiv';
            iconPath = res.invertiert ? 'images/iconOni.png' : 'images/iconOn.png';
        } else {
            title = 'Entgenderung deaktiviert';
            iconPath = res.invertiert ? 'images/iconOffi.png' : 'images/iconOff.png';
        }

        chrome.browserAction.setTitle({title: title});
        chrome.browserAction.setIcon({path: iconPath});
    });
}

function ButtonClickHandler() {
    chrome.storage.sync.get(function (res: Settings) {
        if (res.filterliste === "Bei Bedarf") {
            chrome.tabs.query({currentWindow: true, active: true},
                function (tabs) {
                    sendMessageToTabs(tabs);
                    const iconPath = res.invertiert ? 'images/iconOni.png' : 'images/iconOn.png';
                    chrome.browserAction.setIcon({
                        path: iconPath,
                        tabId: tabs[0].id
                    });
                });
        } else {
            // Toggle 'aktiv' setting
            const newAktivStatus = !res.aktiv;
            updateSetting({aktiv: newAktivStatus});

            if (newAktivStatus) {
                // send message to tabs only when switching to active
                chrome.tabs.query({currentWindow: true, active: true}, sendMessageToTabs);
            }
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