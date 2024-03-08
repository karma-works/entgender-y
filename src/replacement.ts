import {isNodeJs} from "./logUtil";

const code_coverage_usedReplacements = new Map<string, [boolean, Replacement]>();

/**
 * RegExp mit extras:
 *   {STERN}     => alles was als stern gilt (keine klammern)
 *   {KLO}       => Klammer auf (open)
 *   {KLC}       => Klammer zu (close)
 *   {BINI}      => BinnenI (aktuell [ïÏI])
 *   {II}        => Irgend ein I (aktuell [iïÏI])
 *   {STERN-KLO} => Klammer auf oder stern
 *   {ALT}       => alternativ: /und|oder|&|bzw\.?/ ; bei doppelnennungen
 *
 * Kann leichter erweitert werden.
 * Vielleicht schlechtere performanz. TODO eventuell caching?
 *
 * TODO: "&" oder "."
 */
let BinnenIMap: { [k: string]: string } = {
    // auch mittelpunkt (· \u00b7)
    "{STERN}": String.raw`[\:\/\*\_-·’']{1,2}`,
    "{KLO}": String.raw`[(\[{]`,
    "{KLC}": String.raw`[)\]}]`,
    "{BINI}": String.raw`[ïÏI]`,
    "{II}": String.raw`[iïÏI]`,
    "{STERN-KLO}": '{STERN-KLO}', // später generiert
    "{ALT}": String.raw`(?:und|oder|&|bzw\.?|[\/\*_\-:])`,
    // syllable hyphen (soft hyphen)
    "{SHY}": `\u00AD`,
    "{NOURL}": String.raw`(?<!https?://[-a-zA-Z0-9@:%._\\+~#=()&?]{0,256})`, // negative lookbehind checking we are not in an url
};
let BinnenI_Repl: RegExp = RegExp(`(${Object.keys(BinnenIMap).join("|")})`, 'g');
export function BinnenRegEx(regex: string, modifier?: string): RegExp {
    // regex = "Schüler{STERN-KLO}{II}n{KLC}?"
    regex = regex.replace(BinnenI_Repl, (m) => {
        // @ts-ignore
        return BinnenIMap[m];
    });
    return RegExp(regex, modifier);
}
BinnenRegEx.addMapping = (key: string, replacement: string) => {
    BinnenIMap[key] = replacement;
    BinnenI_Repl = RegExp(`(${Object.keys(BinnenIMap).join("|")})`, 'g');
}
BinnenRegEx.addMapping("{STERN-KLO}", `(?:${BinnenIMap['{STERN}']}|${BinnenIMap['{KLO}']})`);

export class Replacement {
    readonly regex: string;
    readonly modifier: string;
    readonly replacement: string;
    readonly description: string | undefined;
    //readonly last: boolean = false;

    constructor(regex: string, modifier: string, replacement: string, description: string | undefined) {
        this.regex = regex;
        this.modifier = modifier;
        this.replacement = replacement;
        this.description = description;

        isNodeJs?.run(() => {
            if (!code_coverage_usedReplacements.get(this.id)) {
                code_coverage_usedReplacements.set(this.id, [false, this]);
            }
        });
    }

    private get id(): string {
        return `${this.regex}, ${this.modifier} -> ${this.replacement}`
    }

    public toString(): string {
        const ret = `Regex: ${this.regex} Replacement: ${this.replacement} Description: ${this.description}`;
        return ret;
    }

    private log(inputString: string, outputString: string) {
        console.log(`R /${this.regex}/ -> "${this.replacement}"`, inputString, "->", outputString);
    }

    public replace(inputString: string, incrementCounter: () => void){
        let outputString = inputString;
        let reg = RegExp(this.regex, this.modifier);
        if (reg.test(outputString)) {
            outputString = outputString.replace(reg, this.replacement);
            isNodeJs?.run(() => {
                this.log(inputString, outputString);
                let wasUsed = code_coverage_usedReplacements.get(this.id)?.[0];
                if (wasUsed === false) {
                    console.log("First use of", this.toString(), "on:", inputString);
                }
                code_coverage_usedReplacements.set(this.id, [true, this]);
            })
            incrementCounter();
        }
        return outputString;
    }

    public test(inputString: string): boolean {
        let reg = RegExp(this.regex, this.modifier);
        isNodeJs?.run(() => {
            this.log("#match", inputString);
            let wasUsed = code_coverage_usedReplacements.get(this.id)?.[0];
            if (wasUsed === false) {
                console.log("Match use of", this.toString(), "on:", inputString);
            }
            code_coverage_usedReplacements.set(this.id, [true, this]);
        })
        return reg.test(inputString);
    }


    public regexp(): RegExp {
        return new RegExp(this.regex, this.modifier);
    }
}

export const _devGetUsedReplacements = () => code_coverage_usedReplacements