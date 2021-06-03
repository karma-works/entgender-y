# Entgendy - Entgendern nach Phettberg

Entgenderung nach Phettberg https://blog.lplusl.de/nebenbei/gendern-nach-phettberg/

Diese Extension entgendert die Texte einer aufgerufenen Webseite nach der Methode von Hermes Phettberg, die von Thomas Kronschläger «Entgendern nach Phetberg!» genannt wurde.

Wenn ein Author gendern möchte er damit sagen «Es sind Menschen jeglichen Geschlechts gleichermassen gemeint».
Die Erweiterung ist bestrebt nur die Form von Texten zu ändern, nicht den Inhalt. Maskulin bleibt Maksulin, Feminin bleibt Feminin, genderneutral bleibt genderneutral.
Korrekt entgendert die Erweiterung dort, wo sie Genderschreibweise wie Binnen-I, Gendersterne, Unterstriche und ähnliche Konstrukte erkennt.

Die Erweiterung basiert auf dem Add-on *Gender korrigieren* und *Binnen-I be gone*.


## Beispiele
(vorher -> nachher):

* StudentInnen -> Studentys
* Lehrer_innen -> Lehrys
* Bürgerinnen und Bürger -> Bürgys
* Studierende -> Studentys

Mehr Beispiele finden sich im Verzeichnis `/test`, in dem sich einige Unit-Tests für Korrekturen befinden.

## Das Add-on selber bauen / Build the add-on

Voraussetzungen (mit denen das Add-on gebaut wurde) / Prerequisites:
* Node.js 10.19.0
* npm 6.13.4

Schritte / Steps:
* Repository klonen
* `npm install`
* `npm run build`

Fertig. Im Verzeichnis `/dist` befinden sich jetzt die Assets des Plugins. / Done. The directory `/dist` now contains all plugin assets.
