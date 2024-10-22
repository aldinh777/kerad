import { startServer } from './lib/server.ts';
import { hotBundling, hotReloading } from './lib/bundler';

startServer();
hotBundling();
hotReloading();
