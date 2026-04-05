import { create } from 'zustand'

const useJobStore = create((set) => ({
  jobId: null,
  modelType: null,
  status: 'idle', // idle | training | complete | error
  lossHistory: [],
  accuracyHistory: [],
  roundsCompleted: 0,
  totalRounds: 10,
  estimatedTimeRemaining: null,
  deviceContributions: [],
  startedAt: null,
  completedAt: null,
  finalAccuracy: null,

  startJob: (jobId, modelType, totalRounds = 10) =>
    set({
      jobId,
      modelType,
      status: 'training',
      lossHistory: [],
      accuracyHistory: [],
      roundsCompleted: 0,
      totalRounds,
      startedAt: Date.now(),
      completedAt: null,
      finalAccuracy: null,
    }),

  updateRound: ({ round, loss, accuracy, deviceContributions, estimatedTimeRemaining }) =>
    set((state) => ({
      roundsCompleted: round,
      lossHistory: [...state.lossHistory, loss],
      accuracyHistory: [...state.accuracyHistory, accuracy],
      deviceContributions: deviceContributions || state.deviceContributions,
      estimatedTimeRemaining: estimatedTimeRemaining ?? state.estimatedTimeRemaining,
    })),

  completeJob: (finalAccuracy) =>
    set((state) => ({
      status: 'complete',
      completedAt: Date.now(),
      finalAccuracy: finalAccuracy ?? state.accuracyHistory[state.accuracyHistory.length - 1],
    })),

  setJobStatus: (status) => set({ status }),

  resetJob: () =>
    set({
      jobId: null,
      modelType: null,
      status: 'idle',
      lossHistory: [],
      accuracyHistory: [],
      roundsCompleted: 0,
      totalRounds: 10,
      estimatedTimeRemaining: null,
      deviceContributions: [],
      startedAt: null,
      completedAt: null,
      finalAccuracy: null,
    }),
}))

export default useJobStore
