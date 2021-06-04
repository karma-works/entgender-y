# Entgendy - Entgendern nach Phettberg

Für einen freundlichen, respektvollen, inkluierenden Umgang miteinander!  &#127752; &#9829; &#9872; &#9873;


[Entgenderung nach Phettberg](https://blog.lplusl.de/nebenbei/gendern-nach-phettberg/) ( [Erklärvideo](https://youtu.be/xVmGb7qACfA) ) hat viele Vorteile! Wahrscheinlich kennen Sie die Meisten schon, wenn Sie diese Erweiterung gefunden haben!

* Barrierefreiheit
* leicht lesbar und erlernbar
* Keine Sonderzeichen innerhalb von Wörtern
* Niemand ist nur «mit gemeint». Da es sich um eine neue Form handelt, werden Personen jeden Geschlechts gleichermassen und gleichberechtigt angesprochen.
* Ermöglicht eine präzisere Sprache: Beispielsweise ist es möglich nur eine Gruppe von ausschliesslich Männern zu bezeichnen.

Diese Extension entgendert Texte nach der Methode von Hermes Phettberg, die von Thomas Kronschläger «Entgendern nach Phetberg!» genannt wurde. 
Die Erweiterung ist dabei bestrebt die Form von Texten zu ändern, nicht den Inhalt. Maskulin bleibt Maksulin, Feminin bleibt Feminin, nur gegenderte Sprache wird entgendert und damit leicht lesbar und vorlesbar.

Wenn ein Author Gendersprache verwendet, möchte er besonders betonen «Es sind Menschen jeglichen Geschlechts gleichermassen gemeint».
Die Erweiterung entgendert deshalb nur dort, wo sie Genderschreibweise wie Binnen-I, Gendersterne, Unterstriche und ähnliche Konstrukte erkennt.

Technisch basiert die Erweiterung auf dem Add-on *Gender korrigieren* und *Binnen-I be gone*.


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
* `npm run bundle`
* `dist/web-ext build`

Fertig. Im Verzeichnis `/dist` befinden sich jetzt die Assets des Plugins. / Done. The directory `/dist` now contains all plugin assets.

## Links
[Gendersprache korrigieren](https://github.com/brilliance-richter-huh/gendersprache-korrigieren) ersetzt gegenderte Texte durch das generische Maskulinum