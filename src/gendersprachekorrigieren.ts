import {Replacement} from './replacement'
import {Const} from "./const";
import {Phettberg} from "./phettberg";

declare var chrome: any;

interface BeGoneSettings {
    aktiv?: boolean;
    doppelformen?: boolean;
    skip_topic?: boolean;
    partizip?: boolean;
    whitelist?: string;
    blacklist?: string;
    counter?: boolean;
    filterliste?: "Bei Bedarf" | "Whitelist" | "Blacklist" | undefined;
}

class BeGoneSettingsHelper {
    public static isWhitelist(settings: BeGoneSettings): boolean {
        return settings.filterliste === "Whitelist";
    }

    public static isBlacklist(settings: BeGoneSettings): boolean {
        return settings.filterliste === "Blacklist";
    }

    public static whiteliststring(settings: BeGoneSettings): string {
        return settings.whitelist ? settings.whitelist.replace(/(\r\n|\n|\r)/gm, "|") : "";
    }

    public static blackliststring(settings: BeGoneSettings): string {
        return settings.blacklist ? settings.blacklist.replace(/(\r\n|\n|\r)/gm, "|") : "";
    }
}

export class BeGone {
    public version = 2.7;
    private settings: BeGoneSettings = {aktiv: true, partizip: true, doppelformen: true, skip_topic: false};
    private nodes: Array<CharacterData> = new Array<CharacterData>();
    private mtype: string | undefined = undefined;

    private replacer: Phettberg = new Phettberg();

    private log(s: string) {
        //console.log(s);
    }

    private textNodesUnder(el: Node): Array<CharacterData> {
        var n, a = new Array<CharacterData>(),
            walk = document.createTreeWalker(
                el,
                NodeFilter.SHOW_TEXT,
                {
                    acceptNode: (node: Node) => {
                        //Nodes mit weniger als 5 Zeichen nicht filtern
                        if (!node.textContent || node.textContent.length < 5) {
                            return NodeFilter.FILTER_REJECT;
                        } else {
                            // note about filtering <pre> elements: those elements might contain linebreaks (/r/n etc.) that are removed during filtering to make filtering easier; the easy fix is to ignore those elements
                            var isUntreatedElement = node.parentNode ? (node.parentNode instanceof HTMLInputElement || node.parentNode instanceof HTMLTextAreaElement || node.parentNode instanceof HTMLScriptElement || node.parentNode instanceof HTMLStyleElement || node.parentNode instanceof HTMLPreElement || node.parentNode.nodeName == "CODE" || node.parentNode.nodeName == "NOSCRIPT") : false;
                            var isDivTextbox = document.activeElement && (document.activeElement.getAttribute("role") == "textbox" || document.activeElement.getAttribute("contenteditable") == "true") && document.activeElement.contains(node);

                            //Eingabeelemente, <script>, <style>, <code>-Tags nicht filtern
                            if (isUntreatedElement || isDivTextbox) {
                                return NodeFilter.FILTER_REJECT;
                            }
                            //Nur Nodes erfassen, deren Inhalt ungefähr zur späteren Verarbeitung passt
                            else if (/\b(und|oder|bzw)|[a-zA-ZäöüßÄÖÜ][\/\*.&_\(]-?[a-zA-ZäöüßÄÖÜ]|[a-zäöüß\(_\*:\.][iI][nN]|nE\b|r[MS]\b|e[NR]\b|fahrende|ierende|Mitarbeitende|Forschende|flüch/.test(node.textContent)) {
                                return NodeFilter.FILTER_ACCEPT;
                            }
                        }
                        return NodeFilter.FILTER_REJECT;
                    }

                },
                false);
        while (n = walk.nextNode() as CharacterData) {
            let nodeParent = n.parentNode;
            if (!nodeParent) {
                a.push(n);
            } else if (!this.isHTMLFormattingNodeName(nodeParent.nodeName)) {
                a.push(n);
            } else {
                // we've got a text node that will probably need context to be analyzed (like an word highlighted with a <mark> tag) - save the context nodes as well
                if (nodeParent.previousSibling && nodeParent.previousSibling.nodeType === 3) {
                    a.push(nodeParent.previousSibling as CharacterData);
                }
                a.push(n);
                if (nodeParent.nextSibling && nodeParent.nextSibling.nodeType === 3) {
                    a.push(nodeParent.nextSibling as CharacterData);
                }
            }
        }
        return a;
    }

    public handleResponse(message: { type?: string, response: string }) {
        this.settings = JSON.parse(message.response);

        if (!this.settings.aktiv && this.settings.filterliste !== "Bei Bedarf" || this.settings.filterliste == "Bei Bedarf" && message.type !== "ondemand") return;

        this.mtype = message.type;
        if (!BeGoneSettingsHelper.isWhitelist(this.settings) && !BeGoneSettingsHelper.isBlacklist(this.settings) || BeGoneSettingsHelper.isWhitelist(this.settings) && RegExp(BeGoneSettingsHelper.whiteliststring(this.settings)).test(document.URL) || BeGoneSettingsHelper.isBlacklist(this.settings) && !RegExp(BeGoneSettingsHelper.blackliststring(this.settings)).test(document.URL)) {
            //Entfernen bei erstem Laden der Seite
            this.entferneInitial();

            //Entfernen bei Seitenänderungen
            try {
                var observer = new MutationObserver((mutations: any) => {
                    var insertedNodes = new Array<CharacterData>();
                    mutations.forEach((mutation: any) => {
                        for (var i = 0; i < mutation.addedNodes.length; i++) {
                            insertedNodes = insertedNodes.concat(this.textNodesUnder(mutation.addedNodes[i]));
                        }
                    });
                    this.entferneInserted(insertedNodes);
                });
                observer.observe(document, {
                    childList: true,
                    subtree: true,
                    attributes: false,
                    characterData: false
                });
            } catch (e) {
                console.error(e);
                chrome.runtime.sendMessage({
                    action: 'error',
                    page: document.location.hostname,
                    source: 'gendersprachekorrigieren.js',
                    error: e
                });
            }
        }
    }


    private probeDocument(bodyTextContent: string = document.body.textContent ? document.body.textContent : ""):
        {
            probeBinnenI: boolean,
            probeRedundancy: boolean,
            probePartizip: boolean,
            probeGefluechtete: boolean,
            probeArtikelUndKontraktionen: boolean;

        } {
        let probeBinnenI = false;
        let probeRedundancy = false;
        let probePartizip = false;
        let probeGefluechtete = false;
        let probeArtikelUndKontraktionen = false;

        if (!this.settings.skip_topic || this.settings.skip_topic && this.mtype || this.settings.skip_topic && !/Binnen-I|Geflüchtete/.test(bodyTextContent)) {
            probeBinnenI = /[a-zäöüß]{2}((\/-?|_|\*|:|\.|\u00b7| und -)?In|(\/-?|_|\*|:|\.|\u00b7| und -)in(n[\*|\.]en)?|(\/-?|_|\*|:|\.|\u00b7)ze||(\/-?|_|\*|:|\.|\u00b7)a|(\/-?|_|\*|:|\.|\u00b7)nja|INNen|\([Ii]n+(en\)|\)en)?|\/inne?)(?!(\w{1,2}\b)|[A-Z]|[cf]o|t|act|clu|dex|di|line|ner|put|sert|stall|stan|stru|val|vent|v?it|voice)|[A-ZÄÖÜß]{3}(\/-?|_|\*|:|\.)IN\b|(der|die|dessen|ein|sie|ihr|sein|zu[rm]|jede|frau|man|eR\b|em?[\/\*.&_\(])/.test(bodyTextContent);
            probeArtikelUndKontraktionen = /[a-zA-ZäöüßÄÖÜ][\/\*.&_\(]-?[a-zA-ZäöüßÄÖÜ]/.test(bodyTextContent) || /der|die|dessen|ein|sie|ihr|sein|zu[rm]|jede|frau|man|eR\b|em?[\/\*.&_\(]-?e?r\b|em?\(e?r\)\b/.test(bodyTextContent);

            if (this.settings.doppelformen) {
                probeRedundancy = /\b(und|oder|bzw)\b/.test(bodyTextContent);
            }
            if (this.settings.partizip) {
                probePartizip = /ierende|Mitarbeitende|Forschende|fahrende|verdienende|Interessierte|Teilnehmende|esende/.test(bodyTextContent);
            }
            if (this.settings.partizip) {
                // immer "flüch" testen, "flücht" schlug wegen soft hyphens schon fehl
                probeGefluechtete = /flüch/.test(bodyTextContent);
            }
        }

        return {
            probeBinnenI: probeBinnenI,
            probeRedundancy: probeRedundancy,
            probePartizip: probePartizip,
            probeGefluechtete: probeGefluechtete,
            probeArtikelUndKontraktionen: probeArtikelUndKontraktionen
        }
    }

    private isHTMLFormattingNodeName(nodeName?: string): boolean {
        if (!nodeName) {
            return false;
        }

        nodeName = nodeName.toLowerCase();

        return nodeName === "mark"
            || nodeName === "b"
            || nodeName === "strong"
            || nodeName === "i"
            || nodeName === "em"
            || nodeName === "small"
            || nodeName === "del"
            || nodeName === "ins"
            || nodeName === "sub"
            || nodeName === "sup"
            || nodeName === "a";
    }

    // unfortunately this lead to newlines being removed in tweets on Twitter etc.; TODO: once FireFox supports the dotAll operator we should use this in the regexes instead, or modify the regexes to handle newlines as whitespace
    private replaceLineBreak(s: string) {
        let counter = function () {
        };
        return new Replacement(String.raw`(\n|\r|\r\n)`, "ig", " ", "").replace(s, counter);
    }

    private applyToNodes(nodes: Array<CharacterData>, modifyData: (s: string) => string) {
        var textnodes = nodes;
        for (var i = 0; i < textnodes.length; i++) {
            var node = textnodes[i];
            var oldText = node.data;
            var newText = oldText;

            var parentNodeName = node.parentNode ? node.parentNode.nodeName.toLowerCase() : "";
            // special treatment of HTML nodes that are only there for formatting; those might tear a word out of it's context which is important for correcting
            if (this.isHTMLFormattingNodeName(parentNodeName)) {
                // this word needs to be replaced in context
                var oldTextInContext = (i > 0 ? textnodes[i - 1].data : "") + "\f" + oldText + "\f" + (i < textnodes.length - 1 ? textnodes[i + 1].data : "");
                //oldTextInContext = this.replaceLineBreak(oldTextInContext);
                oldTextInContext = modifyData.call(this, oldTextInContext);
                var index1 = oldTextInContext.indexOf("\f");
                var index2 = oldTextInContext.indexOf("\f", index1 + 1);
                var index3 = oldTextInContext.indexOf("\f", index2 + 1);
                if (index1 > -1 && index2 > -2 && index3 === -1) // sanity check - RegEx magic might remove our marker; fall back to old behavior in this case
                {
                    newText = oldTextInContext.substring(index1 + 1, index2);
                } else {
                    //oldText = this.replaceLineBreak(oldText);
                    newText = modifyData.call(this, oldText);
                }
            } else {
                //oldText = this.replaceLineBreak(oldText);
                newText = modifyData.call(this, oldText);
            }

            if (node.data !== newText) {
                /*
                 TODO: consider highlighting the changed words (something like a git diff) with some <span>
                 Maybe https://www.npmjs.com/package/diff with Diff.diffWords
                 */
                node.data = newText;
            }
        }
    }

    public entferneInitial() {
        const probeResult = this.probeDocument()

        if (probeResult.probeBinnenI || this.settings.doppelformen && probeResult.probeRedundancy || this.settings.partizip && probeResult.probePartizip || probeResult.probeArtikelUndKontraktionen) {
            this.nodes = this.textNodesUnder(document)

            if (this.settings.doppelformen && probeResult.probeRedundancy) {
                this.applyToNodes(this.nodes, this.replacer.entferneDoppelformen);
            }
            if (this.settings.partizip && probeResult.probePartizip) {
                this.applyToNodes(this.nodes, this.replacer.entfernePartizip);
            }
            if (probeResult.probeBinnenI) {
                this.applyToNodes(this.nodes, this.replacer.entferneBinnenIs);
            }
            if (probeResult.probeGefluechtete) {
                this.applyToNodes(this.nodes, this.replacer.ersetzeGefluechteteDurchFluechtlinge);
            }

            if (probeResult.probeArtikelUndKontraktionen) {
                this.applyToNodes(this.nodes, this.replacer.artikelUndKontraktionen);
            }

            if (this.settings.counter) {
                this.sendCounttoBackgroundScript();
            }
        }
    }

    public entferneInitialForTesting(s: string): string {
        const probeResult = this.probeDocument(s)

        if (probeResult.probeBinnenI || this.settings.doppelformen && probeResult.probeRedundancy || this.settings.partizip && probeResult.probePartizip || this.settings.partizip && probeResult.probeGefluechtete || probeResult.probeArtikelUndKontraktionen) {
            if (this.settings.doppelformen && probeResult.probeRedundancy) {
                s = this.replacer.entferneDoppelformen(s);
            }
            if (this.settings.partizip && probeResult.probePartizip) {
                s = this.replacer.entfernePartizip(s);
            }
            if (probeResult.probeBinnenI) {
                s = this.replacer.entferneBinnenIs(s);
            }
            if (probeResult.probeGefluechtete) {
                s = this.replacer.ersetzeGefluechteteDurchFluechtlinge(s);
            }

            if (probeResult.probeArtikelUndKontraktionen) {
                s = this.replacer.artikelUndKontraktionen(s);
            }

            if (this.settings.counter) {
                this.sendCounttoBackgroundScript();
            }
        }
        return s;
    }

    private entferneInserted(nodes: Array<CharacterData>) {
        if (!this.settings.skip_topic || this.settings.skip_topic && this.mtype || this.settings.skip_topic && !/Binnen-I/.test(document.body.textContent ? document.body.textContent : "")) {
            if (this.settings.doppelformen) {
                this.applyToNodes(nodes, this.replacer.entferneDoppelformen);
            }
            if (this.settings.partizip) {
                this.applyToNodes(nodes, this.replacer.entfernePartizip);
            }
            this.applyToNodes(nodes, this.replacer.entferneBinnenIs);
            if (this.settings.counter) {
                this.sendCounttoBackgroundScript();
            }
        }
    }

    public notifyBackgroundScript() {
        chrome.runtime.sendMessage({
            action: 'needOptions'
        }, (res: { type?: string, response: string }) => {
            this.handleResponse(res);
        });
    }

    private sendCounttoBackgroundScript() {
        chrome.runtime.sendMessage({
            countBinnenIreplacements: this.replacer.replacementsBinnen,
            countDoppelformreplacements: this.replacer.replacementsDoppel,
            countPartizipreplacements: this.replacer.replacementsPartizip,
            type: "count"
        });
    }
}

if (typeof document != "undefined" && document.body.textContent) {
    const beGone = new BeGone();
    //Einstellungen laden
    beGone.notifyBackgroundScript();
    chrome.runtime.onMessage.addListener((message: { type?: string, response: string }) => {
        beGone.handleResponse(message);
    });
}