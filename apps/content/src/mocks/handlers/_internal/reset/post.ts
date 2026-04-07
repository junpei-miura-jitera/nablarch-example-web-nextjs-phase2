import { HttpResponse, http } from 'msw'
import { store } from '../../_services/mock-state'

export const mockResetPostHandler = http.post('/__mock/reset', () => {
  store.reset()
  return HttpResponse.json({ ok: true })
})
