
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
}

export default class Replacements {

    private _rmap: Array<Replacement> = [
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