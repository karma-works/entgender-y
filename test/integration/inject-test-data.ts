import {replacementTestStrings} from "../phettberg/testdata";
import "../phettberg/testdata-fehler"
import {insertDataOfFailingTestsInto} from "../phettberg/testdata-fehler";

const fullTestData = [...replacementTestStrings];
insertDataOfFailingTestsInto(fullTestData);

function quoteattr(s: string, preserveCR: boolean = false) {
    let preserveCRS = preserveCR ? '&#13;' : '\n';
    return ('' + s) /* Forces the conversion to string. */
        .replace(/&/g, '&amp;') /* This MUST be the 1st replacement. */
        .replace(/'/g, '&apos;') /* The 4 other predefined entities, required. */
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        /*
        You may add other replacements here for HTML only
        (but it's not necessary).
        Or for XML, only if the named entities are defined in its DTD.
        */
        .replace(/\r\n/g, preserveCRS) /* Must be before the next replacement. */
        .replace(/[\r\n]/g, preserveCRS);
}

export function generateTableRows() {
    let rows = [];
    rows.push(`<tr><td><b>Ausgang</b></td><td><b>Vom Addon zu ändern</b></td><td><b>Ziel-ergebnis</b></td></tr>`);
    for (let [from, to] of fullTestData) {
        // was nicht verändert werden soll, wird in <code> blocks gesetzt
        rows.push(`<tr>
                    <td><code>${from}</code></td>
                    <td x-original="${quoteattr(from)}" x-expected="${quoteattr(to)}" title="${quoteattr(from)}" class="observe-element">${from}</td>
                    <td><code>${to}</code></td>
                    </tr>`)
    }
    document.getElementById("inject-table-body")!!.innerHTML = rows.join("\n");
}

export function generateTableRowsUsingShadowDom() {
    let rows = [];
    rows.push(`<tr><td><b>Ausgang</b></td><td><b>Vom Addon zu ändern</b></td><td><b>Ziel-ergebnis</b></td></tr>`);
    for (let [from, to] of fullTestData) {
        rows.push(`<tr>
                    <td><code>${from}</code></td>
                    <td class="observe-element" x-original="${quoteattr(from)}" x-expected="${quoteattr(to)}" title="${quoteattr(from)}"><div></div></td>
                    <td><code>${to}</code></td>
                    </tr>`);
    }
    document.getElementById("inject-table-body")!!.innerHTML = rows.join("\n");

    setTimeout(() => {
        // Now, for each .observe-element, create a shadow root and append the content
        document.querySelectorAll('.observe-element > div').forEach((element) => {
            let shadow = element.attachShadow({mode: 'closed'});
            let content = element.parentElement!!.getAttribute('x-original');

            // Test-script needs access for testing
            (element as any).closedShadowRootForTesting = shadow;

            shadow.innerHTML = `<span>${content}</span>`;
        });
    }, 100);
}