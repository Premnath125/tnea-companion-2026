// Validation helper for immediate bilingual error rendering

export function createError(key, params = {}) {
  return { key, params };
}

export function formatError(errorObj, t) {
  if (!errorObj) return null;
  if (typeof errorObj === "string") return errorObj;
  return t(errorObj.key, errorObj.params || {});
}
