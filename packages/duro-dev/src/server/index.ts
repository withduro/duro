// packages/duro-dev/src/server.ts

import { createServer } from 'vite'
import { DuroPlugin } from '../vite-plugin-duro.js'

export async function startDevServer() {
  const server = await createServer({
    root: process.cwd(),
    plugins: [DuroPlugin()],
    server: {
      port: 3000
    }
  })

  await server.listen()
  server.printUrls()
}
