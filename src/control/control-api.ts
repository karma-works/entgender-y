
export type FilterType = "Bei Bedarf" | "Whitelist" | "Blacklist";
export interface BeGoneSettings {
    aktiv?: boolean;
    doppelformen?: boolean;
    skip_topic?: boolean;
    partizip?: boolean;
    whitelist?: string;
    blacklist?: string;
    counter?: boolean;
    filterliste?: FilterType;
}

export interface Settings extends BeGoneSettings {
    // TODO: wieso wird das nur in options benutzt?
    invertiert: boolean,
}

export interface CountRequest  {
    type: "count";
    countBinnenIreplacements: number;
    countDoppelformreplacements: number;
    countPartizipreplacements: number;
}
export interface NeedOptionsRequest {
    action: "needOptions";
}

// TODO: sent by gendersprachekorrigieerne, but not processed in backend
export interface ErrorRequest {
    action: "error";
    page: string,
    source: string,
    error: any,
}

export type Request = CountRequest & NeedOptionsRequest