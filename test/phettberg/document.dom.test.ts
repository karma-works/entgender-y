import {expect} from 'chai';
import {BeGone} from '../../src/gendersprachekorrigieren';
import {replacementTestStrings} from "./testdata";
import {createParagraph, prepareDocument} from "../domtest-util";

// import './testdata-fehler'

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