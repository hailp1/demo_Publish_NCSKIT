// Demo stub — no credits in open demo
export async function getAnalysisCost(_: string): Promise<number> { return 0; }
export async function getAnalysisCosts(): Promise<Record<string,number>> { return {}; }
export async function checkBalance(_userId: string, _cost: number) { return { hasEnough: true, balance: 999999 }; }
export async function deductCreditsAtomic(_userId: string, _cost: number, _desc: string) {
    return { success: true, isExempt: true, newBalance: 999999, error: null };
}
export async function getDefaultBalance(): Promise<number> { return 999999; }
export const ANALYSIS_TYPES: Record<string, string> = {};
