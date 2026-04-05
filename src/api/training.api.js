import api from './axiosInstance'

export const startTraining = ({ sessionId, modelType, config, datasetFile }) => {
  const formData = new FormData()
  formData.append('sessionId', sessionId)
  formData.append('modelType', modelType)
  if (config.learningRate != null) formData.append('learningRate', String(config.learningRate))
  if (config.numRounds != null) formData.append('numRounds', String(config.numRounds))
  if (config.batchSize != null) formData.append('batchSize', String(config.batchSize))
  if (datasetFile) formData.append('dataset', datasetFile)
  return api.post('/api/training/start', formData)
}

export const getResults = (jobId) =>
  api.get(`/api/training/${jobId}/results`)

export const downloadModel = (jobId) =>
  api.get(`/api/training/${jobId}/model`, { responseType: 'blob' })
