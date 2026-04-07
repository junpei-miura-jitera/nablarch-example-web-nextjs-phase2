import { setupServer } from 'msw/node'
import { mockHandlers } from './mock-handlers'

export const mockServer = setupServer(...mockHandlers)
