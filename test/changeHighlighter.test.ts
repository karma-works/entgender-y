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


    it('Highlight für lange Sätze', () => {
        let div = textBefore(`Nach intensiven Coachings durch Expert*innen haben die Zehntklässler einen Beratungsraum geschaffen. Unter dem Motto „von Schüler*innen für Schüler*innen“ bieten sie Unterstützung für Mitschüler*innen an, die Rassismus erfahren haben.`);
        highlighter.apply(div.firstChild as CharacterData, "Nach intensiven Coachings durch Expertys haben die Zehntklässler einen Beratungsraum geschaffen. Unter dem Motto „von Schülys für Schülys“ bieten sie Unterstützung für Mitschülys an, die Rassismus erfahren haben.", "style-foo");

        expect(div.innerHTML).to.be.equal(`Nach intensiven Coachings durch <span title="Expert*innen" style="style-foo" class="entgendy-change">Expertys</span> haben die Zehntklässler einen Beratungsraum geschaffen. Unter dem Motto „von <span title="Schüler*innen" style="style-foo" class="entgendy-change">Schülys</span> für <span title="Schüler*innen" style="style-foo" class="entgendy-change">Schülys</span>“ bieten sie Unterstützung für <span title="Mitschüler*innen" style="style-foo" class="entgendy-change">Mitschülys</span> an, die Rassismus erfahren haben.`);
    });

    it('Highlight für sich folgende wörter', () => {
        let div = textBefore("der/die Bürgerinnen und Bürgern jugendliche*r Professor*in");
        highlighter.apply(div.firstChild as CharacterData, "das Bürgys jugendliche Professory", "style-foo");

        console.log(div.innerHTML);
        expect(div.innerHTML).to.be.equal(`<span title="der/die Bürgerinnen und Bürgern jugendliche*r Professor*in" style="style-foo" class="entgendy-change">das Bürgys jugendliche Professory</span>`);
    });

    it('Highlight für sich nicht folgende wörter', () => {
        let div = textBefore("der/die wort Bürgerinnen und Bürgern wort hort jugendliche*r wort Professor*in");
        highlighter.apply(div.firstChild as CharacterData, "das wort Bürgys wort hort jugendliche wort Professory", "style-foo");

        console.log(div.innerHTML);
        expect(div.innerHTML).to.be.equal(`<span title="der/die" style="style-foo" class="entgendy-change">das</span> wort <span title="Bürgerinnen und Bürgern" style="style-foo" class="entgendy-change">Bürgys</span> wort hort <span title="jugendliche*r" style="style-foo" class="entgendy-change">jugendliche</span> wort <span title="Professor*in" style="style-foo" class="entgendy-change">Professory</span>`);
    });

});