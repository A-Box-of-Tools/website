import catalogue from '../generated/catalogue.json';
import viewHtml from '../generated/app-resource.mjs';
import { prepareCatalogueSchemas } from './server.mjs';
import { createWorker } from './worker.mjs';

// Validate and prepare the immutable build artifact during Worker startup,
// before the first request's CPU budget begins.
prepareCatalogueSchemas(catalogue);

let service;
export default {
  fetch(request, env) {
    service ??= createWorker({ catalogue, viewHtml,
      allowedHosts: JSON.parse(env.ALLOWED_HOSTS),
      allowedOrigins: JSON.parse(env.ALLOWED_ORIGINS) });
    return service.fetch(request, env);
  }
};
