const Anthropic = require('@anthropic-ai/sdk').default;
const ApiError = require('../utils/ApiError');

const MODEL = 'claude-opus-5-5';

// Created lazily so the server still boots (and non-AI routes work) without a key
let client;
const getClient = () => {
  if (!process.env.ANTHROPIC_API_KEY) throw new ApiError(503, 'AI features are not configured on this server');
  if (!client) client = new Anthropic({ timeout: 60_000 });
  return client;
};

// Translate SDK errors into the API's own error shape (most specific first)
function toApiError(err) {
  if (err instanceof ApiError) return err;
  if (err instanceof Anthropic.RateLimitError) return new ApiError(429, 'AI is busy right now, please try again in a moment');
  if (err instanceof Anthropic.AuthenticationError || err instanceof Anthropic.PermissionDeniedError) {
    console.error('[ai] Anthropic credentials rejected - check ANTHROPIC_API_KEY');
    return new ApiError(503, 'AI features are temporarily unavailable');
  }
  if (err instanceof Anthropic.BadRequestError) {
    console.error('[ai] bad request:', err.message);
    return new ApiError(502, 'AI request failed');
  }
  if (err instanceof Anthropic.APIConnectionError) return new ApiError(503, 'Could not reach the AI service');
  if (err instanceof Anthropic.APIError) {
    console.error(`[ai] API error ${err.status}:`, err.message);
    return new ApiError(502, 'AI request failed');
  }
  return err;
}

/**
 * One-shot generation. Returns plain text, or parsed JSON when `schema` is given
 * (structured outputs guarantee the response matches the schema).
 */
async function generate({ system, prompt, schema, maxTokens = 4000, effort = 'medium' }) {
  let response;
  try {
    response = await getClient().beta.messages.create({
      model: MODEL,
      max_tokens: maxTokens,
      // On a safety decline the API transparently re-runs on a fallback model
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      output_config: { effort, ...(schema ? { format: { type: 'json_schema', schema } } : {}) },
      system,
      messages: [{ role: 'user', content: prompt }],
    });
  } catch (err) {
    throw toApiError(err);
  }

  if (response.stop_reason === 'refusal') throw ApiError.badRequest('AI could not help with this request');
  if (response.stop_reason === 'max_tokens') throw new ApiError(502, 'AI response was cut off, please try again');

  const text = response.content
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('')
    .trim();

  if (process.env.NODE_ENV !== 'production') {
    const u = response.usage;
    console.log(`[ai] ${response.model} in=${u.input_tokens} out=${u.output_tokens}`);
  }

  return schema ? JSON.parse(text) : text;
}

module.exports = { generate, MODEL };
