import * as Diff from "diff";
import {ifDebugging} from "./logUtil";

// Create a text node with the given string.
function createText(doc: Document, str: string): CharacterData {
    return doc.createTextNode(str);
}

const ELEMENTS_NOT_SUPPORTING_SPAN = ["TITLE", "OPTION"];

export class ChangeHighlighter {
    // Create a span element that visually represents the change.
    // This element highlights the new text and stores the original text in a tooltip.
    createChangeElement(doc: Document, from: string, to: string, style: string) {
        const span = doc.createElement("span");
        span.textContent = to;
        span.setAttribute('title', from);
        span.setAttribute("style", style);
        span.classList.add("entgendy-change");
        return span;
    }

    // Apply changes from newText to the specified node, highlighting differences.
    apply(node: CharacterData, newText: string, style: string = "") {
        let parentNode = node.parentNode as (Element | null);
        if (!parentNode || parentNode.nodeName in ELEMENTS_NOT_SUPPORTING_SPAN || !(parentNode.namespaceURI === null || parentNode?.namespaceURI === "http://www.w3.org/1999/xhtml")) {
            // This skips some html nodes, and all non-html (svg...)
            node.data = newText;
            return;
        }

        let doc = node.ownerDocument;
        let newNodes = new Array<Node>();
        const previousText = node.data;

        // Compute the text differences using a word-level diff algorithm.
        let changes = Diff.diffWords(previousText, newText, {
            ignoreWhitespace: true
        });

        let lastRemoved = "";
        let inProgressAdded = "";

        // Flush the in-progress changes by creating a change element or a text node.
        let flushInProgress = () => {
            if (!lastRemoved) {
                return;
            }
            // Separate added text into main content and trailing space if present.
            let [_, addedText, space] = inProgressAdded.match(/^(.*?)(\s*)$/)!!;
            newNodes.push(this.createChangeElement(doc, lastRemoved.trim(), addedText, style));
            lastRemoved = "";
            inProgressAdded = "";
            // Add any trailing space as a separate text node.
            if (space) {
                newNodes.push(createText(doc, space));
            }
        };

        ifDebugging?.log("changes=" + newText, changes);

        // Process each change to construct new nodes reflecting the text updates.
        for (let changeId = 0; changeId < changes.length; changeId++) {
            let change = changes[changeId];
            let {added, removed, value} = change;

            let isChange = removed || added;
            let isOnlySpace = value.trim() === '';

            // On replace, Diff.diffWords normally writes first the removed, then the added.
            // Any change from this pattern means that diffWords() represented a replaced term, by a constant root followed by a removal/addition.
            // In that case, we need to merge the unchangedNonSpaceText with the subsequent changes.
            let followedByRegularChange = (changeId + 2 < changes.length && changes[changeId + 1].removed && changes[changeId + 2].added);
            let isUnchangedNonSpaceText = (!isChange && !isOnlySpace);
            let lastElement = !(changeId + 1 < changes.length);
            let isRealUnmodifiedText = isUnchangedNonSpaceText && (lastElement || followedByRegularChange);

            // If it is really an unchanged text, flush in-progress changes and add the text.
            if (isRealUnmodifiedText) {
                flushInProgress();
                newNodes.push(createText(doc, value));
            } else {
                // Special case, while diffWords() said it is not a change, the last word
                // is actually part of a replaced term (which needs highlighting)
                if (isUnchangedNonSpaceText) {
                    // We recover the last word if multiple words,
                    // to write the previous words as an unchanged text block.
                    let splitWords = value.split(/(\s+)/g);
                    let lastWord = splitWords.pop()!!;
                    if (splitWords.length > 0) {
                        flushInProgress();
                        newNodes.push(createText(doc, splitWords.join("")));
                        value = lastWord;
                    }
                }
                // Accumulate removed and added text, to be processed or flushed.
                if (!added) {
                    lastRemoved += value;
                }
                if (!removed) {
                    inProgressAdded += value;
                }
            }
        }

        // Apply any remaining updates are applied.
        flushInProgress();

        // Insert new nodes after the original node and remove the original node, effectively replacing it.
        node.after(...newNodes);
        node.remove();
    }
}