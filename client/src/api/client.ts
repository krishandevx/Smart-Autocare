import axios from 'axios';
import type { ApiResponse } from '../types';

export const API_BASE = import.meta.env.VITE_API_URL || '/api';

export const client = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
  timeout: 20000,
});

client.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      const { pathname } = window.location;
      if (!['/login', '/register', '/account', '/admin'].some((p) => p === pathname)) {
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  },
);

export async function get<T>(url: string): Promise<T> {
  const res = await client.get<ApiResponse<T>>(url);
  return res.data.data;
}

export async function post<T>(url: string, body?: unknown): Promise<T> {
  const res = await client.post<ApiResponse<T>>(url, body ?? {});
  return res.data.data;
}

export async function put<T>(url: string, body?: unknown): Promise<T> {
  const res = await client.put<ApiResponse<T>>(url, body ?? {});
  return res.data.data;
}

export async function del<T>(url: string): Promise<T> {
  const res = await client.delete<ApiResponse<T>>(url);
  return res.data.data;
}

export async function postForm<T>(url: string, formData: FormData): Promise<T> {
  const res = await client.post<ApiResponse<T>>(url, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data.data;
}

export function makeUrl(base: string, params: Record<string, unknown>): string {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return;
    if (Array.isArray(v)) {
      (v as unknown[]).forEach((item) => {
        if (item !== undefined && item !== null && item !== '') sp.append(k, String(item));
      });
    } else {
      sp.set(k, String(v));
    }
  });
  const s = sp.toString();
  return s ? `${base}?${s}` : base;
}