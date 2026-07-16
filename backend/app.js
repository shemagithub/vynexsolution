/**
 * Application startup — no top-level await (required for cPanel LiteSpeed lsnode).
 * cPanel: Setup Node.js App → startup file: server.cjs
 */
import app from './src/app.js';
import { bootstrap } from './src/bootstrap.js';
import { config } from './src/config.js';

function start() {
  bootstrap()
    .then(() => {
      const host = process.env.HOST || '0.0.0.0';
      const port = Number(process.env.PORT) || config.port;

      const server = app.listen(port, host, () => {
        console.log(`EMBEDIXe backend listening on ${host}:${port}`);
        console.log(`Environment: ${config.nodeEnv}`);
      });

      server.on('error', err => {
        console.error('Failed to start server:', err.message);
        process.exit(1);
      });
    })
    .catch(err => {
      console.error('Bootstrap failed:', err.message || err);
      process.exit(1);
    });
}

start();

export default app;
