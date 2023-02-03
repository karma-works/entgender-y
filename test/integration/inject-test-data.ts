import {replacementTestStrings} from "../phettberg/testdata";
import "../phettberg/testdata-fehler"

function quoteattr(s: string, preserveCR:boolean=false) {
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
    ;
}

export function generateTableRows() {
    let rows = [];
    rows.push(`<tr><td><b>Ausgang</b></td><td><b>Vom Addon zu ändern</b></td><td><b>Ziel-ergebnis</b></td></tr>`);
    for (let [from, to] of replacementTestStrings) {
        rows.push(`<tr>
                    <td><input value="${quoteattr(from)}" disabled="true"></td>
                    <td x-expected="${quoteattr(to)}" title="${quoteattr(from)}" class="observe-element">${from}</td>
                    <td>${to}</td>
                    </tr>`)
    }
    document.getElementById("inject-table-body")!!.innerHTML = rows.join("\n");
}