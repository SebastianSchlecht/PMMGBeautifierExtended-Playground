import {string, number, object, Output, literal} from "valibot";

export type Contract = PlayerContract | FactionContract;

export type PlayerContract = Output<typeof PlayerContractSchema>;
export type FactionContract = Output<typeof FactionContractSchema>;

export const PlayerContractSchema = object({
    type: literal("PC"),
    id: string(),
    localId: string(),
    partner: string(),
    partnerCode: string(),
    deadline: number(),
})

export const FactionContractSchema = object({
    type: literal("FC"),
    id: string(),
    localId: string(),
    partner: string(),
    deadline: number(),
})
