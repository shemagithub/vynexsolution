/**
 * cPanel LiteSpeed Node.js entry point.
 * lsnode.js uses require() — this CJS wrapper loads the ESM app via import().
 *
 * In cPanel → Setup Node.js App → Application startup file: server.cjs
 */
import('./app.js').catch(err => {
  console.error('Failed to start application:', err);
  process.exit(1);
});
