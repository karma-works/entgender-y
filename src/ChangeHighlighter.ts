import * as Diff from "diff";

function createText(str: string):CharacterData {
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
        let lastRemoved: string | undefined = undefined
        for (let changeId=0;changeId<changes.length; changeId++) {
            let change = changes[changeId];
            if (change.added) {
                if (!lastRemoved) {
                    console.error("No lastRemoved");
                    newNodes.push(createText(change.value));
                    continue;
                }

                let maybeMoreDeleted = '';
                let foundMore = '';
                for (let changeId2 = changeId + 1; changeId2 < changes.length; changeId2++) {
                    let change2 = changes[changeId2];
                    if (change2.removed || change2.value.trim() == '') {
                        maybeMoreDeleted += change2.value;
                        if (change2.removed) {
                            changeId = changeId2;
                            foundMore = maybeMoreDeleted;
                        }
                    } else {
                        break;
                    }
                }
                let [_, word, space] = foundMore.match(/^(.*?)(\s*)$/)!!;
                if (word) {
                    lastRemoved = lastRemoved + word;
                }

                newNodes.push(this.createChangeElement(lastRemoved, change.value, style));
                lastRemoved = undefined;
                if (space) {
                    newNodes.push(createText(space));
                }
            } else if (change.removed) {
                lastRemoved = change.value;
            } else {
                newNodes.push(createText(change.value));
            }
        }

        node.after(...newNodes);
        node.remove();
    }
}