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
    }

    public toString(): string {
        const ret = `Regex: ${this.regex} Replacement: ${this.replacement} Description: ${this.description}`;
        return ret;
    }

    private log(inputString: string, outputString: string) {
        console.log("R", inputString, "->", outputString);
    }

    public replace(inputString: string, incrementCounter: () => void){
        let outputString = inputString;
        let reg = RegExp(this.regex, this.modifier);
        if (reg.test(outputString)) {
            outputString = outputString.replace(reg, this.replacement);
            // this.log(inputString, outputString);
            incrementCounter();
        }
        return outputString;
    }

    public test(inputString: string): boolean {
        let reg = RegExp(this.regex, this.modifier);
        return reg.test(inputString);
    }


    public regexp(): RegExp {
        return new RegExp(this.regex, this.modifier);
    }
}