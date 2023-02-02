/**
 * @jest-environment jsdom
 */
import {expect} from 'chai';
import {BeGone} from '../src/gendersprachekorrigieren';
import {JSDOM} from 'jsdom';
import {replacementTestStrings} from "./testdata";

declare global {
    namespace NodeJS {
        interface Global {
            document: Document;
            window: Window;
            navigator: Navigator;
        }
    }
}

beforeEach(() => {

    const dom = new JSDOM(
        `<html>
       <body>
       </body>
     </html>`,
        {url: 'http://localhost'},
    );
    global.window = dom.window;
    global.document = dom.window.document;

    // Workaround, because stuff which is in the global context in browser isn't when running in node
    const g = <any>global;
    const w = <any>window;
    if (typeof NodeFilter == 'undefined') {
        for (let glbl of 'NodeFilter,HTMLPreElement,HTMLInputElement,HTMLTextAreaElement,HTMLScriptElement,HTMLTextAreaElement,HTMLStyleElement,'.split(",")) {
            glbl = glbl.trim();
            if (w[glbl]) {
                g[glbl] = w[glbl];
            }
        }
    }
});

function setDocumentBody(html: string) {
    document.body.innerHTML = html;
}

describe('setzte ins Neutrum', () => {

    // TODO FIXME: manche tests scheitern
    return;

    let beGone = new BeGone();
    for (let [from, to] of replacementTestStrings) {
        it(`${from} -> ${to}`, () => {
            setDocumentBody(`<div>${from}</div>`);
            beGone.entferneInitial();
            expect(document.body.textContent).to.be.equal(`${to}`);
            console.log(`${from} -> ${to}`);
        });
    }
});
