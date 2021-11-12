import {Replacement} from './replacement'
import {Const} from "./const";

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
    private replacementsb = 0;
    private replacementsd = 0;
    private replacementsp = 0;
    private settings: BeGoneSettings = {aktiv: true, partizip: true, doppelformen: true, skip_topic: false};
    private nodes: Array<CharacterData> = new Array<CharacterData>();
    private mtype: string | undefined = undefined;

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

    private artikelUndKontraktionen(s: string): string {
        var outer = this;
        let counter = function () {
            outer.replacementsb++;
        };


        if (/[a-zA-ZäöüßÄÖÜ][\/\*.&_\(]-?[a-zA-ZäöüßÄÖÜ]/.test(s) || /der|die|dessen|ein|sie|ihr|sein|zu[rm]|jede|frau|man|eR\b|em?[\/\*.&_\(]-?e?r\b|em?\(e?r\)\b/.test(s)) {
            this.log("11000");

            s = new Replacement(String.raw`\b(eine)${Const.gstar}(n selbst)\b`, "g", "$1$2", "eine:n selbst").replace(s, counter);

            //Stuff
            if (/der|die|dessen|ein|sie|ih[rmn]|zu[rm]|jede/i.test(s)) {
                s = new Replacement(String.raw`\b(d)(ie${Const.gstar}der|er${Const.gstar}die)\b`, "ig", "\$1as", "").replace(s, counter);
                s = new Replacement(String.raw`\b(d)(en${Const.gstar}die|ie${Const.gstar}den)\b`, "ig", "\$1as", "").replace(s, counter);
                s = new Replacement(String.raw`\b(d)(es${Const.gstar}der|er${Const.gstar}des)\b`, "ig", "\$1es", "").replace(s, counter);
                s = new Replacement(String.raw`\b(d)(er${Const.gstar}dem|em${Const.gstar}der)\b`, "ig", "\$1em", "").replace(s, counter);
                s = new Replacement(String.raw`b(d)(eren${Const.gstar}dessen|essen${Const.gstar}deren)\b`, "ig", "\$1essen", "").replace(s, counter);
                s = new Replacement(String.raw`\bdiese[r]?${Const.gstar}(diese[rnms])`, "ig", "\$1", "1").replace(s, counter);
                s = new Replacement(String.raw`(diese[rnms])${Const.gstar}diese[r]?\b`, "ig", "\$1", "2").replace(s, counter);
                s = new Replacement(String.raw`\b([KkDMSdms]?[Ee])in(${Const.gstar}e |\(e\) |E )`, "g", "\$1in ", "").replace(s, counter);
                s = new Replacement(String.raw`\b([KkDMSdms]?[Ee])ine(${Const.gstar}r |\(r\) |R )`, "g", "\$1iner ", "").replace(s, counter);
                s = new Replacement(String.raw`\b([KkDMSdms]?[Ee])iner(${Const.gstar}s |\(S\) |S )`, "g", "\$1ines ", "").replace(s, counter);
                s = new Replacement(String.raw`\b([KkDMSdms]?[Ee])ines(${Const.gstar}r |\(R\) |R )`, "g", "\$1ines ", "").replace(s, counter);
                s = new Replacement(String.raw`\b([KkDMSdms]?[Ee])iner(${Const.gstar}m |\(m\) |M )`, "g", "\$1inem ", "").replace(s, counter);
                s = new Replacement(String.raw`\b([KkDMSdms]?[Ee])inem(${Const.gstar}r |\(r\) |R )`, "g", "\$1inem ", "").replace(s, counter);
                s = new Replacement(String.raw`\b([KkDMSdms]?[Ee])ine(m|r)${Const.gstar}([KkDMSdms]?[Ee])ine(m |r )`, "g", "\$1inem ", "einer_einem, keiner_keinem").replace(s, counter);
                s = new Replacement(String.raw`\b([KkDMSdms]?[Ee])ine?(m|r)?${Const.gstar}([KkDMSdms]?[Ee])ine?(m |r )?`, "g", "\$1in", "ein/eine").replace(s, counter);
                s = new Replacement(String.raw`\b([KkDMSdms]?[Ee])ine(${Const.gstar}n |\(n\) |N )`, "g", "\$1in ", "").replace(s, counter);
                s = new Replacement(String.raw`\bsie${Const.gstar}er|er${Const.gstar}sie\b`, "g", "er", "").replace(s, counter);
                s = new Replacement(String.raw`\bSie${Const.gstar}[Ee]r|Er${Const.gstar}[Ss]ie\b`, "g", "Es", "").replace(s, counter);
                s = new Replacement(String.raw`\b(i)(hr${Const.gstar}ihm|hm${Const.gstar}ihr)\b`, "ig", "\$1hm", "").replace(s, counter);
                s = new Replacement(String.raw`\bsie${Const.gstar}ihn|ihn${Const.gstar}ie\b`, "g", "ihn", "").replace(s, counter);
                s = new Replacement(String.raw`\bSie${Const.gstar}[Ii]hn|Ihn${Const.gstar}[Ss]ie\b`, "g", "Ihn", "").replace(s, counter);
                s = new Replacement(String.raw`\bihr${Const.gstar}e\b`, "ig", "ihr", "ihr*e Partner*in").replace(s, counter);
                s = new Replacement(String.raw`\bihre?[rnms]?${Const.gstar}(seine?[rnms]?)`, "ig", "\$1", "ihr*e Partner*in").replace(s, counter);
                s = new Replacement(String.raw`(seine?[rnms]?)${Const.gstar}ihre?[rnms]?\b`, "ig", "\$1", "ihr*e Partner*in").replace(s, counter);
                s = new Replacement(String.raw`\b(z)(um${Const.gstar}zur|ur${Const.gstar}zum)\b`, "ig", "\$1um", "").replace(s, counter);
                s = new Replacement(String.raw`jede[rnms]?${Const.gstar}(jede[rnms]?)\b`, "ig", "\$1", "").replace(s, counter);
            }

            //extra Stuff
            if (/eR\b|(?<![kK]art)(?<![kK]onnt)em?[\/\*_\(-]{1,2}e?[rn]\b|em?\(e?r\)\b/.test(s)) {
                s = new Replacement(String.raw`(?<beginning>m\b.{3,30})(?<star>[\/\*_\(-]{1,2})(?<suffix>[rn])\b`, "ig", "\$1\$3", "Dativ: einem progressive*n Staatsoberhaupt").replace(s, counter);
                s = new Replacement(String.raw`(\b[a-zäöü]+e)([\/\*_\(-]+)(n|e\(n\)|eN\b)`, "g", "\$1s", "jede*n, europäische*n").replace(s, counter);
                s = new Replacement(String.raw`([\b“ ][A-ZÄÖÜ]\w+)(e[\/\*_\(-]+)(n|e\(n\)|eN[\b“ ])`, "g", "\$1" + Const.y, "Wehrbeauftragte*n“").replace(s, counter);
                s = new Replacement(String.raw`e[\/\*_\(-]+r|e\(r\)|eR\b`, "g", "es", "jede/r,jede(r),jedeR").replace(s, counter);
                s = new Replacement(String.raw`em\(e?r\)|em[\/\*_\(-]+r\b`, "g", "em", "jedem/r").replace(s, counter);
                s = new Replacement(String.raw`er\(e?s\)|es[\/\*_\(-]+r\b`, "g", "es", "jedes/r").replace(s, counter);
            }

            //man
            if (/\/(frau|man|mensch)/.test(s)) {
                let repl3 = new Replacement(String.raw`\b(frau|man+|mensch)+[\/\*_\(-](frau|man+|mensch|[\/\*_\(-])*`, "", "man", "");
                s = repl3.replace(s, counter);
            }
        }

        return s;
    }

    private entferneUnregelmaessigeFormen(s: string): string {
        let outer = this;
        let counter = function () {
            outer.replacementsb++;
        };

        // Sinti*ze und Rom*nja
        s = new Replacement(String.raw`\bSinti(\/-?|_|\*|:|\.|\x00b7)ze\b`, "g",
            "Sint" + Const.ys, "Sinti*ze und Rom*nja").replace(s, counter);
        s = new Replacement(String.raw`\bRom(\/-?|_|\*|:|\.|\x00b7)nja\b`, "g", "Rom" + Const.ys, "Sinti*ze und Rom*nja").replace(s, counter);
        ;

        s = new Replacement(String.raw`\bMuslim(\/-?|_|\*|:|\.|\xb7)a\b`, "g", "Muslim" + Const.y , "").replace(s, counter);

        return s;
    }


    private entferneBinnenIs(s: string): string {
        this.log("10000");
        let outer = this;
        let counter = function () {
            outer.replacementsb++;
        };

        // entferne *x am Ende
        if (/\*x/.test(s)) {
            // behandle "einer/m*x progressive*n*x"
            s = new Replacement(String.raw`([\w\/*]+)\*x\b\b`, "ig", "\$1", "").replace(s, counter);
        }

        // unregelmässige Pluralformen
        s = this.entferneUnregelmaessigeFormen(s);

        if (/[a-zäöüß\u00AD\u200B]{2}((\/-?|_|\*|:|\.|\u00b7| und -)?In|(\/-?|_|\*|:|\.|\u00b7| und -)in(n[\*|\.]en)?|INNen|\([Ii]n+(en\)|\)en)?|\/inne?)(?!(\w{1,2}\b)|[A-Z]|[cf]o|te[gr]|act|clu|dex|di|line|ner|put|sert|stall|stan|stru|val|vent|v?it|voice)|[A-ZÄÖÜß\u00AD\u200B]{3}(\/-?|_|\*|:|\.)IN\b/.test(s)) {
            this.log("12000");
            s = new Replacement(String.raw`[\u00AD\u200B]`, "g", "", "entfernt soft hyphens").replace(s, counter);

            //Prüfung auf Ersetzung
            if (/[a-zäöüß](\/-?|_|\*|:|\.|\u00b7| und -)in\b/i.test(s) || /[a-zäöüß](\/-?|_|\*|:|\.|\u00b7| und -)inn(\*|\.|\))?en/i.test(s) || /[a-zäöüß](\(|\/)in/i.test(s) || /[a-zäöüß]INNen/.test(s)) {
                this.log("12100");
                s = new Replacement(String.raw`(\/-?|_|\*|:|\u00b7|\.)inn(\*|\.|\/)?e(\*|\.|\/)?n`, "ig", "Innen", "Schüler/innen").replace(s, counter);
                s = new Replacement(String.raw`([a-zäöüß])\(inn(en\)|\)en)`, "ig", "\$1Innen", "Schüler(innen)").replace(s, counter);
                s = new Replacement(String.raw`([a-zäöüß])INNen`, "g", "\$1Innen", "SchülerINNen").replace(s, counter);
                s = new Replacement(String.raw` und -innen\b`, "ig", "", "und -innen").replace(s, counter);
                s = new Replacement(String.raw`(?<!https:\/\/lnkd)(er)?(${Const.gstar})in\b`, "ig", Const.y, "Schüler/in").replace(s, counter);
                s = new Replacement(String.raw`([a-zäöüß])\(in\)`, "ig", "$1In", "Schüler(in)").replace(s, counter);
                this.log(s);
            }

            //Plural
            if (/[a-zäöüß]Innen/i.test(s)) {
                this.log("12200");
                //Prüfung auf Sonderfälle
                if (/(chef|fan|gött|verbesser|äur|äs)innen/i.test(s)) {
                    s = new Replacement(String.raw`(C|c)hefInnen`, "g", "\$1hef" + Const.ys, "").replace(s, counter);

                    s = new Replacement(String.raw`(F|f)anInnen`, "g", "\$1ans", "").replace(s, counter);
                    s = new Replacement(String.raw`([Gg]ött|verbesser)(?=Innen)`, "g", "\$1" + Const.ys, "").replace(s, counter);
                    s = new Replacement(String.raw`äue?rInnen`, "g", "auern", "").replace(s, counter);
                    s = new Replacement(String.raw`äsInnen`, "g", "as" + Const.ys, "").replace(s, counter);
                }
                // statt Leerzeichen kommt [\s]{1,2} zum Einsatz -> Leerzeichen oder Leerzeichen + Markerzeichen für die Kontexterkennung (hacky, aber so what)
                s = new Replacement(String.raw`\b(([Dd]en|[Aa]us|[Aa]ußer|[Bb]ei|[Dd]ank|[Gg]egenüber|[Ll]aut|[Mm]it(samt)?|[Nn]ach|[Ss]amt|[Vv]on|[Uu]nter|[Zz]u|[Ww]egen|[MmSsDd]?einen)(?: zwei| drei| [0-9]+)?[\s]{1,2}([ID]?[a-zäöüß]+en[\s]{1,2}|[0-9.,]+[\s]{1,2})?[A-ZÄÖÜ][a-zäöüß]+)erInnen\b`, "g", "\$1" + Const.ys, "unregelmäßiger Dativ bei Wörtern auf ...erInnen").replace(s, counter);

                s = new Replacement(String.raw`(er?|ER?)Innen`, "g", Const.ys, "").replace(s, counter);

                // Notiz: (?:[A-Z][a-zöüä]+\b[,] |[A-Z][*I_ïa-zöüä]+\b und ) soll Aufzählungen erkennen, die mit Komma oder "und" verkettet sind; bspw. "AutorInnen und FreundInnen", was der Anlass für diese Regel war (als Kopie von Markierung 1)
                s = new Replacement(String.raw`((?:von[\s]{1,2}|mit[\s]{1,2})(?:[A-Z][a-zöüä]+\b[,][\s]{1,2}|[A-Z][*I_ïa-zöüä]+\b und[\s]{1,2})[a-zA-Zöäüß]*?)([Aa]nwält|[Ää]rzt|e[iu]nd|rät|amt|äst|würf|äus|[ai(eu)]r|irt)Innen`, "g", "\$1\$2" + Const.ys, "").replace(s, counter);

                // Markierung 1
                s = new Replacement(String.raw`([Aa]nwält|[Ää]rzt|e[iu]nd|rät|amt|äst|würf|äus|[ai(eu)]r|irt)Innen`, "g", "\$1" + Const.ys, "").replace(s, counter);
                s = new Replacement(String.raw`([nrtsmdfghpbklvwNRTSMDFGHPBKLVW])Innen`, "g", "\$1" + Const.ys, "").replace(s, counter);
            }

            //Singular			
            if (/[a-zäöüß]In/.test(s) && !/([Pp]lug|Log|[Aa]dd|Linked)In\b/.test(s)) {
                this.log("12300");
                //Prüfung auf Sonderfälle

                if (/amtIn|stIn\B|verbesser(?=In)/.test(s)) {
                    s = new Replacement(String.raw`verbesserIn`, "g", "verbess" + Const.y, "").replace(s, counter);
                    s = new Replacement(String.raw`amtIn`, "g", "amt" + Const.y, "").replace(s, counter);
                    s = new Replacement(String.raw`stIn\B(?!(\w{1,2}\b)|[A-Z]|[cf]o|te[gr]|act|clu|dex|di[ac]|line|ner|put|sert|stall|stan|stru|val|vent|v?it|voice)`, "g", "st" + Const.y, "JournalistInfrage").replace(s, counter);
                }
                //Prüfung auf Umlaute
                if (/[äöüÄÖÜ][a-z]{0,3}In/.test(s)) {
                    s = new Replacement(String.raw`ä(?=s(t)?In|tIn|ltIn|rztIn)`, "g", "a", "").replace(s, counter);
                    s = new Replacement(String.raw`ÄrztIn`, "g", "Arzt" + Const.y, "").replace(s, counter);
                    s = new Replacement(String.raw`ö(?=ttIn|chIn)`, "g", "o", "").replace(s, counter);
                    s = new Replacement(String.raw`ü(?=rfIn)`, "g", "u", "").replace(s, counter);
                    s = new Replacement(String.raw`ündIn`, "g", "und", "").replace(s, counter);
                    s = new Replacement(String.raw`äue?rIn`, "g", "auer", "").replace(s, counter);
                }
                s = new Replacement(String.raw`\b(([Dd]en|[Aa]us|[Aa]ußer|[Bb]ei|[Dd]ank|[Gg]egenüber|[Ll]aut|[Mm]it(samt)?|[Nn]ach|[Ss]amt|[Uu]nter|[Vv]on|[Zz]u|[Ww]egen|[MmSsDd]?eine[mnrs]) ([ID]?[a-zäöüß]+en)?[A-ZÄÖÜ][a-zäöüß]+)logIn\b`, "g", "log" + Const.y, "unregelmäßiger Dativ bei eine/n Psycholog/in").replace(s, counter);

                s = new Replacement(String.raw`([skgvwzSKGVWZ]|ert|[Bb]rit|[Kk]und|ach)In(?!(\w{1,2}\b)|[A-Z]|[cf]o|te[gr]|act|clu|dex|di|line|ner|put|sert|stall|stan|stru|val|vent|v?it|voice)`, "g", "\$1" + Const.y, "ExpertIn, BritIn, KundIn, WachIn").replace(s, counter);

                s = new Replacement(String.raw`(e[nrtmdbplhfcNRTMDBPLHFC])In(?!(\w{1,2}\b)|[A-Z]|[cf]o|te[gr]|act|clu|dex|di|line|ner|put|sert|stall|stan|stru|val|vent|v?it|voice)`, "g", Const.y, "").replace(s, counter);

                s = new Replacement(String.raw`([nrtmdbplhfcNRTMDBPLHFC])In(?!(\w{1,2}\b)|[A-Z]|[cf]o|te[gr]|act|clu|dex|di|line|ner|put|sert|stall|stan|stru|val|vent|v?it|voice)`, "g", "\$1" + Const.y, "").replace(s, counter);
            }

        }

        s = this.artikelUndKontraktionen(s);

        return s;
    }

    private pluraly(s: string): string {
        if (s.trim().length == 0) {
            return s;
        }

        let outer = this;
        let counter = function () {
            outer.replacementsb++;
        };
        s = new Replacement(String.raw`(^[dD]+)(er|as)`, "", "\$1ie", "").replace(s, counter);
        s = new Replacement(String.raw`(ern|ers|er|en|e)$`, "", "", "").replace(s, counter);
        s = s + Const.ys;
        return s;
    }

    private singulary(s: string): string {
        if (s.trim().length == 0) {
            return s;
        }
        let outer = this;
        let counter = function () {
            outer.replacementsb++;
        };

        s = new Replacement(String.raw`(^[dD]+)(en|er|ie)`, "", "\$1as", "").replace(s, counter);
        if (/(en|ern|er)$/.test(s)) {
            s = new Replacement(String.raw`(en|ern|er)$`, "", Const.y, "").replace(s, counter);
        } else if (/(ens|erns|ers|es)$/.test(s)) { // Genitiv
            s = new Replacement(String.raw`(es)$`, "", Const.ys, "eines Arztes").replace(s, counter);
        } else {
            s = s + Const.y;
        }

        return s;
    }

    private startsWithCapitalLetter(s: string): boolean {
        return s != null && s.length > 0 && /[A-Z]/.test(s[0]);
    }

    private capitalize(s: string): string {
        if (s == null || s.length < 1) {
            return "";
        }
        return s.charAt(0).toUpperCase() + s.slice(1);
    }

    private entferneDoppelformen(s: string): string {
        this.log("20000");
        if (/\b(und|oder|bzw)|[a-zA-ZäöüßÄÖÜ][\/\*&_\(][a-zA-ZäöüßÄÖÜ]/.test(s)) {
            this.log("21000");
            // Hinweis: \b am Anfang ersetzt durch (?=\b|[ÄäÖöÜö]), weil \b die Umlaute nicht matcht, bspw. "Ärztinnen und Ärzte" _am Anfang eines Satzes_ würden nicht ersetzt (in der Mitte aber kein Problem)
            s = s.replace(/(?=\b|[ÄäÖöÜö])((von[\s]{1,2}|für[\s]{1,2}|mit[\s]{1,2})?((d|jed|ein|ihr|zum|sein)(e[rn]?|ie)[\s]{1,2})?([a-zäöüß]{4,20} )?)([a-zäöüß]{2,})innen( und | oder | & | bzw\.? |[\/\*_\(-])\2?((d|jed|ein|ihr|zum|sein)(e[rmns]?|ie)[\s]{1,2})?\6?(\7(e?n?))\b([\f]?)/ig, (match, p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, p13, p14) => {
                this.replacementsd++;
                // Hinweis: p14 ist das /f-Zeichen, das u.U. verwendet wird, die zu ersetzende Wortgruppe zu umschließen
                if (p1) {
                    this.log("21001");
                    return p1 + this.pluraly(p12) + (p14 ? this.pluraly(p14) : "");
                } else {
                    this.log("21002");
                    return this.pluraly(p12) + (p14 ? p14 : "");
                }
            }); //Bürgerinnen und Bürger
            s = s.replace(/\b([Vv]on |[Ff]ür |[Mm]it |[Aa]ls |[Dd]ie |[Dd]er |[Dd]as )?(((zu )?d|jed|ein|ihr|zur|sein)(e|er|ie) )?(([a-zäöüß]{4,20}[enr]) )?([A-ZÄÖÜ][a-zäöüß]{2,})(en?|in)( und | oder | & | bzw\.? |[\/\*_\(-])(\1|vom )?((((zu )?d|jed|ein|ihr|zum|sein)(e[nrms])? )?(\7[nrms]? )?(\8(e?(s|n|r)?)))\b/g, (match, p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, p13, p14, p15, p16, p17, p18) => {
                this.replacementsd++;
                if (p1) {
                    if (p6 && !p17) {
                        this.log("21003");
                        return p1 + p13 + p6 + p18;
                    } else {
                        this.log("21004");
                        if (/[Dd]e[sm]/.test(p13)) {
                            return p13 + this.singulary(p8);
                        }
                        if (this.startsWithCapitalLetter(p1) && /[Dd]ie |[Dd]er |[Dd]as /.test(p1)) {
                            return "Das " + this.singulary(p8);
                        } else {
                            return "das " + this.singulary(p8);
                        }
                        return p1 + this.singulary(p8);


                    }
                } else if (p13 & p6 && !p17) {
                    this.log("21005");
                    return p13 + p6 + this.pluraly(p18);
                } else {
                    this.log("21006");
                    if (this.startsWithCapitalLetter(p2)) {
                        return this.capitalize(this.singulary(p12));
                    }
                    return this.singulary(p8);
                }
            }); //die Bürgerin und der Bürger
            s = s.replace(/\b(von |für |mit |als )?(((zu )?d|jed|ein|ihr|sein)(e|er|ie) |zur )?(([a-zäöüß]{4,20}[enr]) )?([a-zäöüß]{4,20})?(ärztin|anwältin|bäue?rin|rätin|fränkin|schwäbin|schwägerin)( und | oder | & | bzw\.? |[\/\*_\(-])(\1|vom )?((((zu )?d|jed|ein|ihr|zum|sein)(e[nrms])? )?(\7[nrms]? )?(\8(e?(s|n|r)?))(arzt|anwalt|bauer|rat|frank|schwab|schwager)(e(n|s)?)?)\b/ig, (match, p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12) => {
                this.replacementsd++;
                if (p1) {
                    this.log("21007");
                    return p1 + p12;
                } else {
                    this.log("21008");
                    return this.singulary(p12);
                }
            }); //unregelmäßiger Singular: die Ärztin und der Arzt
            s = s.replace(/\b((von |für |mit |als )?(((zu )?d|jed|ein|ihr|zur|sein)(e|er|ie) )?((zur|[a-zäöüß]{4,20}[enr]) ))?([a-zäöüß]{4,20})?((bäue?r|jüd|fränk|schwäb)innen)( und | oder | & | bzw\.? |[\/\*_\(-])(\1|vom )?((((zu )?d|jed|ein|ihr|zum|sein)(e[nrms])? )?(\7[nrms]? )?(\8(e?(s|n|r)?))(bauer|jude|franke|schwabe)([ns])?)\b/ig, (match, p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, p13, p14) => {
                this.replacementsd++;
                if (p1) {
                    this.log("21009");
                    return this.singulary(p1 + p14);
                } else {
                    this.log("21010");
                    return this.pluraly(p14);
                }
            }); //unregelmäßiger Plural: Bäuerinnen und Bauern
            s = s.replace(/\b((von |für |mit |als )?((d|jed|ein|ihr|zum|sein)(e[rnms]?|ie) )?([A-Z][a-zäöüß]{3,20}[enr] )?([A-Z][a-zäöüß]{2,})(e?(n|s|r)?))( und | oder | & | bzw\.? |[\/\*_\(-])(\2|von der )?(((von |zu )?d|jed|ein|ihr|zur|sein)(e[rn]?|ie) )?\6?\7(in(nen)?|en?)\b/g, (match, p1) => {
                this.log("21011");
                this.replacementsd++;
                return this.pluraly(p1);
            }); //Bürger und Bürgerinnen, Bürger und Bürgerin
            s = s.replace(/\b((von |für |mit |als )?((d|jed|ein|ihr|sein)(e[rnms]?|ie) |zum )?([a-zäöüß]{4,20}[enr] )?([a-zäöüß]{4,20})?(arzt|anwalt|bauer|rat|frank|schwab|schwager)(e?(s)?))( und | oder | & | bzw\.? |[\/\*_\(-])(\2|von der )?(((von |zu )?d|jed|ein|ihr|sein)(e[rn]?|ie) |zur )?\6?\7(ärzt|anwält|bäue?rin|rät|fränk|schwäb|schwäger)(in(nen)?)\b/ig, (match, p1) => {
                this.log("21012");
                this.replacementsd++;
                return this.pluraly(p1);
            }); //unregelmäßiger Singular: der Arzt und die Ärztin
            s = s.replace(/\b((von |für |mit |als )?((d|jed|ein|ihr|zum|sein)(e[rnms]?|ie) )?([a-zäöüß]{4,20}[enr] )?([a-zäöüß]{4,20})?(bauer|jud|frank|schwab)(e?n)?)( und | oder | & | bzw\.? |[\/\*_\(-])(\2|von der )?(((von |zu )?d|jed|ein|ihr|zur|sein)(e[rn]?|ie) )?\6?\7(bäue?r|jüd|fränk|schwäb)(in(nen)?)\b/ig, (match, p1) => {
                this.log("21013");
                this.replacementsd++;
                return p1;
            });//unregelmäßiger Plural: Bauern und Bäuerinnen
            s = s.replace(/\b([A-Z][a-zäöüß]{2,})([a-zäöüß]{2,})innen( und | oder | & | bzw\.? )-(\2(e*n)*)\b/g, (match, p1, p2, p3, p4) => {
                this.log("21014");
                this.replacementsd++;
                return p1 + this.pluraly(p4);
            }); //Bürgervertreterinnen und -vertreter
        }
        return s;
    }

    private entfernePartizip(s: string): string {
        if (/(ier|arbeit|orsch|fahr|verdien|nehm|es)ende|(?<!^)(?<!\. )Interessierte/.test(s)) {
            let outer = this;
            let counter = function () {
                outer.replacementsp++;
            };

            s = new Replacement(String.raw`der Studierende\b`, "g", "das Student" + Const.y, "").replace(s, counter);
            s = s.replace(/(?<!^)(?<!\. )Studierende(r|n?)?/g, (match) => {
                this.replacementsp++;
                let suffix = "Student" + Const.y;
                if (match.endsWith("n") || match.endsWith("e")) {
                    suffix = suffix + "s"
                }
                return suffix;
            });
            s = s.replace(/(?<!^)(?<!\. )Teilnehmende(r|n?)?/g, (match) => {
                this.replacementsp++;
                let suffix = "Teilnehm" + Const.y;
                if (match.endsWith("n") || match.endsWith("e")) {
                    suffix = suffix + "s"
                }
                return suffix;
            });
            s = s.replace(/(?<!^)(?<!\. )Dozierende(r|n?)?/g, (match) => {
                this.replacementsp++;
                let suffix = "Dozent" + Const.y;
                if (match.endsWith("n") || match.endsWith("e")) {
                    suffix = suffix + "s"
                }
                return suffix;
            });
            s = s.replace(/(?<!^)(?<!\. )Lesende(r|n?)?/g, (match) => {
                this.replacementsp++;
                let suffix = "Les" + Const.y;
                if (match.endsWith("n") || match.endsWith("e")) {
                    suffix = suffix + "s"
                }
                return suffix;
            });
            s = s.replace(/(?<!^)(?<!\. )Assistierende(r|n?)?/g, (match) => {
                this.replacementsp++;
                let suffix = "Assistent" + Const.y;
                if (match.endsWith("n") || match.endsWith("e")) {
                    suffix = suffix + "s"
                }
                return suffix;
            });
            s = s.replace(/(?<!^)(?<!\. )Mitarbeitende(r|n?)?/g, (match) => {
                this.replacementsp++;
                let suffix = "Mitarbeit" + Const.y;
                if (match.endsWith("n") || match.endsWith("e")) {
                    suffix = suffix + "s"
                }
                return suffix;
            });
            s = s.replace(/(?<!^)(?<!\. )Forschende(r|n?)?/g, (match) => {
                this.replacementsp++;
                let suffix = "Forsch" + Const.y;
                if (match.endsWith("n") || match.endsWith("e")) {
                    suffix = suffix + "s"
                }
                return suffix;
            });
            s = s.replace(/(?<!^)(?<!\. )Interessierte(r|n?)?/g, (match) => {
                this.replacementsp++;
                let suffix = "Interessent" + Const.y;
                if (match.endsWith("n") || match.endsWith("e")) {
                    suffix = suffix + "s"
                }
                return suffix;
            });
            s = s.replace(/(?<!^)(?<!\. )([A-Z]+[a-zäöü]+)fahrende(r|n?)?/g, (match, p1) => {
                this.replacementsp++;
                let suffix = "fahr" + Const.y;
                if (match.endsWith("n") || match.endsWith("e")) {
                    suffix = suffix + "s"
                }
                return p1 + suffix;
            });
            s = s.replace(/(?<!^)(?<!\. )([A-Z]+[a-zäöü]+)verdienende(r|n?)?/g, (match, p1) => {
                this.replacementsp++;

                let suffix = "verdien" + Const.y
                if (match.endsWith("n") || match.endsWith("e")) {
                    suffix = suffix + "s"
                }
                return p1 + suffix;
            });
        }

        return s;
    }

    private ersetzeGefluechteteDurchFluechtlinge(s: string): string {
        if (/flüch/.test(s)) {
            let outer = this;
            let counter = function () {
            };


            s = new Replacement(String.raw`[\u00AD\u200B]`, "g", "", "entfernt soft hyphens").replace(s, counter);

            // "Geflüchtete" vor einem Substantiv ignorieren - das ist ein Adjektiv
            if (/\bGeflüchtet(e\b|er\b|en\b)[\s]{1,2}[A-Z]/g.test(s)) {
                return s;
            }

            s = new Replacement(String.raw`\b[Dd]er Geflüchtete\b`, "g", "Das Flüchtl" + Const.y, "").replace(s, counter);

            // Annahme: Gefluechtete wird fast ausschließlich in der Mehrzahl verwendet, was die Ersetzung einfacher macht
            // (?:[A-Z][a-zöüä]+\b[,] ) -> Behandlung von Aufzählungen der Form "gegenüber Obdachlosen, Geflüchteten und Menschen ohne Papiere"
            s = s.replace(/\b([Aa]us[\s]{1,2}|[Aa]ußer[\s]{1,2}|[Bb]ei[\s]{1,2}|[Zz]u[\s]{1,2}|[Ee]ntgegen[\s]{1,2}|[Ee]ntsprechend[\s]{1,2}|[Gg]emäß[\s]{1,2}|[Gg]etreu[\s]{1,2}|[Gg]egenüber[\s]{1,2}|[Nn]ahe[\s]{1,2}|[Mm]it[\s]{1,2}|[Nn]ach[\s]{1,2}|[Ss]amt[\s]{1,2}|[Mm]itsamt[\s]{1,2}|[Ss]eit[\s]{1,2}|[Vv]on[\s]{1,2})?(den[\s]{1,2})?(den[\s]{1,2}|vielen[\s]{1,2}|mehreren[\s]{1,2})?([A-Z][a-zöüä]+\b[,][\s]{1,2}|[A-Z][a-zöüä]+\b und[\s]{1,2})*([„“‟”’’❝❞❮❯⹂〝〞〟＂‚‘‛❛❜❟«‹»›]?Geflüchtet(e\b|en\b|er\b)[„“‟”’’❝❞❮❯⹂〝〞〟＂‚‘‛❛❜❟«‹»›]?)([\s]{1,2}zufolge)?\b/g, (match, praeposition, den, zahlwort, aufzaehlung, gefluechtete, endung, zufolge) => {
                this.replacementsp++;
                if (!praeposition) praeposition = "";
                if (!zahlwort) zahlwort = "";
                if (!aufzaehlung) aufzaehlung = "";
                if (!zufolge) zufolge = "";
                if (!den) den = "";

                if (praeposition || den) {
                    return praeposition + den + zahlwort + aufzaehlung + "Flüchtl" + Const.ys + zufolge;
                } else {
                    return praeposition + den + zahlwort + aufzaehlung + "Flüchtl" + Const.ys + zufolge;
                }
            });

            // "geflüchtete xxx" -> "geflohene xxx"
            s = s.replace(/\b(geflüchtet)(e(?:(r|n)?)?[\s]{1,2}(?:Kind|Mensch)[\w]+)\b/g, (match, gefluechtet, rest) => {
                return "geflohen" + rest;
            });

            // "Geflüchtetenxxx" -> "Flüchtlingsxxx"
            s = s.replace(/\b(Geflüchteten)([\w]{3,})\b/g, (match, gefluechteten, rest) => {
                return "Flüchtl" + Const.ys + rest;
            });
        }
        return s;
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
                node.data = newText;
            }
        }
    }

    public entferneInitial() {
        const probeResult = this.probeDocument()

        if (probeResult.probeBinnenI || this.settings.doppelformen && probeResult.probeRedundancy || this.settings.partizip && probeResult.probePartizip || probeResult.probeArtikelUndKontraktionen) {
            this.nodes = this.textNodesUnder(document)

            if (this.settings.doppelformen && probeResult.probeRedundancy) {
                this.applyToNodes(this.nodes, this.entferneDoppelformen);
            }
            if (this.settings.partizip && probeResult.probePartizip) {
                this.applyToNodes(this.nodes, this.entfernePartizip);
            }
            if (probeResult.probeBinnenI) {
                this.applyToNodes(this.nodes, this.entferneBinnenIs);
            }
            if (probeResult.probeGefluechtete) {
                this.applyToNodes(this.nodes, this.ersetzeGefluechteteDurchFluechtlinge);
            }

            if (probeResult.probeArtikelUndKontraktionen) {
                this.applyToNodes(this.nodes, this.artikelUndKontraktionen);
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
                s = this.entferneDoppelformen(s);
            }
            if (this.settings.partizip && probeResult.probePartizip) {
                s = this.entfernePartizip(s);
            }
            if (probeResult.probeBinnenI) {
                s = this.entferneBinnenIs(s);
            }
            if (probeResult.probeGefluechtete) {
                s = this.ersetzeGefluechteteDurchFluechtlinge(s);
            }

            if (probeResult.probeArtikelUndKontraktionen) {
                s = this.artikelUndKontraktionen(s);
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
                this.applyToNodes(nodes, this.entferneDoppelformen);
            }
            if (this.settings.partizip) {
                this.applyToNodes(nodes, this.entfernePartizip);
            }
            this.applyToNodes(nodes, this.entferneBinnenIs);
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
            countBinnenIreplacements: this.replacementsb,
            countDoppelformreplacements: this.replacementsd,
            countPartizipreplacements: this.replacementsp,
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