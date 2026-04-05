import api from './axiosInstance'

export const createSession = () =>
  api.post('/api/sessions')

export const joinSession = (sessionCode) =>
  api.post('/api/sessions/join', { sessionCode })

export const getSession = (sessionId) =>
  api.get(`/api/sessions/${sessionId}`)

export const getDownloadScript = (os) =>
  api.get(`/api/agent/script?os=${os}`, { responseType: 'blob' })
