import { createServer } from 'vite';

async function start() {
  const server = await createServer({
    server: {
      host: '0.0.0.0',
      port: 5173,
    },
  });
  await server.listen();
  server.printUrls();
}

start();
