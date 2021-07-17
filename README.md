# Entgendy - Entgendern nach Phettberg - Browser Plugin

## Addon installieren
[Chrome Addon installieren](https://chrome.google.com/webstore/detail/entgendy-entgendern-nach/flodloojofholiiicnonnjfmeljjfpeh)

[Firefox Addon installieren](https://addons.mozilla.org/de/firefox/addon/entgendy-entgendern-phettberg/?utm_source=addons.mozilla.org&utm_medium=referral&utm_content=search)

[Edge Addon installieren](https://microsoftedge.microsoft.com/addons/detail/entgendy-entgendern-nach/kmpabhlkegofalbbdmgibjpbainobbbc)

Das Entgendy-Plugin entgendert Texte nach der Methode von Hermes Phettberg, so benannt von Thomas Kronschläger. Entgendy stellt Internetseiten in einer expressiven, entsexualisierten und gerechten Sprache dar, ohne dabei den Inhalt von Texten zu ändern.

Beim entgendern versucht man den Geschlechtsbezug aus der Sprache zu entfernen (im Gegensatz zum Gendern wo versucht wird alle Geschlechter erwähnen)
1. Berufs- und Personenbezeichnugnen werden in das Neutrum («das») gesetzt -> das Leser
2. männliche Endung "er" wird zu "y", im Plural zu "ys" ->  das Lesy
3. Konjugation auf das Neutrum anpassen (nur im singular) ->
   «Lieber Leser» wird zu «Liebes Lesy» (analog z.B. zu "Kind"), «Liebe Leser» zu «Liebe Lesys»
   
   
**Wichtig: Entgendy ändert nur gegenderte Texte! Ansonsten würde sich der Inhalt von Texten ändern.** 
Personen die als Mann oder Frau angesprochen werden, werden auch weiterhin als Mann oder Frau angesprochen. Weiterer Vorteil: Da das «gendern» bereits Markierungen im Text setzt, funktioniert das «entgendern» sehr zuverlässig.
Entgendy entgendert Binnen-I, Gendersterne, Bindestriche, Unterstriche, Doppelformen, trennende Punkte und Partizipien (optional).


Viel Spass mit der Erweiterung! Für einen freundlichen, gerechten, entsexualisierten, respektvollen, inkludierenden Umgang miteinander! &#127752; &#9829; &#9872; &#9873;

## Beispiele
(vorher -> nachher):

* Sehr geehrte/r Leserin oder Leser -> Sehr geehrtes Lesy
* die/der Student/in -> das Study
*  StudentInnen -> Studentys
* Lehrer_innen -> Lehrys
* Bürgerinnen und Bürger -> Bürgys
* Studierende -> Studentys


Die Semantik wird nicht verändert, daher Maskulin bleibt Maskulin, Feminin bleibt Feminin, 
> Bundestkanzler*Innen hatte die BRD schon viele. Der erste Bundeskanzler war Konrad Adenauer, die erste Bundeskanzlerin Angela Merkel.

wird zu

> Bundeskanzlys hatte die BRD schon viele. Der erste Bundeskanzler war Konrad Adenauer, die erste Bundeskanzlerin Angela Merkel.

Mehr Beispiele finden sich im Verzeichnis `/test`, in dem sich einige Unit-Tests für Korrekturen befinden.


## Entgendern nach Phettberg
[Entgenderung nach Phettberg](https://blog.lplusl.de/nebenbei/gendern-nach-phettberg/) ( [Erklärvideo](https://youtu.be/xVmGb7qACfA) ) hat viele Vorteile!

* Barrierefreiheit
* leicht lesbar und erlernbar
* Keine Sonderzeichen innerhalb von Wörtern
* Niemand ist nur «mit gemeint». Da es sich um eine neue Form handelt, werden Personen jeden Geschlechts gleichermassen und gleichberechtigt angesprochen.
* Ermöglicht eine präzisere Sprache: «Der Drucker» ist ein Gerät, «Das Drucky» eine Person, «ein Radler» ein alkoholhaltiges Süssgetränk, «ein Radly» eine Person die Fahrrad fährt. Das Maskulinum bezeichnet einen Mann (wenn dieser als Mann angesprochen werden möchte und diese Tatsache fur den Author relevant ist).


## Das Add-on selber bauen / Build the add-on

Voraussetzungen (mit denen das Add-on gebaut wurde) / Prerequisites:
* Node.js 10.19.0
* npm 6.13.4

Schritte / Steps:
* Repository klonen
* `npm install`
* `npm run build`
* `npm run bundle`

Fertig. Im Verzeichnis `/dist` befinden sich jetzt die Assets des Plugins. / Done. The directory `/dist` now contains all plugin assets.

## Links
[Folge uns auf Twitter](https://twitter.com/entgendery) um über neue Versionen und Updates informiert zu sein.
[Gendersprache korrigieren](https://github.com/brilliance-richter-huh/gendersprache-korrigieren) ersetzt gegenderte Texte durch das generische Maskulinum.

## Credits
Technisch basiert die Erweiterung auf dem Add-on *Gender korrigieren* und *Binnen-I be gone*. Vielen Dank dafür!
