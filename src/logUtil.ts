import {BeGone} from "./gendersprachekorrigieren";

interface Logger {
    log(...args: any[]): void;
}

let _isBrowser = true;
if (typeof window === 'undefined') {
    console.log("Running in Node.js");
    _isBrowser = false;
} else {
    // console.log("Running in browser");
}

class ConditionalRunHelper implements Logger {
    constructor() {
        // overwrite log to have correct line numbers
        this.log = console.log.bind(console);
    }

    log(...args: any[]): void {
    }

    run<R>(callback: () => R): R {
        return callback()
    }

    tagNodes(tag: string, nodes: Array<CharacterData>) {
        for (let node of nodes) {
            let el = node.parentNode;
            if (el instanceof Element) {
                el.setAttribute(tag, '1');
            }
        }
    }
}

const disableAllLogs = true;
export const isBrowser = disableAllLogs ? undefined : (_isBrowser ? new ConditionalRunHelper() : undefined);
export const isNodeJs = disableAllLogs ? undefined : (!_isBrowser ? new ConditionalRunHelper() : undefined);

// FIXME TODO ERROR: don't put enableDebugging = true this in release
const enableDebugging = false;
export const ifDebugging = enableDebugging ? new ConditionalRunHelper() : undefined;

export function getLogger(name?: string): Logger {
    return console;
}

/**
 * Note: likely bad performance, don't call in production code.
 *
 * @param sliceExtra Count of stack elements to removed
 * @return Array of stack elements until and including methods of BeGone
 */
export function stackToBeGone(sliceExtra: number = 0): string[] {
    const BeGoneCls = "at " + BeGone.prototype.constructor.name;

    function stackTrace(): string {
        const err = new Error();
        return err.stack || "";
    }

    let stack = stackTrace().split("\n").slice(3 + sliceExtra);
    let i = 0;
    for (; i < stack.length; i++) {
        if (stack[i].indexOf(BeGoneCls) > 0) {
            // reached BeGone class
            break;
        }
    }
    for (; i < stack.length; i++) {
        if (stack[i].indexOf(BeGoneCls) == -1) {
            // leaved BeGone class again
            break;
        }
    }
    return stack.slice(0, i);
}