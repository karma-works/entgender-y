import * as Diff from "diff";

function createText(str: string):CharacterData {
    return document.createTextNode(str)
}

export class ChangeHighlighter {
    createChangeElement(from: string, to: string) {
        const span = document.createElement("span");
        span.innerText = to;
        span.setAttribute('title', from);
        span.classList.add("entgendy-change")
        span.style.cursor = 'help';
        span.style.position = 'relative';
        span.style.textDecoration = 'underline wavy blue';
        return span;
    }

    apply(node: CharacterData, newText: string) {
        let newNodes = new Array<Node>();
        const previous = node.data;
        let changes = Diff.diffWords(previous, newText);
        console.log(changes);
        let lastRemoved: string | undefined = undefined
        for (let change of changes) {
            if (change.added) {
                if (!lastRemoved) {
                    console.error("No lastRemoved");
                    newNodes.push(createText(change.value));
                    continue;
                }
                newNodes.push(this.createChangeElement(lastRemoved, change.value));
                lastRemoved = undefined;
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