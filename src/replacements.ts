
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
    private gstar: string  = String.raw`[\/\*_\(-]`;

    private _rmap: Array<Replacement> = [
        new Replacement(String.raw`\b(d)(ie${this.gstar}+der|er${this.gstar}+die)\b`, "ig", "\$1as", ""),
        new Replacement(String.raw`\b(d)(en${this.gstar}+die|ie${this.gstar}+den)\b`, "ig", "\$1as", ""),
        new Replacement(String.raw`\b(d)(es${this.gstar}+der|er${this.gstar}+des)\b`, "ig", "\$1es", ""),
        new Replacement(String.raw`\b(d)(er${this.gstar}+dem|em${this.gstar}+der)\b`, "ig", "\$1em", ""),
        new Replacement(String.raw`b(d)(eren${this.gstar}dessen|essen${this.gstar}deren)\b`, "ig", "\$1essen", ""),
        new Replacement(String.raw`\bdiese[r]?${this.gstar}(diese[rnms])`, "ig", "\$1", "1"),
        new Replacement(String.raw`(diese[rnms])${this.gstar}diese[r]?\b`, "ig", "\$1", "2"),
        new Replacement(String.raw`\b([KkDMSdms]?[Ee])in(${this.gstar}+e |\(e\) |E )`, "g", "\$1in ", ""),
        new Replacement(String.raw`\b([KkDMSdms]?[Ee])ine(${this.gstar}+r |\(r\) |R )`, "g", "\$1iner ", ""),
        new Replacement(String.raw`\b([KkDMSdms]?[Ee])iner(${this.gstar}+s |\(S\) |S )`, "g", "\$1ines ", ""),
        new Replacement(String.raw`\b([KkDMSdms]?[Ee])ines(${this.gstar}+r |\(R\) |R )`, "g", "\$1ines ", ""),
        new Replacement(String.raw`\b([KkDMSdms]?[Ee])iner(${this.gstar}+m |\(m\) |M )`, "g", "\$1inem ", ""),
        new Replacement(String.raw`\b([KkDMSdms]?[Ee])inem(${this.gstar}+r |\(r\) |R )`, "g", "\$1inem ", ""),
        new Replacement(String.raw`\b([KkDMSdms]?[Ee])ine(m|r)${this.gstar}([KkDMSdms]?[Ee])ine(m |r )`, "g", "\$1inem ", "einer_einem, keiner_keinem"),
        new Replacement(String.raw`\b([KkDMSdms]?[Ee])ine(${this.gstar}+n |\(n\) |N )`, "g", "\$1in ", ""),
        new Replacement(String.raw`\bsie${this.gstar}er|er${this.gstar}sie\b`, "g", "er", ""),
        new Replacement(String.raw`\bSie${this.gstar}[Ee]r|Er${this.gstar}[Ss]ie\b`, "g", "Es", ""),
        new Replacement(String.raw`\b(i)(hr${this.gstar}ihm|hm${this.gstar}ihr)\b`, "ig", "\$1hm", ""),
        new Replacement(String.raw`\bsie${this.gstar}ihn|ihn${this.gstar}ie\b`, "g", "ihn", ""),
        new Replacement(String.raw`\bSie${this.gstar}[Ii]hn|Ihn${this.gstar}[Ss]ie\b`, "g", "Ihn", ""),
        new Replacement(String.raw`\bihr${this.gstar}e\b`, "ig", "ihr", "ihr*e Partner*in"),
        new Replacement(String.raw`\bihre?[rnms]?${this.gstar}(seine?[rnms]?)`, "ig", "\$1", "ihr*e Partner*in"),
        new Replacement(String.raw`(seine?[rnms]?)${this.gstar}ihre?[rnms]?\b`, "ig", "\$1", "ihr*e Partner*in"),
        new Replacement(String.raw`\b(z)(um${this.gstar}zur|ur\${this.gstar}zum)\b`, "ig", "\$1um", ""),
        new Replacement(String.raw`jede[rnms]?${this.gstar}(jede[rnms]?)\b`, "ig",  "\$1", "")
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