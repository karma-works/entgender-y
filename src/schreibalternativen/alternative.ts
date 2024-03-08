export interface SchreibAlternative {
    replacementsBinnen: number;
    replacementsDoppel: number;
    replacementsPartizip: number;
    artikelUndKontraktionen: (s: string) => string;
    entferneBinnenIs: (s: string) => string;
    entferneDoppelformen: (s: string) => string;
    entfernePartizip: (s: string) => string;
    ersetzeGefluechteteDurchFluechtlinge: (s: string) => (string);
    // Ziel potenziell irgendwann auch das normale Maskulinum zu ersetzen in der bevorzugten Schreibweise.
    ersetzeMaskulinum?: (s: string) => (string);
}