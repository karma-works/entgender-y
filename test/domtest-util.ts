import {JSDOM} from "jsdom";

declare global {
    namespace NodeJS {
        interface Global {
            document: Document;
            window: Window;
            navigator: Navigator;
        }
    }
}

export function prepareDocument() {
    const dom = new JSDOM(
        `<html>
       <body>
       <main></main>
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
        for (let glbl of 'MutationObserver,NodeFilter,HTMLPreElement,HTMLInputElement,HTMLTextAreaElement,HTMLScriptElement,HTMLTextAreaElement,HTMLStyleElement,'.split(",")) {
            glbl = glbl.trim();
            if (w[glbl]) {
                g[glbl] = w[glbl];
            }
        }
    }
}

export function createParagraph(str: string): HTMLElement {
    const text = document.createTextNode(str);
    const p = document.createElement('p');
    p.appendChild(text);
    return p;
}