import api from './axiosInstance'

export const loginUser = ({ email, password }) =>
  api.post('/api/auth/login', { email, password })

export const registerUser = ({ email, password }) =>
  api.post('/api/auth/register', { email, password })
