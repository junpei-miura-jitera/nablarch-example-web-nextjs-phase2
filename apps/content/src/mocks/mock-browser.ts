import { setupWorker } from 'msw/browser'
import { mockHandlers } from './mock-handlers'

export const mockWorker = setupWorker(...mockHandlers)
