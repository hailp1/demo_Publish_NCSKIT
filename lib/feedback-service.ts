// Demo stub
export type AIFeedbackData = Record<string, any>;
export type ApplicabilityData = Record<string, any>;
export type DemographicData = Record<string, any>;

export const FeedbackService = {
    hasCompletedDemographics: () => true,
    hasGivenAIFeedback: (_type?: string) => true,
    saveDemographics: async (_data?: DemographicData) => {},
    saveApplicability: async (_data?: ApplicabilityData) => {},
    saveAIFeedback: async (_analysisTypeOrData?: string | AIFeedbackData, _data?: AIFeedbackData) => {},
};
