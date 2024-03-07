import {DOMWindow, JSDOM} from "jsdom";

declare global {
    namespace NodeJS {
        interface Global {
            document: Document;
            window: DOMWindow;
            navigator: Navigator;
            Node: Node;
        }
    }
}

export function prepareDocument(html?: string) {
    const dom = new JSDOM(
        html || `<html>
       <body>
       <main></main>
       </body>
     </html>`,
        {url: 'http://localhost'},
    );
    global.window = dom.window as any;
    global.document = dom.window.document;
    global.Node = {
        ELEMENT_NODE: 1,
        DOCUMENT_NODE: 9,
    } as any;

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