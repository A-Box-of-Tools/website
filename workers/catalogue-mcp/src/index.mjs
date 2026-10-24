import catalogue from '../generated/catalogue.json';
import viewHtml from '../generated/app-resource.mjs';
import { createWorker } from './worker.mjs';

let service;
export default {
  fetch(request, env) {
    service ??= createWorker({ catalogue, viewHtml,
      allowedHosts: JSON.parse(env.ALLOWED_HOSTS),
      allowedOrigins: JSON.parse(env.ALLOWED_ORIGINS) });
    return service.fetch(request, env);
  }
};
