import api from './axiosInstance'

export const uploadDataset = (formData) =>
  api.post('/api/training/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

export const startTraining = ({ sessionId, modelType, config }) =>
  api.post('/api/training/start', { sessionId, modelType, config })

export const getResults = (jobId) =>
  api.get(`/api/training/results/${jobId}`)

export const downloadModel = (jobId) =>
  api.get(`/api/training/${jobId}/model`, { responseType: 'blob' })
