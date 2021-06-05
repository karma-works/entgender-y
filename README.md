# Entgendy - Entgendern nach Phettberg




[Entgenderung nach Phettberg](https://blog.lplusl.de/nebenbei/gendern-nach-phettberg/) ( [Erklärvideo](https://youtu.be/xVmGb7qACfA) ) hat viele Vorteile! 

* Barrierefreiheit
* leicht lesbar und erlernbar
* Keine Sonderzeichen innerhalb von Wörtern
* Niemand ist nur «mit gemeint». Da es sich um eine neue Form handelt, werden Personen jeden Geschlechts gleichermassen und gleichberechtigt angesprochen.
* Ermöglicht eine präzisere Sprache: Beispielsweise ist es möglich nur eine Gruppe von ausschliesslich Männern zu bezeichnen.

Diese Erweiterung entgendert Texte nach der Methode von Hermes Phettberg, die von Thomas Kronschläger «Entgendern nach Phetberg!» genannt wurde. 
Die Erweiterung ändert die Form von Texten, nicht den Inhalt. Maskulin bleibt Maskulin, Feminin bleibt Feminin, nur gegenderte Sprache wird entgendert und damit leicht lesbar und vorlesbar.

Wenn das Authory Gendersprache verwendet, möchte er besonders betonen «Es sind Menschen jeglichen Geschlechts gleichermassen gemeint».
Die Erweiterung entgendert deshalb nur dort, wo sie Genderschreibweise wie Binnen-I, Gendersterne, Unterstriche und ähnliche Konstrukte erkennt.

Für einen freundlichen, respektvollen, inkludierenden Umgang miteinander!  &#127752; &#9829; &#9872; &#9873;


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

## Credits
Technisch basiert die Erweiterung auf dem Add-on *Gender korrigieren* und *Binnen-I be gone*. Vielen Dank dafür!
