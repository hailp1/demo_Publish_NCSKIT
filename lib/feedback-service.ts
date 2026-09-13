// Demo stub
export type AIFeedbackData = Record<string, any>;
export type ApplicabilityData = Record<string, any>;
export type DemographicData = Record<string, any>;

export const FeedbackService = {
    hasCompletedDemographics: () => true,
    // 0-arg form (AIInterpretationFeedback) and 1-arg form both supported
    hasGivenAIFeedback: (_type?: string) => true,
    saveDemographics: async (_data?: DemographicData) => {},
    saveApplicability: async (_data?: ApplicabilityData) => {},
    // Accepts either (analysisType: string, data?) or (data: object) forms
    saveAIFeedback: async (_analysisTypeOrData?: string | AIFeedbackData, _data?: AIFeedbackData) => {},
};
