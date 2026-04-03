import type { NextConfig } from 'next'
import { API_BASE_URL } from './src/bases/env.server'

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${API_BASE_URL}/api/:path*`,
      },
    ]
  },
}

export default nextConfig
