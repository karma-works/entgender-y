import {expect} from "chai";
import Replacements from "./replacements";


describe('Kontraktionen und Artikel', () => {
    let repl = new Replacements();
    it("zum*zur ", () => {
        const result = repl.replaceAll("zum*zur ", function(){});
        expect(result).to.be.equal("zum ", repl.getDebug("zum*zur "));
    });

    it("zum/zur ", () => {
        const result = repl.replaceAll("zum/zur ", function(){});
        expect(result).to.be.equal("zum ", repl.getDebug("zum*zur "));
    });
});