import {ifDebugging} from "./logUtil";

/**
 * This package provides tool to traverse / observe all iframes, objects, embed and the shadowDom,
 * which are otherwise not traversed by MutationObserver, querySelectorAll, createTreeWalker()...
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

    /**
     * Because we can't put a MutationObserver on shadowRoot creation,
     *   we override attachShadow(), to let it add an attribute 'data-shadowrootattached' as a side-effect.
     * This is a mutation that we can observe using a regular MutationObserver, see observeShadowAttributeChanges()
     */
    private injectShadowRootObserverScript(targetDocument: Document) {
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
                this.injectShadowRootObserverScript(documentElement);
                this.observeShadowAttributeChanges(documentElement);

                // We assume the content was unknown before completion, and trigger a custom MutationRecord
                this.emitCustomMutationRecord([documentElement]);
            });
            return;
        }

        this.observer.observe(documentElement, this.config);
        this.observeNestedElements(documentElement);

        // Handle dynamically created shadow roots
        this.injectShadowRootObserverScript(documentElement);
        this.observeShadowAttributeChanges(documentElement);
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

        //let walker = new SuperPowerfulTreeWalker<Element>(root, NodeFilter.SHOW_ELEMENT);
        root.querySelectorAll('*').forEach((elem) => {
            if (elem.shadowRoot) {
                this.observeShadowRoot(elem.shadowRoot);
            }
        });
    }

    private observeShadowAttributeChanges(targetDocument: Document) {
        const attributeObserver = new MutationObserver((mutationsList) => {
            console.log("observeShadowAttributeChanges", mutationsList);
            let shadowRoots: Array<ShadowRoot> = [];
            for (let mutation of mutationsList) {
                if (mutation.type === 'attributes') {
                    const targetElem = mutation.target as Element;
                    if (targetElem.shadowRoot) {
                        this.observeShadowRoot(targetElem.shadowRoot);
                        shadowRoots.push(targetElem.shadowRoot);
                    } else {
                        console.warn("No shadow root on", targetElem);
                    }
                }
            }
            if (shadowRoots.length > 0) {
                // Changes to the shadow-dom need to be forwarded manually to the callback
                this.emitCustomMutationRecord(shadowRoots);
            }
        });

        attributeObserver.observe(targetDocument.body, {
            attributes: true,
            subtree: true,
            attributeFilter: ['data-shadowrootattached']
        });
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

export class SuperPowerfulTreeWalker<T extends Node> {
    private readonly root: Node;
    private readonly whatToShow: number;
    private readonly filter: NodeFilter | null;

    constructor(root: Node, whatToShow: number = NodeFilter.SHOW_ALL, filter: NodeFilter | null = null) {
        this.root = root;
        this.whatToShow = whatToShow;
        this.filter = filter;
    }

    private* internalWalk(node: Node): IterableIterator<T> {
        const walker = (node.ownerDocument || (node as Document)).createTreeWalker(node, this.whatToShow, this.filter);
        let currentNode: Node | null = walker.nextNode();

        while (currentNode) {
            yield currentNode as T;

            currentNode = walker.nextNode();
        }

        const walkerEl = (node.ownerDocument || (node as Document)).createTreeWalker(node, NodeFilter.SHOW_ELEMENT,
            {
                acceptNode: () => {
                    return NodeFilter.FILTER_ACCEPT;
                }
            }
        );


        let n: Element;
        while (n = walkerEl.nextNode() as Element) {
            if (n.shadowRoot) {
                yield* this.internalWalk(n.shadowRoot!!);
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

