import {atom} from "jotai"

export const WalletAddress = atom<string | null>(null);
export const BalanceAtom = atom<number | null>(null);