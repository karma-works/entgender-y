
import {Const} from "./const";

enum Preconditions {
    ARTIKEL_STUFF,
    ARTIKEL_STUFF_2,
    ARTIKEL_STUFF_3
}

export class Replacement {
    regex: string;
    modifier: string;
    replacement: string;
    description: string | undefined;
    last: boolean = false;

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

    public replace(inputString: string, incrementCounter: () => void){
        let outputString = inputString;
        let reg = RegExp(this.regex, this.modifier);
        if (reg.test(outputString)) {
            outputString = outputString.replace(reg, this.replacement);
            incrementCounter();
        }
        return outputString;
    }

    public regexp(): RegExp {
        return new RegExp(this.regex, this.modifier);
    }
}

export default class Replacements {

    private artikelStuff: Array<Replacement> = [
        new Replacement(String.raw`\b(d)(ie${Const.gstar}der|er${Const.gstar}die)\b`, "ig", "\$1as", ""),
        new Replacement(String.raw`\b(d)(en${Const.gstar}die|ie${Const.gstar}den)\b`, "ig", "\$1as", ""),
        new Replacement(String.raw`\b(d)(es${Const.gstar}der|er${Const.gstar}des)\b`, "ig", "\$1es", ""),
        new Replacement(String.raw`\b(d)(er${Const.gstar}dem|em${Const.gstar}der)\b`, "ig", "\$1em", ""),
        new Replacement(String.raw`b(d)(eren${Const.gstar}dessen|essen${Const.gstar}deren)\b`, "ig", "\$1essen", ""),
        new Replacement(String.raw`\bdiese[r]?${Const.gstar}(diese[rnms])`, "ig", "\$1", "1"),
        new Replacement(String.raw`(diese[rnms])${Const.gstar}diese[r]?\b`, "ig", "\$1", "2"),
        new Replacement(String.raw`\b([KkDMSdms]?[Ee])in(${Const.gstar}e |\(e\) |E )`, "g", "\$1in ", ""),
        new Replacement(String.raw`\b([KkDMSdms]?[Ee])ine(${Const.gstar}r |\(r\) |R )`, "g", "\$1iner ", ""),
        new Replacement(String.raw`\b([KkDMSdms]?[Ee])iner(${Const.gstar}s |\(S\) |S )`, "g", "\$1ines ", ""),
        new Replacement(String.raw`\b([KkDMSdms]?[Ee])ines(${Const.gstar}r |\(R\) |R )`, "g", "\$1ines ", ""),
        new Replacement(String.raw`\b([KkDMSdms]?[Ee])iner(${Const.gstar}m |\(m\) |M )`, "g", "\$1inem ", ""),
        new Replacement(String.raw`\b([KkDMSdms]?[Ee])inem(${Const.gstar}r |\(r\) |R )`, "g", "\$1inem ", ""),
        new Replacement(String.raw`\b([KkDMSdms]?[Ee])ine(m|r)${Const.gstar}([KkDMSdms]?[Ee])ine(m |r )`, "g", "\$1inem ", "einer_einem, keiner_keinem"),
        new Replacement(String.raw`\b([KkDMSdms]?[Ee])ine?(m|r)?${Const.gstar}([KkDMSdms]?[Ee])ine?(m |r )?`, "g", "\$1in", "ein/eine"),
        new Replacement(String.raw`\b([KkDMSdms]?[Ee])ine(${Const.gstar}n |\(n\) |N )`, "g", "\$1in ", ""),
        new Replacement(String.raw`\bsie${Const.gstar}er|er${Const.gstar}sie\b`, "g", "er", ""),
        new Replacement(String.raw`\bSie${Const.gstar}[Ee]r|Er${Const.gstar}[Ss]ie\b`, "g", "Es", ""),
        new Replacement(String.raw`\b(i)(hr${Const.gstar}ihm|hm${Const.gstar}ihr)\b`, "ig", "\$1hm", ""),
        new Replacement(String.raw`\bsie${Const.gstar}ihn|ihn${Const.gstar}ie\b`, "g", "ihn", ""),
        new Replacement(String.raw`\bSie${Const.gstar}[Ii]hn|Ihn${Const.gstar}[Ss]ie\b`, "g", "Ihn", ""),
        new Replacement(String.raw`\bihr${Const.gstar}e\b`, "ig", "ihr", "ihr*e Partner*in"),
        new Replacement(String.raw`\bihre?[rnms]?${Const.gstar}(seine?[rnms]?)`, "ig", "\$1", "ihr*e Partner*in"),
        new Replacement(String.raw`(seine?[rnms]?)${Const.gstar}ihre?[rnms]?\b`, "ig", "\$1", "ihr*e Partner*in"),
        new Replacement(String.raw`\b(z)(um${Const.gstar}zur|ur${Const.gstar}zum)\b`, "ig", "\$1um", ""),
        new Replacement(String.raw`jede[rnms]?${Const.gstar}(jede[rnms]?)\b`, "ig",  "\$1", "")
    ];

    private artikelStuff2: Array<Replacement> = [
        new Replacement(String.raw`(?<beginning>m\b.{3,30})(?<star>[\/\*_\(-]{1,2})(?<suffix>[rn])\b`, "ig", "\$1\$3", "Dativ: einem progressive*n Staatsoberhaupt"),
        new Replacement(String.raw`(\b[a-zäöü]+e)([\/\*_\(-]+)(n|e\(n\)|eN\b)`, "g", "\$1s", "jede*n, europäische*n"),
        new Replacement(String.raw`([\b“ ][A-ZÄÖÜ]\w+)(e[\/\*_\(-]+)(n|e\(n\)|eN[\b“ ])`, "g", "\$1y", "Wehrbeauftragte*n“"),
        new Replacement(String.raw`e[\/\*_\(-]+r|e\(r\)|eR\b`, "g", "es", "jede/r,jede(r),jedeR"),
        new Replacement(String.raw`em\(e?r\)|em[\/\*_\(-]+r\b`, "g", "em", "jedem/r"),
        new Replacement(String.raw`er\(e?s\)|es[\/\*_\(-]+r\b`, "g", "es", "jedes/r")
    ];

    private artikelStuff3: Array<Replacement> = [
        new Replacement( String.raw`\b(frau|man+|mensch)+[\/\*_\(-](frau|man+|mensch|[\/\*_\(-])*`, "", "man", "")
    ];

    private _rmap: Map<Preconditions, Array<Replacement>> = new Map<Preconditions, Array<Replacement>>([
        [Preconditions.ARTIKEL_STUFF, this.artikelStuff],
        [Preconditions.ARTIKEL_STUFF_2, this.artikelStuff2],
        [Preconditions.ARTIKEL_STUFF_3, this.artikelStuff3]
    ]);

    rmap(): Map<Preconditions, Array<Replacement>> {
        return this._rmap;
    }

    public replaceAll(inputString: string, preconditions: Preconditions[], incrementCounter: () => void): string {
        let outputString = inputString;

        this.rmap().forEach((rmap: Array<Replacement>, key: Preconditions) => {
            if(preconditions.includes(key)) {
                for (const replacement of rmap) {
                    outputString = replacement.replace(outputString, incrementCounter);
                }
            }
        });

        return outputString;
    }

    public replaceArtikel1(inputString: string, incrementCounter: () => void): string {
        return this.replaceAll(inputString, [Preconditions.ARTIKEL_STUFF], incrementCounter);
    }

    public replaceArtikel2(inputString: string, incrementCounter: () => void): string {
        return this.replaceAll(inputString, [Preconditions.ARTIKEL_STUFF_2], incrementCounter);
    }

    public replaceArtikel3(inputString: string, incrementCounter: () => void): string {
        return this.replaceAll(inputString, [Preconditions.ARTIKEL_STUFF_3], incrementCounter);
    }

    public getDebug(inputString: string): string {
        let out = '\n';
        this.rmap().forEach((rmap: Array<Replacement>, key: Preconditions) => {
            for (const replacement of rmap) {
                let regex = RegExp(replacement.regex, replacement.modifier);
                if (regex.test(inputString)) {
                    out = out + replacement + "\n";
                }
            }
        });

        return out + "\n";
    }
}