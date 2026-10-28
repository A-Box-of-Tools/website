import page from './form.html';
import { createFeedbackHandler } from './handler.js';

export default { fetch: createFeedbackHandler(page) };
