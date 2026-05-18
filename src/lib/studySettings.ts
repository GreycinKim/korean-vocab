export interface StudySettings {
  newCardsPerDay: number;
  reviewsPerDay: number;
  learningSteps: number[];
  relearningSteps: number[];
  graduatingInterval: number;
  easyInterval: number;
  showPronunciation: boolean;
}

export const DEFAULT_STUDY_SETTINGS: StudySettings = {
  newCardsPerDay: 20,
  reviewsPerDay: 200,
  learningSteps: [1, 10],
  relearningSteps: [10],
  graduatingInterval: 1,
  easyInterval: 4,
  showPronunciation: true,
};
