import {Replacement} from './replacement'
import {Phettberg} from './schreibalternativen/phettberg';
import {
    BeGoneSettings,
    CountRequest,
    ErrorRequest,
    NeedOptionsRequest,
    Response,
    ResponseType
} from "./control/control-api";
import {SchreibAlternative} from "./schreibalternativen/alternative";
import {ChangeHighlighter} from "./ChangeHighlighter";
import {ChangeAllowedChecker} from "./changeAllowedChecker";
import {ifDebugging, stackToBeGone} from "./logUtil";

export function urlFilterListToRegex(list: string | undefined): RegExp {
    return RegExp(list ? list.replace(/(\r\n|\n|\r)/gm, "|") : "");
}

class BeGoneSettingsHelper {
    public static isWhitelist(settings: BeGoneSettings): boolean {
        return settings.filterliste === "Whitelist";
    }

    public static isBlacklist(settings: BeGoneSettings): boolean {
        return settings.filterliste === "Blacklist";
    }

    public static whitelistRegexp(settings: BeGoneSettings): RegExp {
        try {
            let res = urlFilterListToRegex(settings.whitelist);
            res.test("test");
            return res;
        } catch (e) {
            return RegExp("");
        }
    }

    public static blacklistRegexp(settings: BeGoneSettings): RegExp {
        try {
            let res = urlFilterListToRegex(settings.blacklist);
            res.test("test");
            return res;
        } catch (e) {
            return RegExp("^_matches_nothing_$");
        }
    }
}

function getFrameDocument(iframe: HTMLIFrameElement) {
    return iframe.contentDocument || iframe.contentWindow?.document;
}

export class BeGone {
    public version = 2.7; // TODO: warum ist hier ein version?
    private settings: BeGoneSettings = {aktiv: true, partizip: true, doppelformen: true, skip_topic: false};

    // Info / TODO: mtype kann wohl nur = "ondemand" sein, und anscheinend wird dieses Feld auch als "isOndemand" Feld genutzt.
    // TODO: umbauen, dies sollte ein boolean sein, sonst geht es kaputt wenn jemand ein neues ResponseType einführt
    private mtype: ResponseType | undefined = undefined;

    private replacer: SchreibAlternative;
    private readonly changeHighlighter = new ChangeHighlighter();
    private readonly changeAllowedChecker = new ChangeAllowedChecker();

    constructor(replacer: SchreibAlternative = new Phettberg(), settings?: BeGoneSettings) {
        this.replacer = replacer;
        if (settings) {
            this.settings = settings;
        }
    }

    private log(...s: any[]) {
        ifDebugging && console.log("BG", ...s, "\n" + stackToBeGone(1).join("\n"));
    }

    /**
     * supports iframes
     */
    private textNodesUnder(el: Node): Array<CharacterData> {
        this.log("textNodesUnder", el);
        let n, a = new Array<CharacterData>();
        let shouldNotBeChanged = this.changeAllowedChecker.shouldNotBeChanged;
        let acceptNode = (node: Node) => {
            //Nodes mit weniger als 5 Zeichen nicht filtern
            if (!node.textContent || node.textContent.length < 5) {
                // this.log("Rejected a", node);
                return NodeFilter.FILTER_REJECT;
            } else {
                //Eingabeelemente, <script>, <style>, <code>-Tags nicht filtern
                if (shouldNotBeChanged(node)) {
                    return NodeFilter.FILTER_REJECT;
                }
                    //Nur Nodes erfassen, deren Inhalt ungefähr zur späteren Verarbeitung passt
                // fahrende|ierende|Mitarbeitende|Forschende
                else if (/\b(und|oder|bzw)|[a-zA-ZäöüßÄÖÜ][\/\*.&_·:\(]-?[a-zA-ZäöüßÄÖÜ]|[a-zäöüß\(_\*:\.][iI][nN]|nE\b|r[MS]\b|e[NR]\b|ierten?\b|enden?\b|flüch/.test(node.textContent)) {
                    return NodeFilter.FILTER_ACCEPT;
                }
            }
            //this.log("Rejected b", node, node.textContent);
            return NodeFilter.FILTER_REJECT;
        };
        let walk = (el.ownerDocument || (el as Document)).createTreeWalker(el, NodeFilter.SHOW_TEXT, {acceptNode: acceptNode});
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

        let iframeTexts = this.textNodesInIframes(el);
        if (iframeTexts.length > 0) {
            a = a.concat(iframeTexts);
        }

        return a;
    }

    private textNodesInIframes(el: Node) {
        let a = new Array<CharacterData>();
        if (el.nodeType == Node.ELEMENT_NODE || el.nodeType == Node.DOCUMENT_NODE) {
            // Check for and handle iframes - assume same-origin or permissions granted
            let frames = (el as Element).getElementsByTagName('iframe');
            for (let i = 0; i < frames.length; i++) {
                try {
                    let iframe = frames[i];
                    // Recursively process the contentDocument of each iframe
                    let frameDocument = getFrameDocument(iframe);
                    if (frameDocument) {
                        this.installMutationObserver(frameDocument);
                        a = a.concat(this.textNodesUnder.call(this, frameDocument));
                    }
                } catch (error) {
                    this.log("Error accessing iframe content:", error);
                }
            }
        }
        if (a.length > 0) {
            this.log("iframe texgts", a)
        }
        return a;
    }

    public handleResponse(message: Response) {
        this.settings = JSON.parse(message.response);

        if (!this.settings.aktiv && this.settings.filterliste !== "Bei Bedarf" || this.settings.filterliste == "Bei Bedarf" && message.type !== "ondemand") return;

        this.mtype = message.type;
        if (this.currentPageNotExcludedByWhitelistOrBlackList()) {
            //Entfernen bei erstem Laden der Seite
            this.entferneInitial(document);

            //Entfernen bei Seitenänderungen
            this.installMutationObserver(document);
        }
    }


    private installMutationObserver(doc: Document) {
        try {
            if (doc.readyState !== "complete") {
                doc.addEventListener('readystatechange', () => {
                    if (doc.readyState !== "complete") {
                        return;
                    }
                    this.log('doc is fully loaded.', doc, doc.readyState);
                    this.entferneInitial(doc);
                    this.installMutationObserver(doc);
                });
                this.log("Incomplete load", doc, doc.readyState);
                return;
            }

            if (doc.documentElement.dataset['entgendyinstalled']) {
                return;
            }
            doc.documentElement.dataset['entgendyinstalled'] = "true";


            const observer = new MutationObserver((mutations: MutationRecord[]) => {
                // Der changeAllowedChecker muss geupdated werden bevor entferneInserted(.) aufgerufen wird
                this.changeAllowedChecker.handleMutations(mutations);

                let insertedNodes = new Array<CharacterData>();
                mutations.forEach((mutation: MutationRecord) => {
                    for (let i = 0; i < mutation.addedNodes.length; i++) {
                        insertedNodes = insertedNodes.concat(this.textNodesUnder(mutation.addedNodes[i]));
                    }
                });
                this.entferneInserted(insertedNodes);
            });
            observer.observe(doc, {
                childList: true,
                subtree: true,
                // attributes needed for changeAllowedChecker
                attributes: true,
                characterData: false
            });
        } catch (e) {
            console.error(e);
            chrome.runtime.sendMessage({
                action: 'error',
                page: doc.location.hostname,
                source: 'gendersprachekorrigieren.js',
                error: e
            } as ErrorRequest);
        }
    }

    private currentPageNotExcludedByWhitelistOrBlackList() {
        if (!BeGoneSettingsHelper.isWhitelist(this.settings) && !BeGoneSettingsHelper.isBlacklist(this.settings)) {
            // no filtering
            return true;
        }
        if (BeGoneSettingsHelper.isWhitelist(this.settings) && BeGoneSettingsHelper.whitelistRegexp(this.settings).test(document.URL)) {
            // White listed
            return true;
        }
        return BeGoneSettingsHelper.isBlacklist(this.settings) && !BeGoneSettingsHelper.blacklistRegexp(this.settings).test(document.URL);
    }

    /**
     * Supports iframes
     */
    private textContentOf(doc: Document): string {
        let bodyTextContent = doc.body.textContent ? doc.body.textContent : "";
        let iframes = Array.from(doc.getElementsByTagName("iframe")).map(getFrameDocument);

        let iframeDocs = iframes
            .map(doc => doc && this.textContentOf(doc)).join(" -- ")
        this.log("tco.iframes", iframes, iframeDocs, "#");
        return bodyTextContent + iframeDocs;
    }

    private probeDocument(doc: Document) {
        return this.probeDocumentContent(this.textContentOf(doc))
    }


    private probeDocumentContent(bodyTextContent: string = this.textContentOf(document)):
        {
            probeBinnenI: boolean,
            probeRedundancy: boolean,
            probePartizip: boolean,
            probeGefluechtete: boolean,
            probeArtikelUndKontraktionen: boolean;

        } {
        this.log("probeDocumentContent.bodyTextContent=", bodyTextContent);
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

    private applyToNodes(nodes: Array<CharacterData>, modifyData: (this: void, s: string) => string) {
        const textnodes = nodes;
        for (let i = 0; i < textnodes.length; i++) {
            const node = textnodes[i];
            const oldText = node.data;
            let newText = oldText;

            const parentNodeName = node.parentNode ? node.parentNode.nodeName.toLowerCase() : "";
            // special treatment of HTML nodes that are only there for formatting; those might tear a word out of it's context which is important for correcting
            if (this.isHTMLFormattingNodeName(parentNodeName)) {
                // this word needs to be replaced in context
                let oldTextInContext = (i > 0 ? textnodes[i - 1].data : "") + "\f" + oldText + "\f" + (i < textnodes.length - 1 ? textnodes[i + 1].data : "");
                //oldTextInContext = this.replaceLineBreak(oldTextInContext);
                oldTextInContext = modifyData(oldTextInContext);
                const index1 = oldTextInContext.indexOf("\f");
                const index2 = oldTextInContext.indexOf("\f", index1 + 1);
                const index3 = oldTextInContext.indexOf("\f", index2 + 1);
                if (index1 > -1 && index2 > -2 && index3 === -1) // sanity check - RegEx magic might remove our marker; fall back to old behavior in this case
                {
                    newText = oldTextInContext.substring(index1 + 1, index2);
                } else {
                    //oldText = this.replaceLineBreak(oldText);
                    newText = modifyData(oldText);
                }
            } else {
                //oldText = this.replaceLineBreak(oldText);
                newText = modifyData(oldText);
            }

            // this.log(node.data ,"!== ??", newText);
            if (node.data !== newText) {
                if (this.settings.hervorheben) {
                    // highlight the changed words with some <span>
                    this.changeHighlighter.apply(node, newText, this.settings.hervorheben_style);
                } else {
                    node.data = newText;
                }
            }
        }
    }

    public entferneInitial(doc: Document = document): void {
        this.log("entferneInitial")
        const probeResult = this.probeDocument(doc)

        if (probeResult.probeBinnenI || this.settings.doppelformen && probeResult.probeRedundancy || this.settings.partizip && probeResult.probePartizip || probeResult.probeArtikelUndKontraktionen) {
            let nodes = this.textNodesUnder(doc);

            if (this.settings.doppelformen && probeResult.probeRedundancy) {
                this.applyToNodes(nodes, this.replacer.entferneDoppelformen);
            }
            if (this.settings.partizip && probeResult.probePartizip) {
                this.applyToNodes(nodes, this.replacer.entfernePartizip);
            }
            if (probeResult.probeBinnenI) {
                this.applyToNodes(nodes, this.replacer.entferneBinnenIs);
            }
            if (this.settings.partizip && probeResult.probeGefluechtete) {
                this.applyToNodes(nodes, this.replacer.ersetzeGefluechteteDurchFluechtlinge);
            }

            if (probeResult.probeArtikelUndKontraktionen) {
                this.applyToNodes(nodes, this.replacer.artikelUndKontraktionen);
            }

            if (this.settings.counter) {
                this.sendCounttoBackgroundScript();
            }
        }
    }

    public entferneInitialForTesting(s: string): string {
        const probeResult = this.probeDocumentContent(s)

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
            if (this.settings.partizip && probeResult.probeGefluechtete) {
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
        this.log("entferneInserted");
        if (!this.settings.skip_topic || this.settings.skip_topic && this.mtype || this.settings.skip_topic && !/Binnen-I/.test(document.body.textContent ? document.body.textContent : "")) {
            if (this.settings.doppelformen) {
                this.applyToNodes(nodes, this.replacer.entferneDoppelformen);
            }
            if (this.settings.partizip) {
                this.applyToNodes(nodes, this.replacer.entfernePartizip);
            }
            this.applyToNodes(nodes, this.replacer.entferneBinnenIs);

            if (this.settings.partizip) {
                this.applyToNodes(nodes, this.replacer.ersetzeGefluechteteDurchFluechtlinge);
            }

            if (true && this.replacer.ersetzeMaskulinum) { // TODO: config this.settings.maskulinum
                this.applyToNodes(nodes, this.replacer.ersetzeMaskulinum);
            }

            this.applyToNodes(nodes, this.replacer.artikelUndKontraktionen);
            if (this.settings.counter) {
                this.sendCounttoBackgroundScript();
            }
        }
    }

    public notifyBackgroundScript() {
        chrome.runtime.sendMessage({
            action: 'needOptions'
        } as NeedOptionsRequest, (res: Response) => {
            this.handleResponse(res);
        });
    }

    private sendCounttoBackgroundScript() {
        chrome.runtime.sendMessage({
            countBinnenIreplacements: this.replacer.replacementsBinnen,
            countDoppelformreplacements: this.replacer.replacementsDoppel,
            countPartizipreplacements: this.replacer.replacementsPartizip,
            type: "count"
        } as CountRequest);
    }
}

if (typeof document != "undefined" && document.body.textContent) {
    const beGone = new BeGone();
    //Einstellungen laden
    beGone.notifyBackgroundScript();
    chrome.runtime.onMessage.addListener((message: Response) => {
        beGone.handleResponse(message);
    });
}