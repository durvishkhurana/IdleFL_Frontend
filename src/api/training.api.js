import api from './axiosInstance'

export const startTraining = ({ sessionId, modelType, config, datasetMeta }) => {
  return api.post('/api/training/start', {
    sessionId,
    modelType,
    learningRate: config.learningRate,
    numRounds: config.numRounds,
    batchSize: config.batchSize,
    ...(config.mu != null && { mu: config.mu }),
    ...(datasetMeta || {}),
  })
}

export const getResults = (jobId) =>
  api.get(`/api/training/${jobId}/results`)

export const downloadModel = (jobId) =>
  api.get(`/api/training/${jobId}/model`, { responseType: 'blob' })
