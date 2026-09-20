export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export function parsePagination(query: Record<string, any>) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20));
  return { page, limit, skip: (page - 1) * limit };
}

export function paginate<T>(items: T[], total: number, page: number, limit: number): { data: T[]; meta: PaginationMeta } {
  return {
    data: items,
    meta: { page, limit, total, pages: Math.max(1, Math.ceil(total / limit)) },
  };
}

export function sortOptions(query: Record<string, any>, defaultSort = '-createdAt'): string {
  const s = query.sort as string | undefined;
  return s || defaultSort;
}