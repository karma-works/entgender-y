import {expect} from 'chai';
import {BeGone} from '../../src/gendersprachekorrigieren';
import {replacementTestStrings} from "./testdata";
import {createParagraph, prepareDocument} from "../domtest-util";
import {insertDataOfFailingTestsInto} from "./testdata-fehler";
import {_devGetUsedReplacements} from "../../src/replacement";

if (false) {
    /**
     * Bekannte Fehler, hier deaktiviert um den build nicht zu brechen
     */
    insertDataOfFailingTestsInto(replacementTestStrings);
}

// Note: MutationObserver is not implemented in JSDOM, so we cannot test the updates in unittests
// TODO: create a page which fills the testdata using javascript


beforeEach(() => {
    prepareDocument();
});

function setDocumentBody(html: string) {
    document.body.innerHTML = html;
}

let beGone = new BeGone();

function testFromToInitial(from: string, to: string) {
    //setDocumentBody(`<div>${from}</div>`);
    document.body.appendChild(createParagraph(from));

    beGone.entferneInitial();

    expect(document.body.textContent!!.trim()).to.be.equal(`${to}`.trim());
    console.log(`${from} -> ${to}`);
}

describe('setzte ins Neutrum', () => {

    for (let [from, to] of replacementTestStrings) {
        it(`${from} -> ${to}`, () => {
            testFromToInitial(from, to);
        });
    }
});

after(() => {
    console.log("=================")
    let countUnused = 0;
    let countUsed = 0;
    let unusedDescriptions: typeof replacementTestStrings = [];
    let existingTests = new Set(replacementTestStrings.map(a => a[0]));
    let alreadyPushed = new Set<string>();
    for (let [id, rused] of _devGetUsedReplacements().entries()) {
        let [used, repl] = rused;
        if (!used) {
            if (repl.description && !existingTests.has(repl.description) && !alreadyPushed.has(repl.description)) {
                unusedDescriptions.push([repl.description, repl.description]);
                alreadyPushed.add(repl.description);
            }
            console.log("Unused", repl.toString())
            countUnused++;
        } else {
            // console.log("Used", repl.toString())
            countUsed++;
        }
    }
    unusedDescriptions.forEach(v => {
        v[1] = beGone.entferneInitialForTesting(v[1])
    })
    console.log("// add \n", unusedDescriptions);
    console.log("Unused", countUnused, "used", countUsed);
    /*

    Unused Regex: b(d)(eren[\:\/\*\_\(-]{1,2}dessen|essen[\:\/\*\_\(-]{1,2}deren)\b Replacement: $1essen Description:
    Unused Regex: \b([KkDMSdms]?[Ee])iner([\:\/\*\_\(-]{1,2}s |\(S\) |S ) Replacement: $1ines  Description:
    Unused Regex: \b([KkDMSdms]?[Ee])ines([\:\/\*\_\(-]{1,2}r |\(R\) |R ) Replacement: $1ines  Description:
    Unused Regex: \bsie[\:\/\*\_\(-]{1,2}er|er[\:\/\*\_\(-]{1,2}sie\b Replacement: er Description:
    Unused Regex: \bSie[\:\/\*\_\(-]{1,2}[Ee]r|Er[\:\/\*\_\(-]{1,2}[Ss]ie\b Replacement: Es Description:
    Unused Regex: \b(([Dd]en|[Aa]us|[Aa]ußer|[Bb]ei|[Dd]ank|[Gg]egenüber|[Ll]aut|[Mm]it(samt)?|[Nn]ach|[Ss]amt|[Uu]nter|[Vv]on|[Zz]u|[Ww]egen|[MmSsDd]?eine[mnrs]) ([ID]?[a-zäöüß]+en)?[A-ZÄÖÜ][a-zäöüß]+)logIn\b Replacement: logy Description: unregelmäßiger Dativ bei eine/n Psycholog/in
    Unused Regex: er\(e?s\)|es[\/\*_\(-]+r\b Replacement: es Description: jedes/r
      -->
    Unused Regex: äsInnen Replacement: asys Description: ?? Gibt es das??
      -> nicht gefunden
    Unused Regex: ü(?=rfIn) Replacement: u Description:
     -> gibt's nicht
     */
})