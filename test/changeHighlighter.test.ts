import {ChangeHighlighter} from "../src/ChangeHighlighter";
import {prepareDocument} from "./domtest-util";
import {expect} from "chai";

beforeEach(() => {
    prepareDocument();
});

function textBefore(text: string): HTMLDivElement {
    document.body.innerHTML=`<div id="container"></div>`;
    let div = document.getElementById("container")!!;
    div.textContent = text;
    return <HTMLDivElement>div;
}

const highlighter = new ChangeHighlighter();
describe('Doppelnennung', () => {

    it('Highlight für mehrere wörter funtioniert', () => {
        let div = textBefore("steht den Bürgerinnen und Bürgern das");
        highlighter.apply(div.firstChild as CharacterData, "steht den Bürgys das", "style-foo");

        expect(div.innerHTML).to.be.equal(`steht den <span title="Bürgerinnen und Bürgern" style="style-foo" class="entgendy-change">Bürgys</span> das`);
    });
});