const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
};

const API_BASE_URL = (process.env.REACT_APP_API_BASE_URL || '').replace(/\/+$/, '');

function buildUrl(path) {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  if (!API_BASE_URL) {
    return path;
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
}

async function request(path, options = {}) {
  const response = await fetch(buildUrl(path), {
    ...options,
    headers: {
      ...DEFAULT_HEADERS,
      ...(options.headers || {}),
    },
  });

  const text = await response.text();
  let payload;

  try {
    payload = text ? JSON.parse(text) : null;
  } catch (error) {
    payload = text;
  }

  if (!response.ok) {
    const message =
      (payload && payload.message) ||
      (payload && payload.detail) ||
      (payload && payload.error) ||
      (typeof payload === 'string' ? payload : 'Request failed');
    throw new Error(message);
  }

  return payload;
}

export const httpClient = {
  get(path, headers = {}) {
    return request(path, { method: 'GET', headers });
  },
  post(path, body, headers = {}) {
    return request(path, { method: 'POST', body: JSON.stringify(body), headers });
  },
  put(path, body, headers = {}) {
    return request(path, { method: 'PUT', body: JSON.stringify(body), headers });
  },
  delete(path, headers = {}) {
    return request(path, { method: 'DELETE', headers });
  },
};
