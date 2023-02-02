import {BeGone} from "./gendersprachekorrigieren";

interface Logger {
    log(...args: any[]): void;
}

if (typeof window === 'undefined') {
    console.log("Running in Node.js");
} else {
    console.log("Running in browser");
}

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