import * as Diff from "diff";
import {ifDebugging} from "./logUtil";

function createText(str: string): CharacterData {
    return document.createTextNode(str)
}

export class ChangeHighlighter {
    createChangeElement(from: string, to: string, style: string) {
        const span = document.createElement("span");
        span.textContent = to;
        span.setAttribute('title', from);
        span.setAttribute("style", style);
        span.classList.add("entgendy-change")
        return span;
    }

    apply(node: CharacterData, newText: string, style: string = "") {
        if ((node.parentNode?.nodeName) === 'TITLE') {
            node.data = newText;
            return;
        }
        let newNodes = new Array<Node>();
        const previous = node.data;
        let changes = Diff.diffWords(previous, newText, {
            ignoreWhitespace: true
        });
        let lastRemoved: string = ""
        let inProgressAdded: string = ""
        let flushInProgress = () => {
            if (!lastRemoved) {
                return
            }
            let [_, addedText, space] = inProgressAdded.match(/^(.*?)(\s*)$/)!!;
            newNodes.push(this.createChangeElement(lastRemoved.trim(), addedText, style));
            lastRemoved = "";
            inProgressAdded = "";
            if (space) {
                newNodes.push(createText(space));
            }
        }
        ifDebugging && ifDebugging.log("changes=" + newText, changes);
        for (let changeId = 0; changeId < changes.length; changeId++) {
            let change = changes[changeId];
            if (change.added) {
                if (!lastRemoved) {
                    console.error("No lastRemoved@" + newText, "recording", change.value);
                    newNodes.push(createText(change.value));
                    continue;
                }

                inProgressAdded = inProgressAdded + change.value;
                for (let changeId2 = changeId + 1; changeId2 < changes.length; changeId2++) {
                    let change2 = changes[changeId2];
                    let isChange = change2.removed || change2.added;
                    let isOnlySpace = change2.value.trim() == '';
                    // We don't expect insertions without reason. If it's followed by add without remove, it's an unrecognised change.
                    let isNoChangeButFollowedByAdd = !isChange && (changeId2 + 1 < changes.length && changes[changeId2 + 1].added);
                    let isNoChangeButFollowedByRemoveWithoutAddAdd = !isChange && (changeId2 + 2 < changes.length
                        && changes[changeId2 + 1].removed && !changes[changeId2 + 2].added);

                    if (isChange || isOnlySpace || isNoChangeButFollowedByAdd || isNoChangeButFollowedByRemoveWithoutAddAdd) {
                        let value = change2.value;
                        if (!isOnlySpace && !isChange) {
                            let splitWords = change2.value.split(/(\s+)/g)
                            let lastWord = splitWords.pop()!!;
                            if (splitWords.length > 0) {
                                flushInProgress();
                                newNodes.push(createText(splitWords.join("")));
                                value = lastWord;
                            }
                        }

                        if (!change2.added) {
                            lastRemoved = lastRemoved + value;
                        }
                        if (!change2.removed) {
                            changeId = changeId2;
                            inProgressAdded += value;
                        }
                        if (change2.removed) {
                            changeId = changeId2;
                        }
                    } else {
                        break;
                    }
                }

                flushInProgress();
            } else if (change.removed) {
                lastRemoved = change.value;
            } else {
                flushInProgress();
                newNodes.push(createText(change.value));
            }
        }

        node.after(...newNodes);
        node.remove();
    }
}