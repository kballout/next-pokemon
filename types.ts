export type PokemonType = {
    name: string;
    path: string;
};

export enum STATUS {
    "PENDING",
    "RIGHT",
    "WRONG",
}

export type Option = {
    name: string;
    status: STATUS;
};