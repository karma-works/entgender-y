
export class Replacement {
    regex: string;
    modifier: string;
    replacement: string;
    description: string | undefined;

    constructor(regex: string, modifier: string, replacement: string, description: string | undefined) {
        this.regex = regex;
        this.modifier = modifier;
        this.replacement = replacement;
        this.description = description;
    }

    public toString(): string {
        const ret = `Regex: ${this.regex} Replacement: ${this.replacement} Description: ${this.description}`;
        return ret;
    }

    public regexp(): RegExp {
        return new RegExp(this.regex, this.modifier);
    }
}

export default class Replacements {
    private gstar: string  = String.raw`[\\/\\*_\\(-]`;

    private _rmap: Array<Replacement> = [
        new Replacement(String.raw`\b(d)(ie[\/\*_\(-]+der|er[\/\*_\(-]+die)\b`, "ig", "\$1as", ""),
        new Replacement(String.raw`\b(d)(en[\/\*_\(-]+die|ie[\/\*_\(-]+den)\b`, "ig", "\$1as", ""),
        new Replacement(String.raw`\b(d)(es[\/\*_\(-]+der|er[\/\*_\(-]+des)\b`, "ig", "\$1es", ""),
        new Replacement(String.raw`\b(d)(er[\/\*_\(-]+dem|em[\/\*_\(-]+der)\b`, "ig", "\$1em", ""),
        new Replacement(String.raw`b(d)(eren[\/\*_\(-]dessen|essen[\/\*_\(-]deren)\b`, "ig", "\$1essen", ""),
        new Replacement(String.raw`\bdiese[r]?[\/\*_\(-](diese[rnms])`, "ig", "\$1", "1"),
        new Replacement(String.raw`(diese[rnms])[\/\*_\(-]diese[r]?\b`, "ig", "\$1", "2"),
        new Replacement(String.raw`\b([KkDMSdms]?[Ee])in([\/\*_\(-]+e |\(e\) |E )`, "g", "\$1in ", ""),
        new Replacement(String.raw`\b([KkDMSdms]?[Ee])ine([\/\*_\(-]+r |\(r\) |R )`, "g", "\$1iner ", ""),
        new Replacement(String.raw`\b([KkDMSdms]?[Ee])iner([\/\*_\(-]+s |\(S\) |S )`, "g", "\$1ines ", ""),
        new Replacement(String.raw`\b([KkDMSdms]?[Ee])ines([\/\*_\(-]+r |\(R\) |R )`, "g", "\$1ines ", ""),
        new Replacement(String.raw`\b([KkDMSdms]?[Ee])iner([\/\*_\(-]+m |\(m\) |M )`, "g", "\$1inem ", ""),
        new Replacement(String.raw`\b([KkDMSdms]?[Ee])inem([\/\*_\(-]+r |\(r\) |R )`, "g", "\$1inem ", ""),
        new Replacement(String.raw`\b([KkDMSdms]?[Ee])ine(m|r)[\/\*_\(-]([KkDMSdms]?[Ee])ine(m |r )`, "g", "\$1inem ", "einer_einem, keiner_keinem"),
        new Replacement(String.raw`\b([KkDMSdms]?[Ee])ine([\/\*_\(-]+n |\(n\) |N )`, "g", "\$1in ", ""),
        new Replacement(String.raw`\bsie[\/\*_\(-]er|er[\/\*_\(-]sie\b`, "g", "er", ""),
        new Replacement(String.raw`\bSie[\/\*_\(-][Ee]r|Er[\/\*_\(-][Ss]ie\b`, "g", "Es", ""),
        new Replacement(String.raw`\b(i)(hr[\/\*_\(-]ihm|hm[\/\*_\(-]ihr)\b`, "ig", "\$1hm", ""),
        new Replacement(String.raw`\bsie[\/\*_\(-]ihn|ihn[\/\*_\(-]ie\b`, "g", "ihn", ""),
        new Replacement(String.raw`\bSie[\/\*_\(-][Ii]hn|Ihn[\/\*_\(-][Ss]ie\b`, "g", "Ihn", ""),
        new Replacement(String.raw`\bihr[\/\*_\(-]e\b`, "ig", "ihr", "ihr*e Partner*in"),
        new Replacement(String.raw`\bihre?[rnms]?[\/\*_\(-](seine?[rnms]?)`, "ig", "\$1", "ihr*e Partner*in"),
        new Replacement(String.raw`(seine?[rnms]?)[\/\*_\(-]ihre?[rnms]?\b`, "ig", "\$1", "ihr*e Partner*in"),
        new Replacement(String.raw`\b(z)(um[\/\*_\(-]zur|ur\[\/\*_\(-]zum)\b`, "ig", "\$1um", ""),
        new Replacement(String.raw`jede[rnms]?[\/\*_\(-](jede[rnms]?)\b`, "ig",  "\$1", "")
    ];

    rmap(): Array<Replacement> {
        return this._rmap;
    }

    public replaceAll(inputString: string, incrementCounter: () => void): string {
        let outputString = inputString;
        for (const replacement of this.rmap()) {
            let regex = RegExp(replacement.regex, replacement.modifier);
            if(regex.test(outputString)){
                outputString = outputString.replace(regex, replacement.replacement);
                incrementCounter();
            }
        }

        return outputString;
    }

    public getDebug(inputString: string): string {
        let out = '\n';
        for (const replacement of this.rmap()) {
            let regex = RegExp(replacement.regex, replacement.modifier);
            if(regex.test(inputString)){
                out = out + replacement + "\n";
            }
        }

        return out + "\n";
    }
}

export class Preconditions {
    rxArtikel1: Replacement = new Replacement(String.raw`[a-zA-ZäöüßÄÖÜ][\\/\\*.&_\\(]-?[a-zA-ZäöüßÄÖÜ]`, "", "", "");
    rxArtikel2: Replacement = new Replacement(String.raw`der|die|dessen|ein|sie|ihr|sein|zu[rm]|jede|frau|man|eR\\b|em?[\\/\\*.&_\\(]-?e?r\\b|em?\\(e?r\\)\\b`, "", "", "");
    rxArtikelStuff: Replacement = new Replacement(String.raw`der|die|dessen|ein|sie|ih[rmn]|zu[rm]|jede`, "i", "", "");

    inputString: string;

    artikel: boolean =  false;
    artikelStuff: boolean = false;


    constructor(inputString: string){
        this.inputString = inputString;
        this.artikel = this.rxArtikel1.regexp().test(inputString) || this.rxArtikel2.regexp().test(inputString);
        this.artikelStuff = this.artikel || this.rxArtikelStuff.regexp().test(inputString);
    }
}