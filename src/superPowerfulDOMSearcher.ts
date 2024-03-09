import {ifDebugging} from "./logUtil";

// Same as element.shadowRootOf, but works for closed shadowDom
const shadowRootOf: ((e: Element) => ShadowRoot | null) = (() => {
    if (chrome?.dom?.openOrClosedShadowRoot) {
        // Chrome version
        return function shadowRoot(element: Element): ShadowRoot | null {
            return chrome.dom.openOrClosedShadowRoot(element as HTMLElement);
        }
    }
    // firefox version
    return function shadowRoot(element: Element): ShadowRoot | null {
        return (element as any).openOrClosedShadowRoot || element.shadowRoot;
    }
})();

export type ShadowRootListener = (root: ShadowRoot) => void;

/**
 * Listens to shadom dom. Does NOT recurse into inner frames/object/embed.
 * Does recurse into nested ShadowRoots within the document.
 */
export class ShadowDomList implements Iterable<ShadowRoot> {
    private nodesContainingShadowRoot: Set<Element> = new Set();
    private observer: MutationObserver;
    private listeners: Set<ShadowRootListener> = new Set();

    private static FIELD_NAME = '__ShadowDomList';

    static of(root: Document) {
        if (!(root as any)[this.FIELD_NAME]) {
            (root as any)[this.FIELD_NAME] = new ShadowDomList(root);
        }
        return (root as any)[this.FIELD_NAME] as ShadowDomList;
    }

    private constructor(root: Document) {
        this.observer = new MutationObserver((mutationsList) => {
            for (let mutation of mutationsList) {
                if (mutation.type === 'attributes' &&
                    mutation.attributeName === 'data-shadowrootattached' &&
                    mutation.oldValue !== 'true') {
                    const targetElem = mutation.target as Element;
                    if (shadowRootOf(targetElem)) {
                        this.addElement(targetElem);
                    } else {
                        // should be impossible
                    }
                    targetElem.removeAttribute('data-shadowrootattached');
                }
            }
        });

        this.crawlAndObserve(root);
        this.injectShadowRootObserverScript(root);
    }

    private addElement(el: Element) {
        this.nodesContainingShadowRoot.add(el);
        this.listeners.forEach(l => l(shadowRootOf(el)!!))
    }

    public addListener(listener: ShadowRootListener, emitInitial: boolean = true) {
        this.listeners.add(listener);
        if (emitInitial) {
            this.nodesContainingShadowRoot.forEach(elem => listener(shadowRootOf(elem)!!));
        }
    }

    public removeListener(listener: ShadowRootListener) {
        this.listeners.delete(listener);
    }

    * [Symbol.iterator](): Iterator<ShadowRoot> {
        for (let elem of this.nodesContainingShadowRoot) {
            yield shadowRootOf(elem)!!;
        }
    }

    private crawlAndObserve(root: Document | DocumentFragment) {
        // Initial crawl to find existing shadow roots.
        const allElements = root.querySelectorAll('*');
        allElements.forEach(elem => {
            let shadowRoot = shadowRootOf(elem);
            if (shadowRoot) {
                this.addElement(elem);
                this.crawlAndObserve(shadowRoot);
            }
        });

        // start listening for shadow DOM attachments.
        this.observeShadowAttributeChanges(root);
    }

    /**
     * Because we can't put a MutationObserver on shadowRootOf creation,
     *   we override attachShadow(), to let it add an attribute 'data-shadowrootattached' as a side effect.
     * This is a mutation that we can observe using a regular MutationObserver, see observeShadowAttributeChanges()
     */
    private injectShadowRootObserverScript(targetDocument: Document) {
        // Note: we also force the attachShadow() to be in open mode
        const scriptContent = `
            (function() {
                const originalAttachShadow = Element.prototype.attachShadow;
                Element.prototype.attachShadow = function(init) {
                    const shadowRoot = originalAttachShadow.apply(this, arguments);
                    this.setAttribute('data-shadowrootattached', 'true');
                    return shadowRoot;
                };
            })();
        `;
        const script = targetDocument.createElement('script');
        script.textContent = scriptContent;
        (targetDocument.head || targetDocument.documentElement).appendChild(script);
        script.remove();
    }

    private observeShadowAttributeChanges(root: Document | DocumentFragment) {
        this.observer.observe(root, {
            attributes: true,
            attributeOldValue: true,
            subtree: true,
            attributeFilter: ['data-shadowrootattached']
        });
    }
}


/**
 * This package provides tool to traverse / observe all iframes, objects, embed and the shadowDom,
 * which are otherwise not traversed by MutationObserver, querySelectorAll, createTreeWalker()...
 *
 * TODO: what happens if an <iframe> is added via javascript? Won't be caught.
 */
export class SuperPowerfulMutationObserver {
    private readonly callback: MutationCallback;
    private readonly observer: MutationObserver;
    private readonly config: MutationObserverInit;

    constructor(callback: MutationCallback, config: MutationObserverInit) {
        this.callback = callback;
        this.observer = new MutationObserver(callback);
        this.config = config;
    }

    private observeShadowRoot(shadowRoot: ShadowRoot) {
        this.observer.observe(shadowRoot, this.config);
        this.observeNestedElements(shadowRoot);
    }

    private observeExternalContent(extContent: HTMLIFrameElement | HTMLObjectElement | HTMLEmbedElement) {
        try {
            const documentElement = innerElementContentDocument(extContent);
            if (documentElement) {
                this.observeDocumentElement(documentElement);
            }
            const observeOnLoad = () => {
                try {
                    const documentElement = innerElementContentDocument(extContent);
                    if (documentElement) {
                        this.observeDocumentElement(documentElement);
                        this.emitCustomMutationRecord([documentElement]);
                        console.info("extContent onload triggered", documentElement)
                    } else {
                        console.warn("extContent onload without document")
                    }
                } catch (e) {
                    console.warn("Can't access extContent content:", e);
                }
            };

            // Listen to 'load' events on the extContent to handle navigation/reloads.
            extContent.addEventListener('load', observeOnLoad);
        } catch (e) {
            console.warn("Can't access extContent content:", e);
        }
    }

    /**
     * Used for iframes, objects and root document
     */
    private observeDocumentElement(documentElement: Document) {
        if (documentElement.readyState !== "complete") {

            // delay until complete
            documentElement.addEventListener('readystatechange', () => {
                if (documentElement.readyState !== "complete") {
                    return;
                }
                this.observer.observe(documentElement, this.config);
                this.observeNestedElements(documentElement);

                // Handle dynamically created shadow roots
                this.observeShadowRootsOfDoc(documentElement);

                // We assume the content was unknown before completion, and trigger a custom MutationRecord
                this.emitCustomMutationRecord([documentElement]);
            });
            return;
        }

        this.observer.observe(documentElement, this.config);
        this.observeNestedElements(documentElement);

        // Handle dynamically created shadow roots
        this.observeShadowRootsOfDoc(documentElement);
    }

    private emitCustomMutationRecord(nodes: Array<ShadowRoot | Document>) {
        if (!(this.config.childList && this.config.subtree)) {
            console.log("emitCustomMutationRecord.Ignore shadow roots")
            return;
        }

        const mutationRecordArray: MutationRecord[] = nodes.map(root => {
            return {
                type: 'childList',
                target: root,
                addedNodes: root.childNodes,
                removedNodes: [],
                previousSibling: null,
                nextSibling: null,
                attributeName: null,
                attributeNamespace: null,
                oldValue: null,
            };
        }) as unknown[] as MutationRecord[]

        ifDebugging?.log("emitCustomMutationRecord.mutationRecordArray=", mutationRecordArray);

        // Emit the event with the virtual mutation record
        this.callback(mutationRecordArray, this.observer);
    }

    private observeNestedElements(root: Document | ShadowRoot) {
        root.querySelectorAll('iframe, object, embed').forEach((extContent) => {
            this.observeExternalContent(extContent as (HTMLObjectElement | HTMLIFrameElement | HTMLEmbedElement));
        });
    }

    private observeShadowRootsOfDoc(targetDocument: Document) {
        ShadowDomList.of(targetDocument).addListener(shadowRoot => {
            this.observeShadowRoot(shadowRoot);
            this.emitCustomMutationRecord([shadowRoot]);
        })
    }

    public observe(doc: Document = document) {
        // Observe the main document
        this.observeDocumentElement(doc);
    }

}

function innerElementContentDocument(n: Element) {
    let innerContent: Document | null = null;
    try {
        switch (n.nodeName) {
            case "IFRAME":
            case "OBJECT":
                innerContent = (n as HTMLIFrameElement).contentDocument;
                break;
            case  "EMBED":
                innerContent = (n as HTMLEmbedElement).getSVGDocument();
                break;
        }
    } catch (e) {
        console.warn("Access to inner content failed:", e);
    }
    return innerContent;
}

/**
 * Suports iframe, object, embed
 */
export class SuperPowerfulTreeWalker<T extends Node> {
    private readonly root: Node;
    private readonly whatToShow: number;
    private readonly filter: ((node: T) => number) | null;
    private readonly filterForInnerObjects: ((node: Element) => number) | null;

    constructor(root: Node, whatToShow: number = NodeFilter.SHOW_ALL,
                filter: ((node: T) => number) | null = null,
                filterForInnerObjects: ((node: Element) => number) | null = null) {
        this.root = root;
        this.whatToShow = whatToShow;
        this.filter = filter;
        this.filterForInnerObjects = filterForInnerObjects;
    }

    private* internalWalk(node: Node): IterableIterator<T> {
        const walker = (node.ownerDocument || (node as Document)).createTreeWalker(node, this.whatToShow, this.filter as NodeFilter);
        let currentNode: Node | null = walker.nextNode();

        while (currentNode) {
            yield currentNode as T;

            currentNode = walker.nextNode();
        }

        const walkerEl = (node.ownerDocument || (node as Document)).createTreeWalker(node, NodeFilter.SHOW_ELEMENT, this.filterForInnerObjects as NodeFilter);

        let n: Element;
        while (n = walkerEl.nextNode() as Element) {
            let shadowRoot = shadowRootOf(n);
            if (shadowRoot) {
                yield* this.internalWalk(shadowRoot);
            }
            let innerContent = innerElementContentDocument(n);
            if (innerContent) {
                console.log("Walking innerContent", innerContent);
                yield* this.internalWalk(innerContent);
            }
        }
    }

    public [Symbol.iterator](): IterableIterator<T> {
        return this.internalWalk(this.root);
    }

    public toArray(): Array<T> {
        return Array.from(this);
    }

    forEach(cb: (elem: T) => void) {
        for (let elem of this) {
            cb(elem);
        }
    }
}

// TODO: unused code
function superPowerfulQuerySelectorAll_using_SuperPowerfulTreeWalker(
    el: Element | Document | ShadowRoot,
    selector: string
): Iterable<Element> {
    function* generator() {
        let walker = new SuperPowerfulTreeWalker<Element>(el, NodeFilter.SHOW_ELEMENT);
        for (let el of walker) {
            if (el.matches(selector)) {
                yield el;
            }
        }
    }

    return {
        [Symbol.iterator](): Iterator<Element> {
            return generator();
        }
    };
}

/**
 * Also finds elements in frames, object, embed and shadowRoots
 */
export function superPowerfulQuerySelectorAll(
    el: Element | Document | ShadowRoot,
    selector: string
): Iterable<Element> {
    function* generator() {
        const elements = el.querySelectorAll(selector);
        for (const element of elements) {
            yield element;
        }

        // Search within shadow roots
        const shadowRoots = el.querySelectorAll('*:not(script):not(style)');
        for (const potentialShadowHost of shadowRoots) {
            let shadowRoot = shadowRootOf(potentialShadowHost);
            if (shadowRoot) {
                yield* superPowerfulQuerySelectorAll(shadowRoot, selector);
            }
        }

        // Special handling for certain elements that can contain nested documents
        const frameElements = el.querySelectorAll('iframe, object, embed');
        for (const frameEl of frameElements) {
            let innerContent = innerElementContentDocument(frameEl);
            if (innerContent) {
                yield* superPowerfulQuerySelectorAll(innerContent, selector);
            }
        }
    }

    return {
        [Symbol.iterator](): Iterator<Element> {
            return generator();
        }
    };
}