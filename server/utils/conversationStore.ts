import { GoogleAuth } from 'google-auth-library';

const identity = new GoogleAuth({ scopes: ['https://www.googleapis.com/auth/datastore'] });
type Fields = Record<string, any>;
export function encodeFields(data: Fields): Fields {
  return Object.fromEntries(Object.entries(data).map(([key, value]) => [key,
    typeof value === 'boolean' ? { booleanValue: value } : typeof value === 'number'
      ? { integerValue: String(value) } : { stringValue: String(value) }]));
}
function decode(fields: Fields = {}): Fields {
  return Object.fromEntries(Object.entries(fields).map(([k, v]) => [k,
    v.stringValue ?? v.timestampValue ?? v.booleanValue ?? (v.integerValue === undefined ? null : Number(v.integerValue))]));
}
export function conversationStore(project: string, database: string) {
  const emulator = process.env.FIRESTORE_EMULATOR_HOST;
  if (emulator && process.env.NODE_ENV === 'production') throw new Error('Emulator forbidden in production');
  const root = `projects/${project}/databases/${database}/documents`;
  const base = `${emulator ? 'http://' + emulator : 'https://firestore.googleapis.com'}/v1/${root}`;
  async function request(suffix: string, init: RequestInit = {}) {
    const token = emulator ? 'owner' : await identity.getAccessToken();
    if (!token) throw new Error('Server identity unavailable');
    return fetch(base + suffix, { ...init, headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, signal: AbortSignal.timeout(10000) });
  }
  async function get(path: string): Promise<(Fields & { id: string }) | null> {
    const response = await request('/' + path);
    if (response.status === 404) return null;
    if (!response.ok) throw new Error('Conversation storage unavailable');
    const document = await response.json();
    return { ...decode(document.fields), id: document.name.split('/').pop() };
  }
  async function list(path: string, pageToken = '') {
    const segments = path.split('/');
    const collectionId = segments.pop()!;
    const orderField = path === 'conversations' ? 'updatedAt' : 'createdAt';
    const parent = segments.length ? '/' + segments.join('/') : '';
    let cursor: { createdAt: string; id: string } | null = null;
    if (pageToken) {
      cursor = JSON.parse(Buffer.from(pageToken, 'base64url').toString('utf8'));
      if (!cursor || !/^[-A-Za-z0-9_]{1,128}$/.test(cursor.id) || !Number.isFinite(Date.parse(cursor.createdAt))) throw new Error('Invalid cursor');
    }
    const structuredQuery = {
      from: [{ collectionId }], limit: 51,
      orderBy: [{ field: { fieldPath: orderField }, direction: 'DESCENDING' }, { field: { fieldPath: '__name__' }, direction: 'DESCENDING' }],
      ...(cursor ? { startAt: { before: false, values: [{ timestampValue: cursor.createdAt }, { referenceValue: root + '/' + path + '/' + cursor.id }] } } : {}),
    };
    const response = await request(parent + ':runQuery', { method: 'POST', body: JSON.stringify({ structuredQuery }) });
    if (!response.ok) throw new Error('Conversation storage unavailable');
    const data = await response.json();
    const documents = data.filter((row: any) => row.document).map((row: any) => row.document);
    const items = documents.slice(0, 50).map((d: any) => ({ ...decode(d.fields), id: d.name.split('/').pop() }));
    const last = items[items.length - 1];
    return { items, nextPageToken: documents.length > 50 ? Buffer.from(JSON.stringify({ createdAt: last[orderField], id: last.id })).toString('base64url') : '' };
  }
  async function commit(writes: unknown[]) {
    const response = await request(':commit', { method: 'POST', body: JSON.stringify({ writes }) });
    if (!response.ok) throw Object.assign(new Error('Conversation write failed'), { status: response.status });
  }
  return { get, list, commit, root };
}
