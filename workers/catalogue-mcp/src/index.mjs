import { env } from 'cloudflare:workers';
import catalogue from '../generated/catalogue.json';
import viewHtml from '../generated/app-resource.mjs';
import { prepareCatalogueSchemas } from './server.mjs';
import { createWorker } from './worker.mjs';

// Validate and prepare the immutable build artifact during Worker startup,
// before the first request's CPU budget begins.
prepareCatalogueSchemas(catalogue);

// The SDK handler owns only reusable routing state here. Its actual servers
// and transports are still created separately for each request.
const service = createWorker({ catalogue, viewHtml,
  allowedHosts: JSON.parse(env.ALLOWED_HOSTS),
  allowedOrigins: JSON.parse(env.ALLOWED_ORIGINS), requireRateLimiter: true });
export default {
  fetch(request, env) {
    return service.fetch(request, env);
  }
};
