import * as fs from 'fs';
import {prepareDocument} from "../domtest-util";
import {generateTableRows} from "./inject-test-data";

/**
 * Wir nutzen 'npm run test' zur code generierung... sollte besser gehen
 */
it('Generate code', () => {
    let indexHtml = fs.readFileSync("test/integration/index.html", "UTF-8");
    console.log(indexHtml);
    prepareDocument(indexHtml);
    generateTableRows();
    let staticPage = `<html>${document.head.outerHTML}${document.body.outerHTML}</html>`;
    fs.writeFileSync("test/integration/static.html", staticPage);
});