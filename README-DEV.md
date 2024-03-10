# Wartung
Einmalig, um `npm-check-updates` zu installieren:  `npm i npm-check-updates -g`
```
# Schaue was es an updates gibt
npm-check-updates
# update von package.json
npm-check-updates -u
# lösche alte packages und installiere neue packages
npm prune && npm install
# alles bauen und testen
npm run prepare-release
```

# Known issues
Wenn beim Starten der Tests folgender Fehler auftritt: 
`TypeError [ERR_UNKNOWN_FILE_EXTENSION]: Unknown file extension ".ts"`
fehlt der parameter `--require ts-node/register `
In IntelliJ kann es unter "Extra mocha options" gesetzt werden.

# Infos zur package-json
`web-ext run` (starten von firefox) hat ein `--devtools` parameter, dass das gleiche tut wie
`--start-url 'about:devtools-toolbox?id={6f98cc7a-c54e-11eb-9294-274a647be4e6}&type=extension'`, außer dass es in einem extra fenster öffnet.

# Task: unlisted-firefox-release

This task is designed to create and submit an unlisted version of the Firefox extension for signing through Mozilla's Add-ons Developer Hub. 
The unlisted extension will not appear in the public search on the Firefox Add-ons website but will be downloaded into the `web-ext-artifacts` folder (name `<some hash>-<version>.xpi`)

**Prerequisites:**
1. You need to have a Mozilla Developer account and generate your API credentials (`API Key` and `API Secret`) to automate the submission and signing process.

**Environment Variables:**
- Set up your environment variables by creating a `.env` file at the root of your project with the following content:

    ```
    WEB_EXT_API_KEY=<your-api-key>
    WEB_EXT_API_SECRET=<your-api-secret>
    GECKO_ID={6f98cc7a-c54e-11eb-9294-274a647be4e6}
    ```

  Replace `<your-api-key>` and `<your-api-secret>` with your actual credentials.
  Replace the `GECKO_ID` by your own if needed.

**Running the Task:**
- Execute the release process by running the following command in your terminal:

    ```
    npm run unlisted-firefox-release
    ```

- Upon completion, the command will output a URL to download the signed extension or provide details if there are any issues with the submission.

**Note:** This process is specifically for Firefox extensions. 