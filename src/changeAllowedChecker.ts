import {ifDebugging} from "./logUtil";

/**
 * Klasse zur prüfung of ein Element vom Nutzer editierbar ist.
 * Editierbare elemente sollen nicht vom Addon verändert werden.
 *
 * Nutzt ein internen cache aller editierbaren Elemente auf der Seite.
 *
 * MutationObserver ist außerhalb, in gendersprachekorrigien.ts
 */
export class ChangeAllowedChecker {
    private editableElements = new Set<Element>();

    constructor() {
        if (typeof MutationObserver == 'undefined') {
            /**
             * There is no MutationObserver for tests, so we need a fallback
             */
            this.useFallback();
        } else {
            this.checkAddedNode(document.body);
        }
    }

    /**
     * Braucht addedNodes, removedNodes und auch attributes
     * @param mutations
     */
    handleMutations(mutations: MutationRecord[]) {
        mutations.forEach((mutation: MutationRecord) => {
            try {
                for (let i = 0; i < mutation.addedNodes.length; i++) {
                    let node = mutation.addedNodes[i];
                    if (node instanceof Element) {
                        this.checkAddedNode(node)
                    }
                }
                for (let i = 0; i < mutation.removedNodes.length; i++) {
                    let node = mutation.removedNodes[i];
                    if (node instanceof Element) {
                        this.checkRemovedNode(node)
                    }
                }
                if (mutation.type == "attributes" && mutation.target instanceof Element) {
                    let node = mutation.target;
                    if (this.isEditable(node)) {
                        this.editableElements.add(node)
                        ifDebugging?.log("Added.a", node, this.editableElements);
                    } else {
                        if (this.editableElements.delete(node)) {
                            ifDebugging?.log("Removed.a", node, this.editableElements);
                        }
                    }
                }
            } catch (e) {
                console.error("FATAL: ChangeAllowedChecker error, disabling addon on this page", mutation, e);
                // We are cowards (or careful) - any error here might be dramatic, use the slower implementation.
                this.useFallback();
            }
        });
    }

    private useFallback() {
        // We don't write "this.shouldNotBeChanged = shouldNotBeChangedFallbackCreator()",
        // because we want to refresh the internal cache of the fallback
        Object.defineProperty(this, 'shouldNotBeChanged', {
            get(): any {
                return shouldNotBeChangedFallbackCreator();
            }
        });
    }

    private isEditable(node: Element): boolean {
        return node.getAttribute("role") === 'textbox' ||
            node.getAttribute("contenteditable") === 'true';
    }

    private checkAddedNode(node: Element) {
        if (this.isEditable(node)) {
            // Node: There is no "descendent-or-self" in querySelectorAll, so we need to check the 'self' ourselves
            this.editableElements.add(node);
            // console.log("Added", node, this.editableElements);
            return;
        }
        for (let editable of node.querySelectorAll("[role='textbox'],[contenteditable='true']")) {
            this.editableElements.add(editable);
            // console.log("Added", editable, this.editableElements);
        }
    }

    private checkRemovedNode(node: Element) {
        for (let editable of this.editableElements) {
            if (node.contains(editable) || editable == node) {
                this.editableElements.delete(editable);
                // console.log("Deleted", node, this.editableElements);
            }
        }
    }

    shouldNotBeChanged = (node: Node) => {
        if (isUntreatedElement(node)) return true;

        for (let editableElement of this.editableElements) {
            if (editableElement.contains(node)) {
                return true;
            }
        }
        return false;
    }
}

function isUntreatedElement(node: Node) {
    // note about filtering <pre> elements: those elements might contain linebreaks (/r/n etc.)
    // that are removed during filtering to make filtering easier; the easy fix is to ignore those elements
    return node.parentNode ? (node.parentNode instanceof HTMLInputElement || node.parentNode instanceof HTMLTextAreaElement || node.parentNode instanceof HTMLScriptElement || node.parentNode instanceof HTMLStyleElement || node.parentNode instanceof HTMLPreElement || node.parentNode.nodeName == "CODE" || node.parentNode.nodeName == "NOSCRIPT") : false;
}

function shouldNotBeChangedFallbackCreator():(node: Node) => boolean {
    let editableElements = document.querySelectorAll("[role='textbox'],[contenteditable='true']")
    return (node: Node) => {
        if (isUntreatedElement(node)) return true;

        for (let editableElement of editableElements) {
            if (editableElement.contains(node)) {
                return true;
            }
        }
        return false;
    }
}