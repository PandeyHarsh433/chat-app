import axios, {
    InternalAxiosRequestConfig,
    AxiosResponse,
    AxiosError,
    AxiosRequestConfig
} from 'axios';

interface TokenResponse {
    accessToken: string;
    refreshToken: string;
}

interface StorageKeys {
    ACCESS_TOKEN: string;
    REFRESH_TOKEN: string;
    TOKEN_EXPIRY: string;
}

const STORAGE_KEYS: StorageKeys = {
    ACCESS_TOKEN: 'accessToken',
    REFRESH_TOKEN: 'refreshToken',
    TOKEN_EXPIRY: 'tokenExpiry'
};

// Token management utilities
const tokenManager = {
    setTokens(accessToken: string, refreshToken: string, expiresIn?: number) {
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);

        if (expiresIn) {
            const expiryTime = new Date().getTime() + expiresIn * 1000;
            localStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRY, expiryTime.toString());
        }
    },

    clearTokens() {
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.TOKEN_EXPIRY);
    },

    getAccessToken(): string | null {
        return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    },

    getRefreshToken(): string | null {
        return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    },

    isTokenExpired(): boolean {
        const expiry = localStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRY);
        if (!expiry) return true;
        return new Date().getTime() > parseInt(expiry);
    }
};

// Create API client instance
const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    withCredentials: true,
});

// Request interceptor with token check and auto-refresh
apiClient.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        // Check if token is expired before making the request
        if (tokenManager.isTokenExpired() && config.url !== '/auth/refresh-tokens') {
            const refreshToken = tokenManager.getRefreshToken();
            if (refreshToken) {
                try {
                    const { data } = await apiClient.post<TokenResponse>(
                        '/auth/refresh-tokens',
                        { refreshToken }
                    );
                    tokenManager.setTokens(data.accessToken, data.refreshToken);
                } catch (error) {
                    tokenManager.clearTokens();
                    window.location.href = '/login';
                    return Promise.reject(error);
                }
            }
        }

        const token = tokenManager.getAccessToken();
        if (token) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error: AxiosError) => Promise.reject(error)
);

// Response interceptor with token refresh logic
apiClient.interceptors.response.use(
    (response: AxiosResponse) => {
        // Check if response includes new tokens
        const newAccessToken = response.headers['x-access-token'];
        const newRefreshToken = response.headers['x-refresh-token'];
        const expiresIn = response.headers['x-expires-in'];

        if (newAccessToken && newRefreshToken) {
            tokenManager.setTokens(
                newAccessToken,
                newRefreshToken,
                expiresIn ? parseInt(expiresIn) : undefined
            );
        }

        return response;
    },
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig;

        if (error.response?.status === 401 && originalRequest) {
            const refreshToken = tokenManager.getRefreshToken();

            if (refreshToken && !originalRequest.url?.includes('/auth/refresh-tokens')) {
                try {
                    const { data } = await apiClient.post<TokenResponse>(
                        '/auth/refresh-tokens',
                        { refreshToken }
                    );

                    tokenManager.setTokens(data.accessToken, data.refreshToken);

                    if (originalRequest.headers) {
                        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
                    }

                    return apiClient(originalRequest);
                } catch (refreshError) {
                    tokenManager.clearTokens();
                    window.location.href = '/login';
                    return Promise.reject(refreshError);
                }
            } else {
                tokenManager.clearTokens();
                window.location.href = '/login';
            }
        }

        return Promise.reject(error);
    }
);

window.addEventListener('storage', (event) => {
    if (event.key === STORAGE_KEYS.ACCESS_TOKEN && !event.newValue) {
        window.location.href = '/login';
    }
});

export const api = {
    get: <T = any>(url: string, config?: AxiosRequestConfig) =>
        apiClient.get<T>(url, config),

    post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
        apiClient.post<T>(url, data, config),

    put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
        apiClient.put<T>(url, data, config),

    delete: <T = any>(url: string, config?: AxiosRequestConfig) =>
        apiClient.delete<T>(url, config),

    patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
        apiClient.patch<T>(url, data, config),

    setAuthTokens: (accessToken: string, refreshToken: string, expiresIn?: number) =>
        tokenManager.setTokens(accessToken, refreshToken, expiresIn),

    clearAuth: () => tokenManager.clearTokens(),

    isAuthenticated: () => !!tokenManager.getAccessToken()
};

export { apiClient };
export default api;