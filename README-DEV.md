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

Dieser task ist darauf ausgelegt, eine nicht gelistete Version der Firefox-Erweiterung zu erstellen und zur Signierung über das Add-ons Developer Hub von Mozilla einzureichen.
Die nicht gelistete Erweiterung wird nicht in der öffentlichen Suche auf der Firefox Add-ons-Webseite erscheinen, sondern wird in den Ordner `web-ext-artifacts` heruntergeladen (Name `<some hash>-<version>.xpi`).

**Voraussetzungen:**
- Sie müssen ein [Mozilla-Entwicklerkonto](https://addons.mozilla.org/en-US/developers/) besitzen und Ihre API-Zugangsdaten (`API Key` und `API Secret`) generieren, um den Einreichungs- und Signaturprozess zu automatisieren. 

**Umgebungsvariablen:**
- Richten Sie Ihre Umgebungsvariablen ein, indem Sie eine `.env`-Datei im Wurzelverzeichnis Ihres Projekts erstellen und folgenden Inhalt hinzufügen:

    ```
    WEB_EXT_API_KEY=<Ihr-API-Schlüssel>
    WEB_EXT_API_SECRET=<Ihr-API-Geheimnis>
    GECKO_ID={6f98cc7a-c54e-11eb-9294-274a647be4e6}
    ```

  Ersetzen Sie `<Ihr-API-Schlüssel>` und `<Ihr-API-Geheimnis>` mit Ihren tatsächlichen Anmeldeinformationen.
  Ersetzen Sie die `GECKO_ID` durch Ihre eigene, falls vorhanden.

**Aufgabe ausführen:**
- Starten Sie den Veröffentlichungsprozess, indem Sie den folgenden Befehl in Ihrem Terminal ausführen:

    ```
    npm run unlisted-firefox-release
    ```

- Nach Abschluss gibt der Befehl eine URL zum Herunterladen der signierten Erweiterung aus oder liefert Details, falls es Probleme bei der Einreichung gab.

**Hinweis:** Dieser Prozess ist speziell für Firefox-Erweiterungen.