import { expect } from 'chai';
import { BeGone } from '../src/gendersprachekorrigieren';

describe('setzte ins Neutrum', ()=> {
    let beGone = new BeGone();
    it('(Gross) Die Präsidentin -> Das Präsidenty', () => {
        const result = beGone.entferneInitialForTesting("Die Präsidentin oder der Präsident");
        expect(result).to.be.equal("Das Präsidenty");
    });

    it('kein_e', () => {
        const result = beGone.entferneInitialForTesting("...muss man kein_e Nahost-Expert_in sein.");
        expect(result).to.be.equal("...muss man kein Nahost-Experty sein.");
    });

    it('Mehrzahl', () => {
        const result = beGone.entferneInitialForTesting("mit mehr als 50 Sprecher*innen");
        expect(result).to.be.equal("mit mehr als 50 Sprechys");
    });

    it('bekannten Musiker:innen -> bekannten Musikys', () => {
        const result = beGone.entferneInitialForTesting("von einigen Dutzend mehr oder eher weniger bekannten Musiker:innen unterzeichneten Aufruf");
        expect(result).to.be.equal("von einigen Dutzend mehr oder eher weniger bekannten Musikys unterzeichneten Aufruf");
    });
});

describe('entferne Binnen-I', () => {
    let beGone = new BeGone();

    it('Journalist*innen -> Journalistys', () => {
        const result = beGone.entferneInitialForTesting("Journalist*innen");
        expect(result).to.be.equal("Journalistys");
    });

    it('Medienmacher*innen -> Medienmachys', () => {
        const result = beGone.entferneInitialForTesting("Medienmacher*innen");
        expect(result).to.be.equal("Medienmachys");
    });

    it('Lehrer/innen -> Lehrys', () => {
        const result = beGone.entferneInitialForTesting("Lehrer/innen");
        expect(result).to.be.equal("Lehrys");
    });

    it('Lehrer(innen) -> Lehrys', () => {
        const result = beGone.entferneInitialForTesting("Lehrer(innen)");
        expect(result).to.be.equal("Lehrys");
    });

    it('Lehrer*innen* -> Lehrys', () => {
        const result = beGone.entferneInitialForTesting("Lehrer*innen");
        expect(result).to.be.equal("Lehrys");
    });

    it('LehrerInnen -> Lehrys', () => {
        const result = beGone.entferneInitialForTesting("LehrerInnen");
        expect(result).to.be.equal("Lehrys");
    });

    it('LehrerINNen -> Lehrys', () => {
        const result = beGone.entferneInitialForTesting("LehrerINNen");
        expect(result).to.be.equal("Lehrys");
    });

    it('die ganzen Lehrer*innen* -> die ganzen Lehrys', () => {
        const result = beGone.entferneInitialForTesting("die ganzen Lehrer*innen");
        expect(result).to.be.equal("die ganzen Lehrys");
    });

    it('der ganzen Lehrer*innen* -> der ganzen Lehrys', () => {
        const result = beGone.entferneInitialForTesting("der ganzen Lehrer*innen");
        expect(result).to.be.equal("der ganzen Lehrys");
    });

    it('den ganzen Lehrer*innen* -> den ganzen Lehrys', () => {
        const result = beGone.entferneInitialForTesting("den ganzen Lehrer*innen");
        expect(result).to.be.equal("den ganzen Lehrys");
    });

    it('deren ganzen Lehrer*innen* -> deren ganzen Lehrys', () => {
        const result = beGone.entferneInitialForTesting("deren ganzen Lehrer*innen");
        expect(result).to.be.equal("deren ganzen Lehrys");
    });

    it('eine/n Psycholog/in -> ein Psychology', () => {
        const result = beGone.entferneInitialForTesting("eine/n Psycholog/in");
        expect(result).to.be.equal("ein Psychology");
    });

    it('ExpertIn -> Experty', () => {
        const result = beGone.entferneInitialForTesting("ExpertIn");
        expect(result).to.be.equal("Experty");
    });

    it('BeamtIn -> Beamty', () => {
        const result = beGone.entferneInitialForTesting("BeamtIn");
        expect(result).to.be.equal("Beamty");
    });

    it('AnwältInnen -> Anwältys', () => {
        const result = beGone.entferneInitialForTesting("AnwältInnen");
        expect(result).to.be.equal("Anwältys");
    });

    it('WeltverbesserIn -> Weltverbessy', () => {
        const result = beGone.entferneInitialForTesting("WeltverbesserIn");
        expect(result).to.be.equal("Weltverbessy");
    });

    it('JournalistInfrage -> Journalistyfrage', () => {
        const result = beGone.entferneInitialForTesting("JournalistInfrage");
        expect(result).to.be.equal("Journalistyfrage");
    });

    it('der/die LehrerIn -> das Lehry', () => {
        const result = beGone.entferneInitialForTesting("der/die LehrerIn");
        expect(result).to.be.equal("das Lehry");
    });

    it('den/die LehrerIn -> das Lehry', () => {
        const result = beGone.entferneInitialForTesting("den/die LehrerIn");
        expect(result).to.be.equal("das Lehry");
    });

    it('des/der -> des', () => {
        const result = beGone.entferneInitialForTesting("des/der");
        expect(result).to.be.equal("des");
    });

    it('dem/der -> dem', () => {
        const result = beGone.entferneInitialForTesting("dem/der");
        expect(result).to.be.equal("dem");
    });

    it('den LehrerInnen -> den Lehrys', () => {
        const result = beGone.entferneInitialForTesting("den LehrerInnen");
        expect(result).to.be.equal("den Lehrys");
    });
    
    it('einem*r Schüler*In -> einem Schüly', () => {
        const result = beGone.entferneInitialForTesting("einem*r Schüler*In");
        expect(result).to.be.equal("einem Schüly");
    });

    it('deren Musiker:innen sangen -> deren Musiker sangen', () => {
        const result = beGone.entferneInitialForTesting("deren Musiker:innen sangen");
        expect(result).to.be.equal("deren Musikys sangen");
    });

    it('MusikerInnen -> Musikys', () => {
        const result = beGone.entferneInitialForTesting("Auch wenn man sich schätzt und freundlich grüßt: Prinzipiell hat man es in der freien Bremer Szene, bei den MusikerInnen wie den VeranstalterInnen, eher mit EinzelkämpferInnen zu tun.");
        expect(result).to.be.equal("Auch wenn man sich schätzt und freundlich grüßt: Prinzipiell hat man es in der freien Bremer Szene, bei den Musikys wie den Veranstaltys, eher mit Einzelkämpfys zu tun.");
    });

    it('MusikerInnen -> Musikys', () => {
        const result = beGone.entferneInitialForTesting("Kaum ausgezogen, hat sie die Straßen mit Bildern von zwei MusikerInnen dekoriert.");
        expect(result).to.be.equal("Kaum ausgezogen, hat sie die Straßen mit Bildern von zwei Musikys dekoriert.");
    });

    it('von Autor*innen und Freund*innen -> von Autorys und Freundys', () => {
        const result = beGone.entferneInitialForTesting("Abseitiges, Tiefsinniges & Schönes von Autor*innen und Freund*innen der taz.");
        expect(result).to.be.equal("Abseitiges, Tiefsinniges & Schönes von Autorys und Freundys der taz.");
    });

    it('von Autor*innen und Freund*innen -> von Autoren und Freunden', () => {
        const result = beGone.entferneInitialForTesting("Wenn Friedrich Merz Bundeskanzler wird, dann wandere ich aus in ein Land mit einer/m*x progressive*n*x Staatsoberhaupt.");
        // besser als nichts
        expect(result).to.be.equal("Wenn Friedrich Merz Bundeskanzler wird, dann wandere ich aus in ein Land mit einem progressiven Staatsoberhaupt.");
    });

    it('Mehrzahl', () => {
        const result = beGone.entferneInitialForTesting("mehr als 50 Sprecher*innen nahmen teil");
        expect(result).to.be.equal("mehr als 50 Sprechys nahmen teil");
    });
    it("Judinnen*Juden", () => {
        const result = beGone.entferneInitialForTesting("Ich habe oft das Gefühl, Solidarität mit Palästinenser*innen und Jüdinnen*Juden schließe sich aus.");
        expect(result).to.be.equal("Ich habe oft das Gefühl, Solidarität mit Palästinensys und Judys schließe sich aus.");
    });

    it("Corona-Leugner·innen", () => {
        const result = beGone.entferneInitialForTesting("Corona-Leugner·innen");
        expect(result).to.be.equal("Corona-Leugnys");
    });


    it("Bindestrich im Wort sozial-ökologische bleibt erhalten", () => {
        const result = beGone.entferneInitialForTesting("auf die globale sozial-ökologische Transformation. ");
        expect(result).to.be.equal("auf die globale sozial-ökologische Transformation. ");
    });

    it('des/der LehrerIn -> des Lehrys', () => {
        const result = beGone.entferneInitialForTesting("des/der LehrerIn");
        expect(result).to.be.equal("des Lehry");
    });


});


describe('Unregelmässige Formen', () => {
    let beGone = new BeGone();
    it('Sonderformen Sinti und Roma', () => {
        const result = beGone.entferneInitialForTesting(" Sinti*ze und Rom*nja ");
        expect(result).to.be.equal(" Sintys und Romys ");
    });

    it('Sonderformen Muslim:a', () => {
        const result = beGone.entferneInitialForTesting(" Muslim:a ");
        expect(result).to.be.equal(" Muslimy ");
    });
});


describe('Kontraktionen und Artikel', () => {
    let beGone = new BeGone();
    it("zum*zur Gewalttäter*in", () => {
        const result = beGone.entferneInitialForTesting("zum*zur Gewalttäter*in");
        expect(result).to.be.equal("zum Gewalttäty");
    });

    it("zum/zur Gewalttäter/in", () => {
        const result = beGone.entferneInitialForTesting("zum/zur Gewalttäter/in");
        expect(result).to.be.equal("zum Gewalttäty");
    });

    it("Keinem/keiner", () => {
        const result = beGone.entferneInitialForTesting("Keinem/keiner ");
        expect(result).to.be.equal("Keinem ");
    });

    it("Einem*einer", () => {
        const result = beGone.entferneInitialForTesting("Einem*einer ");
        expect(result).to.be.equal("Einem ");
    });

    it("Der*die", () => {
        const result = beGone.entferneInitialForTesting("Der*die ");
        expect(result).to.be.equal("Das ");
    });
    it('Ein*e', () => {
        const result = beGone.entferneInitialForTesting("Ein*e ");
        expect(result).to.be.equal("Ein ");
    });

    it('ein europäische*n Wehrbeauftragte*n“ zu etablieren', () => {
        const result = beGone.entferneInitialForTesting("ein europäische*n Wehrbeauftragte*n“ zu etablieren");
        expect(result).to.be.equal("ein europäisches Wehrbeauftragty“ zu etablieren");
    });

    it('jede*n', () => {
        const result = beGone.entferneInitialForTesting("jede*n ");
        expect(result).to.be.equal("jedes ");
    });
});

 describe('entferne Doppelformen', () => {
     let beGone = new BeGone();
    it('Lehrer und Lehrerinnen -> Lehrys', () => {
        const result = beGone.entferneInitialForTesting("Lehrer und Lehrerinnen");
        expect(result).to.be.equal("Lehrys");
    });

    it('Bürgerinnen und Bürger -> Bürgys', () => {
        const result = beGone.entferneInitialForTesting("Bürgerinnen und Bürger");
        expect(result).to.be.equal("Bürgys");
    });

    it('Bürger und Bürgerinnen -> Bürgys', () => {
        const result = beGone.entferneInitialForTesting("Bürger und Bürgerinnen");
        expect(result).to.be.equal("Bürgys");
    });

    it('Bürger und Bürgerin -> Bürgys', () => {
        const result = beGone.entferneInitialForTesting("Bürger und Bürgerin");
        expect(result).to.be.equal("Bürgys");
    });

    it('die Bürgerin und der Bürger -> die Bürgys', () => {
        const result = beGone.entferneInitialForTesting("die Bürgerin und der Bürger");
        expect(result).to.be.equal("das Bürgy");
    });
    
    it('die Ärztin und der Arzt -> das Arzty', () => {
        const result = beGone.entferneInitialForTesting("die Ärztin und der Arzt");
        expect(result).to.be.equal("das Arzty");
    });

    it('der Arzt und die Ärztin -> das Arzty', () => {
        const result = beGone.entferneInitialForTesting("der Arzt und die Ärztin");
        expect(result).to.be.equal("die Arztys");
    });

    it('Bäuerinnen und Bauern -> Bauern', () => {
        const result = beGone.entferneInitialForTesting("Bäuerinnen und Bauern");
        expect(result).to.be.equal("Bauys");
    });

    it('Bürgervertreterinnen und -vertreter -> Bürgervertreter', () => {
        const result = beGone.entferneInitialForTesting("Bürgervertreterinnen und -vertreter");
        expect(result).to.be.equal("Bürgervertretys");
    });

    it('Könige und Königinnen -> Königy', () => {
        const result = beGone.entferneInitialForTesting("Könige und Königinnen");
        expect(result).to.be.equal("Königys");
    });

    it('Musikerinnen und Musiker -> Musikys', () => {
        const result = beGone.entferneInitialForTesting("Dazwischen kulturelle Projekte wie die ABC“, ebenfalls in Bremen, ein Treffpunkt für Musikerinnen und Musiker verschiedener Länder und Kulturen.");
        expect(result).to.be.equal("Dazwischen kulturelle Projekte wie die ABC“, ebenfalls in Bremen, ein Treffpunkt für Musikys verschiedener Länder und Kulturen.");
    });

    it('Heldinnen und Helden -> Heldys', () => {
        const result = beGone.entferneInitialForTesting("Fast jeder von uns kennt die wahren Heldinnen und Helden der Krise.");
        expect(result).to.be.equal("Fast jeder von uns kennt die wahren Heldys der Krise.");
    });

    it('Verkäuferinnen und Verkäufern -> Verkäufys', () => {
        const result = beGone.entferneInitialForTesting("den Verkäuferinnen und Verkäufern im Supermarkt, die hinter");
        expect(result).to.be.equal("den Verkäufys im Supermarkt, die hinter");
    });

    it('die Bürgerin und der Bürger -> dem Bürgy', () => {
        const result = beGone.entferneInitialForTesting("Dem Polizisten, der auf den Straßen für Sicherheit sorgt, der Bürgerin und dem Bürger, der hinter");
        expect(result).to.be.equal("Dem Polizisten, der auf den Straßen für Sicherheit sorgt, dem Bürgy, der hinter");
    });

    it('Ärztinnen und Ärzte -> Ärztys', () => {
        const result = beGone.entferneInitialForTesting("Ärztinnen und Ärzte genießen in der Regel ein hohes Ansehen.");
        expect(result).to.be.equal("Ärztys genießen in der Regel ein hohes Ansehen.");
    });

    it('Den Ärztinnen und Ärzte -> Den Ärztys', () => {
        const result = beGone.entferneInitialForTesting("Den Ärztinnen und Ärzten, die Tag und Nacht bereitstehen, um Leben zu retten.");
        expect(result).to.be.equal("Den Ärztys, die Tag und Nacht bereitstehen, um Leben zu retten.");
    });

     it('Landesverfassung Schleswig-Holstein', () => {
         const result = beGone.entferneInitialForTesting("Der Landtag wählt die Präsidentin oder den Präsidenten");
         expect(result).to.be.equal("Der Landtag wählt das Präsidenty");
     });

     it('Die Leserin oder der Leser -> Das Lesy', () => {
         const result = beGone.entferneInitialForTesting("Die Leserin oder der Leser");
         expect(result).to.be.equal("Das Lesy");
     });

     it('Sehr geehrte/r Leserin oder Leser -> Sehr geehrtes Lesy', () => {
         const result = beGone.entferneInitialForTesting("Sehr geehrte/r Leserin oder Leser");
         expect(result).to.be.equal("Sehr geehrtes Lesy");
     });

     it('Präsident -> Präsidenty', ()=> {
         const result = beGone.entferneInitialForTesting("auf Vorschlag der Präsidentin oder des Präsidenten");
         expect(result).to.be.equal("auf Vorschlag des Präsidenty");
     });

     it('Doppelform im Genitiv', () => {
         const result = beGone.entferneInitialForTesting("Position des Anwenders oder der Anwenderin");
         expect(result).to.be.equal("Position des Anwendys");
     });

     it('einer Ärztin oder eines Arztes', () => {
         const result = beGone.entferneInitialForTesting("einer Ärztin oder eines Arztes");
         expect(result).to.be.equal("eines Arztys");
     });

     it("konserviere antworten oder die Antwort überspringen", () => {
         const result = beGone.entferneInitialForTesting("\"stimme nicht zu\" antworten oder die Antworten überspringen. ");
         expect(result).to.be.equal("\"stimme nicht zu\" antworten oder die Antworten überspringen. ");
     });

     // noch keine Lösung vorhanden
     // it('zweier Fraktionen oder einer Fraktion -> nicht ersetzen', ()=> {
     //     const result = beGone.entferneInitialForTesting("Mitglieder des Landtages, zweier Fraktionen oder einer Fraktion gemeinsam mit den Abgeordneten");
     //     expect(result).to.be.equal("Mitglieder des Landtages, zweier Fraktionen oder einer Fraktion gemeinsam mit den Abgeordneten");
     // });
});

describe('entfernt Partizipien', () => {
    let beGone = new BeGone();
    it('Besserverdienenden -> Besserverdienys', () => {
        const result = beGone.entferneInitialForTesting("Gemeint waren dabei meist die Besserverdienenden.");
        expect(result).to.be.equal("Gemeint waren dabei meist die Besserverdienys.");
    });

    it('Lesenden -> Lesys', () => {
        const result = beGone.entferneInitialForTesting("ist zwar nett für die Lesenden");
        // besser als nichts
        expect(result).to.be.equal("ist zwar nett für die Lesys");
    });

    // voraus. Interessierte Nutzer können
    it('Interessierte Nutzer -> Interessierte Nutzer', () => {
        const result = beGone.entferneInitialForTesting("voraus. Interessierte Nutzer können");
        // besser als nichts
        expect(result).to.be.equal("voraus. Interessierte Nutzer können");
    });

    it('Studierende -> Studentys', () => {
        const result = beGone.entferneInitialForTesting("für Studierende");
        // besser als nichts
        expect(result).to.be.equal("für Studentys");
    });

    it('Teilnehmende -> Teilnehmys', () => {
        const result = beGone.entferneInitialForTesting("für Teilnehmende");
        // besser als nichts
        expect(result).to.be.equal("für Teilnehmys");
    });

    it('. Teilnehmende Frauen -> . Teilnehmende Frauen', () => {
        const result = beGone.entferneInitialForTesting(". Teilnehmende Frauen");
        // besser als nichts
        expect(result).to.be.equal(". Teilnehmende Frauen");
    });

    it('teilnehmende Kinder -> teilnehmende Kinder', () => {
        const result = beGone.entferneInitialForTesting("teilnehmende Kinder");
        // besser als nichts
        expect(result).to.be.equal("teilnehmende Kinder");
    });
});

describe('behandelt viele Whitespaces', () => {
    let beGone = new BeGone();
    it('Musikerinnen und Musiker -> Musikys', () => {
        const result = beGone.entferneInitialForTesting("Dazwischen kulturelle Projekte wie die ABC“, ebenfalls in Bremen, ein Treffpunkt für \fMusikerinnen und Musiker\f verschiedener Länder und Kulturen.");
        expect(result).to.be.equal("Dazwischen kulturelle Projekte wie die ABC“, ebenfalls in Bremen, ein Treffpunkt für \fMusikys\f verschiedener Länder und Kulturen.");
    });

    it('MusikerInnen -> Musikys', () => {
        const result = beGone.entferneInitialForTesting("Auch wenn man sich schätzt und freundlich grüßt: Prinzipiell hat man es in der freien Bremer Szene, bei den\fMusikerInnen\fwie den VeranstalterInnen, eher mit EinzelkämpferInnen zu tun.");
        expect(result).to.be.equal("Auch wenn man sich schätzt und freundlich grüßt: Prinzipiell hat man es in der freien Bremer Szene, bei den\fMusikys\fwie den Veranstaltys, eher mit Einzelkämpfys zu tun.");
    });

    it('Verkäuferinnen und Verkäufern -> Verkäufys', () => {
        const result = beGone.entferneInitialForTesting("Den Polizisten, die auf den Straßen für Sicherheit sorgen, den \fVerkäuferinnen und Verkäufern im Supermarkt\f, die hinter");
        expect(result).to.be.equal("Den Polizisten, die auf den Straßen für Sicherheit sorgen, den \fVerkäufys im Supermarkt\f, die hinter");
    });

    it('Geflüchtete', () => {
        const result = beGone.entferneInitialForTesting("Protest am Aktionstag für die \fGeflüchteten\f aus den griechischen Lagern ");
        expect(result).to.be.equal("Protest am Aktionstag für die \fFlüchtlys\f aus den griechischen Lagern ");
    });

    it('behält Zeilenumbrüche', () => {
        const result = beGone.entferneInitialForTesting(
        `
            abc\r
        def\r\n gih\n ;
        `);
        expect(result).to.be.equal(
            `
            abc\r
        def\r\n gih\n ;
        `);
    });


});

describe('ersetzt den Begriff Geflüchtete zu Flüchtly', () => {
    let beGone = new BeGone();

    // verschiedene Formulierungen angelehnt an aktuelle Medienberichte

    it('Geflüchtete', () => {
        const result = beGone.entferneInitialForTesting("Dem folgte am Mittwoch vor Weihnachten ein Beschluss, dass Hamburg Geflüchtete aufnehmen wolle dem Vernehmen nach 60 Kinder, außerdem sei das Land bereit, fünf Kinder aus dem nun gestarteten Bundesprogramm aufzunehmen.");
        expect(result).to.be.equal("Dem folgte am Mittwoch vor Weihnachten ein Beschluss, dass Hamburg Flüchtlys aufnehmen wolle dem Vernehmen nach 60 Kinder, außerdem sei das Land bereit, fünf Kinder aus dem nun gestarteten Bundesprogramm aufzunehmen.");
    });

    it('Geflüchtete, in Aufzählung', () => {
        const result = beGone.entferneInitialForTesting("Der Senat soll sein Handeln gegenüber Obdachlosen, Geflüchteten und Menschen ohne Papiere überdenken.");
        expect(result).to.be.equal("Der Senat soll sein Handeln gegenüber Obdachlosen, Flüchtlys und Menschen ohne Papiere überdenken.");
    });

    it('Geflüchtete, in Aufzählung mit "und"', () => {
        const result = beGone.entferneInitialForTesting("Der Senat soll sein Handeln gegenüber AutorInnen und Geflüchteten überdenken.");
        expect(result).to.be.equal("Der Senat soll sein Handeln gegenüber Autorys und Flüchtlys überdenken.");
    });

    it('Geflüchtete, in Aufzählung, mit Binnen-I-Wort', () => {
        const result = beGone.entferneInitialForTesting("Der Senat soll sein Handeln gegenüber AutorInnen, Geflüchteten und Menschen ohne Papiere überdenken.");
        expect(result).to.be.equal("Der Senat soll sein Handeln gegenüber Autorys, Flüchtlys und Menschen ohne Papiere überdenken.");
    });

    // it('Geflüchtete', () => {
    //     const result = beGone.entferneInitialForTesting("Es müsse der Aufenthalt von Flüchtlingen und Leuten ohne Papiere legalisiert werden.");
    //     expect(result).to.be.equal("Es müsse der Aufenthalt von Flüchtlys und Leuten ohne Papiere legalisiert werden.");
    // });

    it('Geflüchtete', () => {
        const result = beGone.entferneInitialForTesting("Das Bündnis hatte dazu aufgerufen, mit Plakaten auf Rädern durch die Straßen zu fahren, um gegen das Elend der Geflüchteten in Lagern zu demonstrieren.");
        expect(result).to.be.equal("Das Bündnis hatte dazu aufgerufen, mit Plakaten auf Rädern durch die Straßen zu fahren, um gegen das Elend der Flüchtlys in Lagern zu demonstrieren.");
    });

    it('Geflüchtete', () => {
        const result = beGone.entferneInitialForTesting("Protest am Aktionstag für die Geflüchteten aus den griechischen Lagern");
        expect(result).to.be.equal("Protest am Aktionstag für die Flüchtlys aus den griechischen Lagern");
    });

    it('Geflüchtete', () => {
        const result = beGone.entferneInitialForTesting("Bei der Räumung sollen mehrere Geflüchtete versucht haben");
        expect(result).to.be.equal("Bei der Räumung sollen mehrere Flüchtlys versucht haben");
    });

    it('Geflüchtete (Nominativ Singular)', () => {
        const result = beGone.entferneInitialForTesting("Der Geflüchtete muss in diesem Fall selbst die Verantwortung übernehmen.");
        expect(result).to.be.equal("Das Flüchtly muss in diesem Fall selbst die Verantwortung übernehmen.");
    });

    it('Geflüchtete (Dativ Plural)', () => {
        const result = beGone.entferneInitialForTesting("Das derzeitige Mühen um das Wohl Anderer endet bei den Geflüchteten in Sammelunterkünften.");
        expect(result).to.be.equal("Das derzeitige Mühen um das Wohl Anderer endet bei den Flüchtlys in Sammelunterkünften.");
    });

    it('Geflüchtete (Dativ Plural II)', () => {
        const result = beGone.entferneInitialForTesting("Inwiefern beeinflusst die Sprache, wie wir den Geflüchteten begegnen?");
        expect(result).to.be.equal("Inwiefern beeinflusst die Sprache, wie wir den Flüchtlys begegnen?");
    });

    it('„Geflüchtete“ mit soft hyphen und Anführungszeichen', () => {
        const result = beGone.entferneInitialForTesting("Mehr und mehr Engagierte verwenden den Begriff „Geflüch­te­te“.");
        expect(result).to.be.equal("Mehr und mehr Engagierte verwenden den Begriff „Flüchtlys“.");
    });

    it('Geflüchtete als Adjektiv', () => {
        const result = beGone.entferneInitialForTesting("Geflüchtete Menschen beschäftigen");
        expect(result).to.be.equal("Geflüchtete Menschen beschäftigen");
    });

    it('geflüchtete Kinder', () => {
        const result = beGone.entferneInitialForTesting("geflüchtete Kinder");
        expect(result).to.be.equal("geflohene Kinder");
    });

    it('geflüchteten Kinder', () => {
        const result = beGone.entferneInitialForTesting("kommenden geflüchteten Kinder aus");
        expect(result).to.be.equal("kommenden geflohenen Kinder aus");
    });

    it('Geflüchtetenlager', () => {
        const result = beGone.entferneInitialForTesting("Geflüchtetenlager");
        expect(result).to.be.equal("Flüchtlyslager");
    });
});


describe('Empfehlungen Uni Hamburg werden korrigiert', () => {
    let beGone = new BeGone();

    // Quelle: https://www.uni-hamburg.de/gleichstellung/download/empfehlungen-zu-inklusiven-anredeformen-2019-05.pdf

    it('Interessierte -> Interessentys', () => {
        const result = beGone.entferneInitialForTesting("Sehr geehrte Interessierte");
        expect(result).to.be.equal("Sehr geehrte Interessentys");
    });

    it('Studierende -> Studendys', () => {
        const result = beGone.entferneInitialForTesting("Sehr geehrte Studierende");
        expect(result).to.be.equal("Sehr geehrte Studentys");
    });

    it('Empfänger*innen -> Empfängys', () => {
        const result = beGone.entferneInitialForTesting("Sehr geehrte Empfänger*innen des Newsletters XY");
        expect(result).to.be.equal("Sehr geehrte Empfängys des Newsletters XY");
    });

    it('Mitarbeitende -> Mitarbeitys', () => {
        const result = beGone.entferneInitialForTesting("Liebe Mitarbeitende");
        expect(result).to.be.equal("Liebe Mitarbeitys");
    });

    it('Teilnehmende -> Teilnehmys', () => {
        const result = beGone.entferneInitialForTesting("Sehr geehrte Teilnehmende");
        expect(result).to.be.equal("Sehr geehrte Teilnehmys");
    });

    it('Student*in', () => {
        const result = beGone.entferneInitialForTesting("Student*in ");
        expect(result).to.be.equal("Studenty ");
    });

    it('Doktor*in', () => {
        const result = beGone.entferneInitialForTesting("Doktor*in ");
        expect(result).to.be.equal("Doktory ");
    });
});


describe('TODO oder nicht ohne weiteres lösbar', () => {
    let beGone = new BeGone();

});

/** 
 * Sammlung:
 * 
 * wenn 1 sich
 * 
 * 
 * 
*/
