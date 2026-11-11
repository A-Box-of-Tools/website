import page from './form.html';
import { createFeedbackHandler } from './handler.js';

export { FeedbackGate } from './gate.js';

export default { fetch: createFeedbackHandler(page) };
