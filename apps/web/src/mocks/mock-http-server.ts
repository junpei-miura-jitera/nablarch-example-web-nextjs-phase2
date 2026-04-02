import { createServer } from '@mswjs/http-middleware'
import { mockHandlers } from './mock-handlers'

const PORT = Number(process.env.MOCK_SERVER_PORT ?? 9090)
const app = createServer(...mockHandlers)

app.listen(PORT, () => {
  console.log(`Mock server running on http://localhost:${PORT}`)
})
