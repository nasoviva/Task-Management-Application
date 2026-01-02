import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  // Explicitly set the workspace root to prevent Next.js from inferring the wrong directory
  // when multiple lockfiles are detected in parent directories
  experimental: {
    turbo: {
      root: __dirname,
    },
  },
}

export default nextConfig