import {Replacement} from "../replacement";
import {stackToBeGone} from "../logUtil";
import {SchreibAlternative} from "./alternative";

class Const {
    static readonly gstar = String.raw`[\:\/\*\_\(-]{1,2}`;
    static readonly y = 'y';
    static readonly ys = 'ys';
}

function startsWithCapitalLetter(s: string): boolean {
    return s != null && s.length > 0 && /[A-Z]/.test(s[0]);
}

function capitalize(s: string): string {
    if (s == null || s.length < 1) {
        return "";
    }
    return s.charAt(0).toUpperCase() + s.slice(1);
}

export class Phettberg implements SchreibAlternative {

    replacementsBinnen = 0;
    replacementsDoppel = 0;
    replacementsPartizip = 0;

    private log(s: string) {
        return; ///////////////////////////////////
        let sumChange = this.replacementsBinnen + this.replacementsDoppel + this.replacementsPartizip;
        console.log("P", s, sumChange, "\n" + stackToBeGone(1).join("\n"));
    }

    artikelUndKontraktionen = (s: string): string => {
        const outer = this;
        let counter = function () {
            outer.replacementsBinnen++;
        };


        if (/[a-zA-ZäöüßÄÖÜ][\/*.&_(]-?[a-zA-ZäöüßÄÖÜ]/.test(s) || /der|die|dessen|ein|sie|ihr|sein|zu[rm]|jede|frau|man|eR\b|em?[\/*.&_(]-?e?r\b|em?\(e?r\)\b/.test(s)) {
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

            //man
            if (/\/(frau|man|mensch)/.test(s)) {
                let repl3 = new Replacement(String.raw`\b(frau|man+|mensch)+[\/\*_\(-](frau|man+|mensch|[\/\*_\(-])*`, "", "man", "");
                s = repl3.replace(s, counter);
            }
        }

        //extra Stuff
        if (new Replacement(String.raw`eR\b|(?<![kK]art)(?<![Ss]tund)(?<![kK]onnt)em?${Const.gstar}e?[rn]\b|em?\(e?r\)\b/`, "g", "", "").test(s)) {
            s = new Replacement(String.raw`(?<beginning>m\b.{3,30})(?<star>[\/\*_\(-]{1,2})(?<suffix>[rn])\b`, "ig", "\$1\$3", "Dativ: einem progressive*n Staatsoberhaupt").replace(s, counter);
            s = new Replacement(String.raw`(\b[a-zäöü]+e)([\/\*_\(-]+)(n|e\(n\)|eN\b)`, "g", "\$1s", "jede*n, europäische*n").replace(s, counter);
            s = new Replacement(String.raw`([\b“ ][A-ZÄÖÜ]\w+)(e${Const.gstar})(n|e\(n|eN\))([\b“]+)`, "g", "\$1" + Const.y + "\$4", "Wehrbeauftragte*n“").replace(s, counter);
            s = new Replacement(String.raw`(\b[\w]{1,6}e)${Const.gstar}r|e\(r\)|eR\b`, "g", "\$1s", "jede/r,jede(r),jedeR").replace(s, counter);
            s = new Replacement(String.raw`(\b[a-zäöü]+e)${Const.gstar}r|e\(r\)|eR\b`, "g", "\$1s", "stellvertretende*r").replace(s, counter);
            s = new Replacement(String.raw`(\. [\w]+e)${Const.gstar}r|e\(r\)|eR\b(?=[A-ZÄÖÜ])`, "g", "\$1s", "Stellvertretende*r Datenschutzbeauf....").replace(s, counter);
            s = new Replacement(String.raw`([Aa]bsolute)${Const.gstar}r`, "g", "$1s", "Absolute*r").replace(s, counter);
            s = new Replacement(String.raw`(\b[\w]+)e${Const.gstar}r|e\(r\)|eR\b`, "g", "\$1y", "Datenschutzbeauftragte*r").replace(s, counter);
            s = new Replacement(String.raw`em\(e?r\)|em[\/\*_\(-]+r\b`, "g", "em", "jedem/r").replace(s, counter);
            // TODO: jedes/r wird nicht hier geändert. Wozu ist das?
            s = new Replacement(String.raw`er\(e?s\)|es[\/\*_\(-]+r\b`, "g", "es", "jedes/r").replace(s, counter);
        }


        return s;
    }

    private entferneUnregelmaessigeFormen(s: string): string {
        let outer = this;
        let counter = function () {
            outer.replacementsBinnen++;
        };

        // Sinti*ze und Rom*nja
        s = new Replacement(String.raw`\bSinti(\/-?|_|\*|:|\.|\x00b7)ze\b`, "g",
            "Sint" + Const.ys, "Sinti*ze und Rom*nja").replace(s, counter);
        s = new Replacement(String.raw`\bRom(\/-?|_|\*|:|\.|\x00b7)nja\b`, "g", "Rom" + Const.ys, "Sinti*ze und Rom*nja").replace(s, counter);

        s = new Replacement(String.raw`\bMuslim(\/-?|_|\*|:|\.|\xb7)a\b`, "g", "Muslim" + Const.y , "").replace(s, counter);

        return s;
    }


    entferneBinnenIs = (s: string): string => {
        this.log("10000");
        let outer = this;
        let counter = function () {
            outer.replacementsBinnen++;
        };

        // entferne *x am Ende
        if (/\*x/.test(s)) {
            // behandle "einer/m*x progressive*n*x"
            s = new Replacement(String.raw`([\w\/*]+)\*x\b\b`, "ig", "\$1", "").replace(s, counter);
        }

        // unregelmässige Pluralformen
        s = this.entferneUnregelmaessigeFormen(s);

        if (/[a-zäöüß\u00AD\u200B]{2}((\/-?|_|\*|:|\.|\u00b7| und -)?In|(\/-?|_|\*|:|\.|\u00b7| und -)in(n[*|.]en)?|INNen|\([Ii]n+(en\)|\)en)?|\/inne?)(?!(\w{1,2}\b)|[A-Z]|[cf]o|te[gr]|act|clu|dex|di|line|ner|put|sert|stall|stan|stru|val|vent|v?it|voice)|[A-ZÄÖÜß\u00AD\u200B]{3}(\/-?|_|\*|:|\.)IN\b/.test(s)) {
            this.log("12000");
            s = new Replacement(String.raw`[\u00AD\u200B]`, "g", "", "entfernt soft hyphens").replace(s, counter);

            //Prüfung auf Ersetzung
            if (/[a-zäöüß](\/-?|_|\*|:|\.|\u00b7| und -)in\b/i.test(s) || /[a-zäöüß](\/-?|_|\*|:|\.|\u00b7| und -)inn([*.)])?en/i.test(s) || /[a-zäöüß]([(\/])in/i.test(s) || /[a-zäöüß]INNen/.test(s)) {
                this.log("12100");
                s = new Replacement(String.raw`(\/-?|_|\*|:|\u00b7|\.)inn(\*|\.|\/)?e(\*|\.|\/)?n`, "ig", "Innen", "Schüler/innen").replace(s, counter);
                s = new Replacement(String.raw`([a-zäöüß])\(inn(en\)|\)en)`, "ig", "\$1Innen", "Schüler(innen)").replace(s, counter);
                s = new Replacement(String.raw`([a-zäöüß])INNen`, "g", "\$1Innen", "SchülerINNen").replace(s, counter);
                s = new Replacement(String.raw` und -innen\b`, "ig", "", "und -innen").replace(s, counter);
                s = new Replacement(String.raw`([a-zäöüß])\(in\)`, "ig", "$1In", "Schüler(in)").replace(s, counter);
                s = new Replacement(String.raw`(?<!https:\/\/lnkd)(er)?(${Const.gstar})in\b`, "ig", Const.y, "Schüler/in").replace(s, counter);
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
                    s = new Replacement(String.raw`äsInnen`, "g", "as" + Const.ys, "?? Gibt es das??").replace(s, counter);
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
            outer.replacementsBinnen++;
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
            outer.replacementsBinnen++;
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

    entferneDoppelformen = (s: string) => {
        this.log("20000");
        if (/\b(und|oder|bzw)|[a-zA-ZäöüßÄÖÜ][\/*&_(][a-zA-ZäöüßÄÖÜ]/.test(s)) {
            this.log("21000");
            // Hinweis: \b am Anfang ersetzt durch (?=\b|[ÄäÖöÜö]), weil \b die Umlaute nicht matcht, bspw. "Ärztinnen und Ärzte" _am Anfang eines Satzes_ würden nicht ersetzt (in der Mitte aber kein Problem)
            s = s.replace(/(?=\b|[ÄäÖöÜ])((von[\s]{1,2}|für[\s]{1,2}|mit[\s]{1,2})?((d|jed|ein|ihr|zum|sein)(e[rn]?|ie)[\s]{1,2})?([a-zäöüß]{4,20} )?)([a-zäöüß]{2,})innen( und | oder | & | bzw\.? |[\/*_(-])\2?((d|jed|ein|ihr|zum|sein)(e[rmns]?|ie)[\s]{1,2})?\6?(\7(e?n?))\b([\f]?)/ig, (match, p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, p13, p14) => {
                this.replacementsDoppel++;
                // Hinweis: p14 ist das /f-Zeichen, das u.U. verwendet wird, die zu ersetzende Wortgruppe zu umschließen
                if (p1) {
                    this.log("21001");
                    return p1 + this.pluraly(p12) + (p14 ? this.pluraly(p14) : "");
                } else {
                    this.log("21002");
                    return this.pluraly(p12) + (p14 ? p14 : "");
                }
            }); //Bürgerinnen und Bürger
            s = s.replace(/\b([Vv]on |[Ff]ür |[Mm]it |[Aa]ls |[Dd]ie |[Dd]er |[Dd]as )?(((zu )?d|jed|ein|ihr|zur|sein)(e|er|ie) )?(([a-zäöüß]{4,20}[enr]) )?([A-ZÄÖÜ][a-zäöüß]{2,})(en?|in)( und | oder | & | bzw\.? |[\/*_(-])(\1|vom )?((((zu )?d|jed|ein|ihr|zum|sein)(e[nrms])? )?(\7[nrms]? )?(\8(e?([snr])?)))\b/g, (match, p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, p13, p14, p15, p16, p17, p18) => {
                this.replacementsDoppel++;
                if (p1) {
                    if (p6 && !p17) {
                        this.log("21003");
                        return p1 + p13 + p6 + p18;
                    } else {
                        this.log("21004");
                        if (/[Dd]e[sm]/.test(p13)) {
                            return p13 + this.singulary(p8);
                        }
                        if (startsWithCapitalLetter(p1) && /[Dd]ie |[Dd]er |[Dd]as /.test(p1)) {
                            return "Das " + this.singulary(p8);
                        } else {
                            return "das " + this.singulary(p8);
                        }

                        // TODO: what was this meant for? Unreachable code
                        // return p1 + this.singulary(p8);
                    }
                } else if (p13 & p6 && !p17) {
                    this.log("21005");
                    return p13 + p6 + this.pluraly(p18);
                } else {
                    this.log("21006");
                    if (startsWithCapitalLetter(p2)) {
                        return capitalize(this.singulary(p12));
                    }
                    return this.singulary(p8);
                }
            }); //die Bürgerin und der Bürger
            s = s.replace(/\b(von |für |mit |als )?(((zu )?d|jed|ein|ihr|sein)(e|er|ie) |zur )?(([a-zäöüß]{4,20}[enr]) )?([a-zäöüß]{4,20})?(ärztin|anwältin|bäue?rin|rätin|fränkin|schwäbin|schwägerin)( und | oder | & | bzw\.? |[\/*_(-])(\1|vom )?((((zu )?d|jed|ein|ihr|zum|sein)(e[nrms])? )?(\7[nrms]? )?(\8(e?([snr])?))(arzt|anwalt|bauer|rat|frank|schwab|schwager)(e([ns])?)?)\b/ig, (match, p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12) => {
                this.replacementsDoppel++;
                if (p1) {
                    this.log("21007");
                    return p1 + p12;
                } else {
                    this.log("21008");
                    return this.singulary(p12);
                }
            }); //unregelmäßiger Singular: die Ärztin und der Arzt
            s = s.replace(/\b((von |für |mit |als )?(((zu )?d|jed|ein|ihr|zur|sein)(e|er|ie) )?((zur|[a-zäöüß]{4,20}[enr]) ))?([a-zäöüß]{4,20})?((bäue?r|jüd|fränk|schwäb)innen)( und | oder | & | bzw\.? |[\/*_(-])(\1|vom )?((((zu )?d|jed|ein|ihr|zum|sein)(e[nrms])? )?(\7[nrms]? )?(\8(e?([snr])?))(bauer|jude|franke|schwabe)([ns])?)\b/ig, (match, p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, p13, p14) => {
                this.replacementsDoppel++;
                if (p1) {
                    this.log("21009");
                    return this.singulary(p1 + p14);
                } else {
                    this.log("21010");
                    return this.pluraly(p14);
                }
            }); //unregelmäßiger Plural: Bäuerinnen und Bauern
            s = s.replace(/\b((von |für |mit |als )?((d|jed|ein|ihr|zum|sein)(e[rnms]?|ie) )?([A-Z][a-zäöüß]{3,20}[enr] )?([A-Z][a-zäöüß]{2,})(e?([nsr])?))( und | oder | & | bzw\.? |[\/*_(-])(\2|von der )?(((von |zu )?d|jed|ein|ihr|zur|sein)(e[rn]?|ie) )?\6?\7(in(nen)?|en?)\b/g, (match, p1) => {
                this.log("21011");
                this.replacementsDoppel++;
                return this.pluraly(p1);
            }); //Bürger und Bürgerinnen, Bürger und Bürgerin
            s = s.replace(/\b((von |für |mit |als )?((d|jed|ein|ihr|sein)(e[rnms]?|ie) |zum )?([a-zäöüß]{4,20}[enr] )?([a-zäöüß]{4,20})?(arzt|anwalt|bauer|rat|frank|schwab|schwager)(e?(s)?))( und | oder | & | bzw\.? |[\/*_(-])(\2|von der )?(((von |zu )?d|jed|ein|ihr|sein)(e[rn]?|ie) |zur )?\6?\7(ärzt|anwält|bäue?rin|rät|fränk|schwäb|schwäger)(in(nen)?)\b/ig, (match, p1) => {
                this.log("21012");
                this.replacementsDoppel++;
                return this.pluraly(p1);
            }); //unregelmäßiger Singular: der Arzt und die Ärztin
            s = s.replace(/\b((von |für |mit |als )?((d|jed|ein|ihr|zum|sein)(e[rnms]?|ie) )?([a-zäöüß]{4,20}[enr] )?([a-zäöüß]{4,20})?(bauer|jud|frank|schwab)(e?n)?)( und | oder | & | bzw\.? |[\/*_(-])(\2|von der )?(((von |zu )?d|jed|ein|ihr|zur|sein)(e[rn]?|ie) )?\6?\7(bäue?r|jüd|fränk|schwäb)(in(nen)?)\b/ig, (match, p1) => {
                this.log("21013");
                this.replacementsDoppel++;
                return p1;
            });//unregelmäßiger Plural: Bauern und Bäuerinnen
            s = s.replace(/\b([A-Z][a-zäöüß]{2,})([a-zäöüß]{2,})innen( und | oder | & | bzw\.? )-(\2(e*n)*)\b/g, (match, p1, p2, p3, p4) => {
                this.log("21014");
                this.replacementsDoppel++;
                return p1 + this.pluraly(p4);
            }); //Bürgervertreterinnen und -vertreter
        }
        return s;
    }

    entfernePartizip = (s: string) => {
        if (/(ier|arbeit|orsch|fahr|verdien|nehm|es)ende|(?<!^)(?<!\. )Interessierte/.test(s)) {
            let outer = this;
            let counter = function () {
                outer.replacementsPartizip++;
            };

            s = new Replacement(String.raw`der Studierende\b`, "g", "das Student" + Const.y, "").replace(s, counter);
            s = s.replace(/(?<!^)(?<!\. )Studierende(r|n?)?/g, (match) => {
                this.replacementsPartizip++;
                let suffix = "Student" + Const.y;
                if (match.endsWith("n") || match.endsWith("e")) {
                    suffix = suffix + "s"
                }
                return suffix;
            });
            s = s.replace(/(?<!^)(?<!\. )Teilnehmende(r|n?)?/g, (match) => {
                this.replacementsPartizip++;
                let suffix = "Teilnehm" + Const.y;
                if (match.endsWith("n") || match.endsWith("e")) {
                    suffix = suffix + "s"
                }
                return suffix;
            });
            s = s.replace(/(?<!^)(?<!\. )Dozierende(r|n?)?/g, (match) => {
                this.replacementsPartizip++;
                let suffix = "Dozent" + Const.y;
                if (match.endsWith("n") || match.endsWith("e")) {
                    suffix = suffix + "s"
                }
                return suffix;
            });
            s = s.replace(/(?<!^)(?<!\. )Lesende(r|n?)?/g, (match) => {
                this.replacementsPartizip++;
                let suffix = "Les" + Const.y;
                if (match.endsWith("n") || match.endsWith("e")) {
                    suffix = suffix + "s"
                }
                return suffix;
            });
            s = s.replace(/(?<!^)(?<!\. )Assistierende(r|n?)?/g, (match) => {
                this.replacementsPartizip++;
                let suffix = "Assistent" + Const.y;
                if (match.endsWith("n") || match.endsWith("e")) {
                    suffix = suffix + "s"
                }
                return suffix;
            });
            s = s.replace(/(?<!^)(?<!\. )Mitarbeitende(r|n?)?/g, (match) => {
                this.replacementsPartizip++;
                let suffix = "Mitarbeit" + Const.y;
                if (match.endsWith("n") || match.endsWith("e")) {
                    suffix = suffix + "s"
                }
                return suffix;
            });
            s = s.replace(/(?<!^)(?<!\. )Forschende(r|n?)?/g, (match) => {
                this.replacementsPartizip++;
                let suffix = "Forsch" + Const.y;
                if (match.endsWith("n") || match.endsWith("e")) {
                    suffix = suffix + "s"
                }
                return suffix;
            });
            s = s.replace(/(?<!^)(?<!\. )Interessierte(r|n?)?/g, (match) => {
                this.replacementsPartizip++;
                let suffix = "Interessent" + Const.y;
                if (match.endsWith("n") || match.endsWith("e")) {
                    suffix = suffix + "s"
                }
                return suffix;
            });
            s = s.replace(/(?<!^)(?<!\. )([A-Z]+[a-zäöü]+)fahrende(r|n?)?/g, (match, p1) => {
                this.replacementsPartizip++;
                let suffix = "fahr" + Const.y;
                if (match.endsWith("n") || match.endsWith("e")) {
                    suffix = suffix + "s"
                }
                return p1 + suffix;
            });
            s = s.replace(/(?<!^)(?<!\. )([A-Z]+[a-zäöü]+)verdienende(r|n?)?/g, (match, p1) => {
                this.replacementsPartizip++;

                let suffix = "verdien" + Const.y
                if (match.endsWith("n") || match.endsWith("e")) {
                    suffix = suffix + "s"
                }
                return p1 + suffix;
            });
        }

        return s;
    }

    ersetzeGefluechteteDurchFluechtlinge = (s: string) => {
        if (/flüch/.test(s)) {
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
            s = s.replace(/\b([Aa]us[\s]{1,2}|[Aa]ußer[\s]{1,2}|[Bb]ei[\s]{1,2}|[Zz]u[\s]{1,2}|[Ee]ntgegen[\s]{1,2}|[Ee]ntsprechend[\s]{1,2}|[Gg]emäß[\s]{1,2}|[Gg]etreu[\s]{1,2}|[Gg]egenüber[\s]{1,2}|[Nn]ahe[\s]{1,2}|[Mm]it[\s]{1,2}|[Nn]ach[\s]{1,2}|[Ss]amt[\s]{1,2}|[Mm]itsamt[\s]{1,2}|[Ss]eit[\s]{1,2}|[Vv]on[\s]{1,2})?(den[\s]{1,2})?(den[\s]{1,2}|vielen[\s]{1,2}|mehreren[\s]{1,2})?([A-Z][a-zöüä]+\b[,][\s]{1,2}|[A-Z][a-zöüä]+\b und[\s]{1,2})*([„“‟”’❝❞❮❯⹂〝〞〟＂‚‘‛❛❜❟«‹»›]?Geflüchtet(e\b|en\b|er\b)[„“‟”’❝❞❮❯⹂〝〞〟＂‚‘‛❛❜❟«‹»›]?)([\s]{1,2}zufolge)?\b/g, (match, praeposition, den, zahlwort, aufzaehlung, gefluechtete, endung, zufolge) => {
                this.replacementsPartizip++;
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
            s = s.replace(/\b(geflüchtet)(e(?:([rn])?)?[\s]{1,2}(?:Kind|Mensch)[\w]+)\b/g, (match, gefluechtet, rest) => {
                return "geflohen" + rest;
            });

            // "Geflüchtetenxxx" -> "Flüchtlingsxxx"
            s = s.replace(/\b(Geflüchteten)([\w]{3,})\b/g, (match, gefluechteten, rest) => {
                return "Flüchtl" + Const.ys + rest;
            });
        }
        return s;
    }

    ersetzeMaskulinum = (s: string) => {
        return s;
    }
}