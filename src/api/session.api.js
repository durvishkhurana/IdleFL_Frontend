import api from './axiosInstance'

export const createSession = () =>
  api.post('/api/sessions')

export const joinSession = (sessionId) =>
  api.post('/api/sessions/join', { sessionId })

export const getSession = (sessionId) =>
  api.get(`/api/sessions/${sessionId}`)

export const getDownloadScript = (os) =>
  api.get(`/api/agent/script?os=${os}`, { responseType: 'blob' })
