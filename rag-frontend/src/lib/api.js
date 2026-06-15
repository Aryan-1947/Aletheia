import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 120000,
})

export const askQuestion = (payload, userId) =>
  api.post('/v1/ask', { ...payload, user_id: userId || 'default' }).then(r => r.data)

export const getDocuments = (userId) =>
  api.get(`/v1/documents?user_id=${userId || 'default'}`).then(r => r.data)

export const getStats = (userId) =>
  api.get(`/v1/stats?user_id=${userId || 'default'}`).then(r => r.data)

export const uploadDocument = (file, userId) => {
  const form = new FormData()
  form.append('file', file)
  form.append('user_id', userId || 'default')
  return api.post('/v1/upload', form).then(r => r.data)
}

export const ingestDocuments = (strategy = 'recursive', userId) =>
  api.post('/v1/ingest', { strategy, user_id: userId || 'default' }).then(r => r.data)

export const getHealth = () =>
  api.get('/v1/health').then(r => r.data)