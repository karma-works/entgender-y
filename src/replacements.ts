
export class Replacement {
    regex: RegExp;
    replacement: string;
    description: string | undefined;

    constructor(regex: RegExp, replacement: string, description: string | undefined) {
        this.regex = regex;
        this.replacement = replacement;
        this.description = description;
    }

    public toString(): string {
        const ret = `Regex: ${this.regex} Replacement: ${this.replacement} Description: ${this.description}`;
        return ret;
    }
}

export default class Replacements {

    private static _rmap: Array<Replacement> = [
        new Replacement(/\b(z)(um[\/\*_\(-]zur|ur\[\/\*_\(-]zum)\b/ig, "\$1um", ""),
        new Replacement(/jede[rnms]?[\/\*_\(-](jede[rnms]?)\b/ig,  "\$1", "")
    ];

    static rmap(): Array<Replacement> {
        return this._rmap;
    }

    public replaceAll(inputString: string, incrementCounter: () => void): string {
        let outputString = inputString;
        for (const replacement of Replacements.rmap()) {
            if(replacement.regex.test(outputString)){
                outputString = outputString.replace(replacement.regex, replacement.replacement);
                incrementCounter();
            }
        }

        return outputString;
    }

    public getDebug(inputString: string): string {
        let out = '\n';
        for (const replacement of Replacements.rmap()) {
            if(replacement.regex.test(inputString)){
                out = out + replacement + "\n";
            }
        }

        return out + "\n";
    }
}