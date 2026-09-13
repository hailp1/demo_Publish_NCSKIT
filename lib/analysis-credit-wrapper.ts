// Demo stub — credit wrapper is a no-op; always runs the analysis

interface RunWithCreditsOptions {
    user?: any;
    analysisKey?: string;
    costKey?: string;
    logDesc?: string;
    onInsufficientCredits?: (cost: number) => void;
    onSuccess?: (newBalance: number) => void;
    [key: string]: any;
}

export async function runWithCredits(
    action: () => Promise<any>,
    _options?: RunWithCreditsOptions
): Promise<any> {
    return action();
}
