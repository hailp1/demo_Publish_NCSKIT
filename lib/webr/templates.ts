/**
 * R code template provider — Demo version.
 * No database lookup; always returns the default (hardcoded) R template.
 */
export async function getAnalysisRTemplate(analysisKey: string, defaultCode: string): Promise<string> {
    return defaultCode;
}
