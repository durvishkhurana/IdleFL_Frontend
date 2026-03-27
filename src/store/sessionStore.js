import { create } from 'zustand'

const useSessionStore = create((set, get) => ({
  sessionId: null,
  sessionStatus: 'idle', // idle | active | training | complete
  connectedDevices: [],
  currentRound: 0,
  totalRounds: 10,

  setSession: (sessionId, status = 'active') =>
    set({ sessionId, sessionStatus: status }),

  addDevice: (device) =>
    set((state) => ({
      connectedDevices: [
        ...state.connectedDevices.filter((d) => d.deviceId !== device.deviceId),
        device,
      ],
    })),

  updateDevice: (deviceId, updates) =>
    set((state) => ({
      connectedDevices: state.connectedDevices.map((d) =>
        d.deviceId === deviceId ? { ...d, ...updates } : d
      ),
    })),

  removeDevice: (deviceId) =>
    set((state) => ({
      connectedDevices: state.connectedDevices.map((d) =>
        d.deviceId === deviceId ? { ...d, status: 'dropped' } : d
      ),
    })),

  updateTrainingProgress: (currentRound, totalRounds) =>
    set({ currentRound, totalRounds }),

  clearSession: () =>
    set({
      sessionId: null,
      sessionStatus: 'idle',
      connectedDevices: [],
      currentRound: 0,
      totalRounds: 10,
    }),
}))

export default useSessionStore
