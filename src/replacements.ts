
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
        // new Replacement(String.raw``, "", "", ""),
        // new Replacement(String.raw``, "", "", ""),
        // new Replacement(String.raw``, "", "", ""),
        // new Replacement(String.raw``, "", "", ""),
        // new Replacement(String.raw``, "", "", ""),
        // new Replacement(String.raw``, "", "", ""),
        // new Replacement(String.raw``, "", "", ""),
        // new Replacement(String.raw``, "", "", ""),
        // new Replacement(String.raw``, "", "", ""),
        // new Replacement(String.raw``, "", "", ""),
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