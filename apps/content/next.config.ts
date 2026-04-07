import type { NextConfig } from 'next'
import { API_BASE_URL } from './src/bases/env.server'

const nextConfig: NextConfig = {
  // NOTE:
  // Java との視覚比較時に Next.js の開発インジケータが差分として乗るため無効化している。
  // 本番 UI の忠実度ではなく、比較基盤を安定させるための設定。
  devIndicators: false,
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
