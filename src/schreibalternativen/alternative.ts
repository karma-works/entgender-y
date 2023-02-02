export interface SchreibAlternative {
    replacementsBinnen: number;
    replacementsDoppel: number;
    replacementsPartizip: number;
    artikelUndKontraktionen: (s: string) => string;
    entferneBinnenIs: (s: string) => string;
    entferneDoppelformen: (s: string) => string;
    entfernePartizip: (s: string) => string;
    ersetzeGefluechteteDurchFluechtlinge: (s: string) => (string);
}