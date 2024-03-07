/**
 * This mutation observer wrapper is intended to observe all nested iframes and the shadowDom
 */
export class SuperPowerfulMutationObserver {
    private readonly observer: MutationObserver;
    private readonly config: MutationObserverInit;

    constructor(observer: MutationObserver, config: MutationObserverInit) {
        this.observer = observer;
        this.config = config;
    }

    private injectShadowRootObserverScript(targetDocument: Document) {
        const scriptContent = `
            (function() {
                const originalAttachShadow = Element.prototype.attachShadow;
                Element.prototype.attachShadow = function(init) {
                    try {
                        const shadowRoot = originalAttachShadow.apply(this, arguments);
                        window.top.postMessage({ event: 'shadowRootAttached', target: this }, '*');
                        return shadowRoot;
                    } catch(e) {
                        console.error("Failed wrapper", e);
                        throw e;
                    }
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

    private observeIframeContent(iframe: HTMLIFrameElement) {
        try {
            const documentElement = iframe.contentWindow?.document;
            if (documentElement) {
                this.observeDocumentElement(documentElement);
            }
        } catch (e) {
            console.warn("Can't access iframe content:", e);
        }
    }

    private observeDocumentElement(documentElement: Document) {
        if (documentElement.readyState !== "complete") {
            // delay until complete
            documentElement.addEventListener('readystatechange', () => {
                if (documentElement.readyState !== "complete") {
                    return;
                }
                this.injectShadowRootObserverScript(documentElement);
                this.observer.observe(documentElement, this.config);
                this.observeNestedElements(documentElement);
            });
            return;
        }

        this.observer.observe(documentElement, this.config);
        this.injectShadowRootObserverScript(documentElement);
        this.observeNestedElements(documentElement);
    }

    private observeNestedElements(root: Document | ShadowRoot) {
        root.querySelectorAll('iframe').forEach((iframe) => {
            this.observeIframeContent(iframe as HTMLIFrameElement);
        });

        root.querySelectorAll('*').forEach((elem) => {
            if (elem.shadowRoot) {
                this.observeShadowRoot(elem.shadowRoot);
            }
        });
    }

    public observe(doc: Document = document) {
        // Handle dynamically created shadow roots and iframes
        window.addEventListener('message', (event) => {
            if (event.data.event === 'shadowRootAttached') {
                this.observeShadowRoot((event.source as any).shadowRoot);
            }
        });

        // Observe the main document
        this.observeDocumentElement(doc);
    }
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

        const walkerEl = (node.ownerDocument || (node as Document)).createTreeWalker(node, NodeFilter.SHOW_ENTITY,
            {
                acceptNode: (node: Node) => {
                    return NodeFilter.FILTER_ACCEPT;
                }
            }
        );


        let n: Element;
        while (n = walkerEl.nextNode() as Element) {
            if (n.shadowRoot) {
                yield* this.internalWalk(n.shadowRoot!!);
            }

            if (n.nodeName === "IFRAME") {
                try {
                    const iframeContent = (n as HTMLIFrameElement).contentDocument;
                    if (iframeContent) {
                        console.log("Walking iframeContent", iframeContent);
                        yield* this.internalWalk(iframeContent);
                    }
                } catch (e) {
                    console.warn("Access to iframe content failed:", e);
                }
            }
        }
    }

    public [Symbol.iterator](): IterableIterator<T> {
        return this.internalWalk(this.root);
    }

    public toArray(): Array<T> {
        return Array.from(this);
    }
}

