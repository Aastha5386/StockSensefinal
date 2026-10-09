const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Token Storage Helpers
export const getToken = (): string | null => localStorage.getItem('stocksense_jwt_token');
export const setToken = (token: string): void => localStorage.setItem('stocksense_jwt_token', token);
export const removeToken = (): void => localStorage.removeItem('stocksense_jwt_token');

// Generic Fetch Wrapper
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const token = getToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }

  return data;
}

// ==================== AUTH API ====================
export const apiAuth = {
  login: (companyEmailOrId: string, password?: string) =>
    request<{ success: boolean; token?: string; user?: any; message?: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ companyEmailOrId, email: companyEmailOrId, password }),
    }),

  register: (payload: {
    companyName: string;
    companyEmailOrId: string;
    password?: string;
    confirmPassword?: string;
    role?: string;
    fullName?: string;
    email?: string;
  }) =>
    request<{ success: boolean; message: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getMe: () => request<{ success: boolean; user: any }>('/auth/me'),

  updateProfile: (profile: { name?: string; avatarUrl?: string; station?: string; dept?: string }) =>
    request<{ success: boolean; user: any }>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profile),
    }),

  getUsers: () => request<{ success: boolean; users: any[] }>('/auth/users'),

  updateUserRole: (id: string, role: string) =>
    request<{ success: boolean; user: any }>(`/auth/users/${id}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    }),

  deleteUser: (id: string) =>
    request<{ success: boolean; message: string }>(`/auth/users/${id}`, {
      method: 'DELETE',
    }),
};

// ==================== PRODUCTS API ====================
export const apiProducts = {
  getAll: (query?: { category?: string; search?: string; lowStock?: boolean }) => {
    const params = new URLSearchParams();
    if (query?.category && query.category !== 'ALL') params.set('category', query.category);
    if (query?.search) params.set('search', query.search);
    if (query?.lowStock) params.set('lowStock', 'true');
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return request<{ success: boolean; products: any[] }>(`/products${queryString}`);
  },

  getOne: (sku: string) => request<{ success: boolean; product: any }>(`/products/${encodeURIComponent(sku)}`),

  lookup: (code: string) => request<{ success: boolean; product: any }>(`/products/lookup/${encodeURIComponent(code)}`),

  create: (product: any) =>
    request<{ success: boolean; product: any }>('/products', {
      method: 'POST',
      body: JSON.stringify(product),
    }),

  update: (sku: string, product: any) =>
    request<{ success: boolean; product: any }>(`/products/${encodeURIComponent(sku)}`, {
      method: 'PUT',
      body: JSON.stringify(product),
    }),

  delete: (sku: string) =>
    request<{ success: boolean; message: string }>(`/products/${encodeURIComponent(sku)}`, {
      method: 'DELETE',
    }),
};

// ==================== RECEIPTS / PURCHASE ORDERS API ====================
export const apiReceipts = {
  getAll: () => request<{ success: boolean; receipts: any[] }>('/receipts'),

  getOne: (id: string) => request<{ success: boolean; receipt: any }>(`/receipts/${encodeURIComponent(id)}`),

  create: (receipt: any) =>
    request<{ success: boolean; receipt: any }>('/receipts', {
      method: 'POST',
      body: JSON.stringify(receipt),
    }),

  update: (id: string, receipt: any) =>
    request<{ success: boolean; receipt: any }>(`/receipts/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(receipt),
    }),

  validate: (id: string) =>
    request<{ success: boolean; message: string; receipt: any }>(`/receipts/${encodeURIComponent(id)}/validate`, {
      method: 'POST',
    }),
};

// ==================== DELIVERIES / SALES ORDERS API ====================
export const apiDeliveries = {
  getAll: () => request<{ success: boolean; deliveries: any[] }>('/deliveries'),

  getOne: (id: string) => request<{ success: boolean; delivery: any }>(`/deliveries/${encodeURIComponent(id)}`),

  create: (delivery: any) =>
    request<{ success: boolean; delivery: any }>('/deliveries', {
      method: 'POST',
      body: JSON.stringify(delivery),
    }),

  toggleChecklist: (id: string, field: 'pick' | 'pack') =>
    request<{ success: boolean; delivery: any }>(`/deliveries/${encodeURIComponent(id)}/checklist`, {
      method: 'PATCH',
      body: JSON.stringify({ field }),
    }),

  validate: (id: string) =>
    request<{ success: boolean; message: string; delivery: any }>(`/deliveries/${encodeURIComponent(id)}/validate`, {
      method: 'POST',
    }),
};

// ==================== SUPPLIERS API ====================
export const apiSuppliers = {
  getAll: () => request<{ success: boolean; suppliers: any[] }>('/suppliers'),

  getOne: (id: string) => request<{ success: boolean; supplier: any; orders: any[] }>(`/suppliers/${id}`),

  create: (supplier: any) =>
    request<{ success: boolean; supplier: any }>('/suppliers', {
      method: 'POST',
      body: JSON.stringify(supplier),
    }),

  update: (id: string, supplier: any) =>
    request<{ success: boolean; supplier: any }>(`/suppliers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(supplier),
    }),

  delete: (id: string) =>
    request<{ success: boolean; message: string }>(`/suppliers/${id}`, {
      method: 'DELETE',
    }),
};

// ==================== STOCK MOVEMENTS HISTORY API ====================
export const apiMoves = {
  getAll: (query?: { kind?: string; sku?: string; search?: string; limit?: number }) => {
    const params = new URLSearchParams();
    if (query?.kind && query.kind !== 'ALL') params.set('kind', query.kind);
    if (query?.sku) params.set('sku', query.sku);
    if (query?.search) params.set('search', query.search);
    if (query?.limit) params.set('limit', String(query.limit));
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return request<{ success: boolean; count: number; moveRecords: any[] }>(`/moves${queryString}`);
  },

  create: (record: any) =>
    request<{ success: boolean; moveRecord: any }>('/moves', {
      method: 'POST',
      body: JSON.stringify(record),
    }),
};

// ==================== STOCK ADJUSTMENTS API ====================
export const apiAdjustments = {
  getAll: () => request<{ success: boolean; adjustmentItems: any[] }>('/adjustments'),

  create: (item: any) =>
    request<{ success: boolean; adjustmentItem: any }>('/adjustments', {
      method: 'POST',
      body: JSON.stringify(item),
    }),

  updateCount: (id: string, countedQuantity: number) =>
    request<{ success: boolean; adjustmentItem: any }>(`/adjustments/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify({ countedQuantity }),
    }),

  commit: (notes: string) =>
    request<{ success: boolean; message: string }>('/adjustments/commit', {
      method: 'POST',
      body: JSON.stringify({ notes }),
    }),
};

// ==================== WAREHOUSES API ====================
export const apiWarehouses = {
  getAll: () => request<{ success: boolean; warehouses: any[] }>('/warehouses'),

  create: (wh: any) =>
    request<{ success: boolean; warehouse: any }>('/warehouses', {
      method: 'POST',
      body: JSON.stringify(wh),
    }),

  delete: (code: string) =>
    request<{ success: boolean; message: string }>(`/warehouses/${encodeURIComponent(code)}`, {
      method: 'DELETE',
    }),
};

// ==================== ALERTS API ====================
export const apiAlerts = {
  getAll: () =>
    request<{
      success: boolean;
      totalAlerts: number;
      criticalCount: number;
      warningCount: number;
      alerts: any[];
    }>('/alerts'),

  reorder: (sku: string, quantity?: number, supplierName?: string) =>
    request<{ success: boolean; message: string; receipt: any }>('/alerts/reorder', {
      method: 'POST',
      body: JSON.stringify({ sku, quantity, supplierName }),
    }),
};

// ==================== ANALYTICS API ====================
export const apiAnalytics = {
  getTrends: (timeframe: '7d' | '30d' | '90d' = '30d') =>
    request<{
      success: boolean;
      timeframe: string;
      kpis: any;
      dailyVolume: any[];
      categoryDistribution: any[];
      abcAnalysis: any[];
    }>(`/analytics/trends?timeframe=${timeframe}`),

  getDeadStock: () =>
    request<{
      success: boolean;
      totalDeadStockCount: number;
      totalDeadValuation: number;
      items: any[];
    }>('/analytics/dead-stock'),

  getAnomalies: () =>
    request<{
      success: boolean;
      count: number;
      anomalies: any[];
    }>('/analytics/anomalies'),

  getSmartTransfers: () =>
    request<{
      success: boolean;
      recommendations: any[];
    }>('/analytics/transfers/smart-recommendations'),

  getHealthScores: () =>
    request<{
      success: boolean;
      averageScore: number;
      items: any[];
    }>('/analytics/health-scores'),
};

// ==================== FORECASTING API ====================
export const apiForecast = {
  getForSku: (sku: string) =>
    request<{ success: boolean; forecast: any }>(`/forecast/${encodeURIComponent(sku)}`),

  getBatch: () => request<{ success: boolean; forecasts: any[] }>('/forecast'),

  simulateWhatIf: (sku: string, demandChange: number = 20, leadTimeDelay: number = 0) =>
    request<{ success: boolean; simulation: any }>(
      `/forecast/what-if/${encodeURIComponent(sku)}?demandChange=${demandChange}&leadTimeDelay=${leadTimeDelay}`
    ),
};

// ==================== INTELLIGENCE HUB CHATBOT API ====================
export const apiChat = {
  sendMessage: (message: string) =>
    request<{ success: boolean; reply: string; suggestions: string[]; timestamp: string }>('/chat', {
      method: 'POST',
      body: JSON.stringify({ message }),
    }),
};

// ==================== REAL-TIME SSE STREAM ====================
export const subscribeToEvents = (onEvent: (data: any) => void): (() => void) => {
  const eventSource = new EventSource(`${API_BASE}/events`);

  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      onEvent(data);
    } catch (e) {
      console.warn('Failed to parse SSE message:', e);
    }
  };

  eventSource.onerror = (err) => {
    console.debug('SSE connection closed or reconnecting...', err);
  };

  return () => {
    eventSource.close();
  };
};
