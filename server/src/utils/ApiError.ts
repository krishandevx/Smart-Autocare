export class ApiError extends Error {
  statusCode: number;
  details?: unknown;

  constructor(statusCode: number, message: string, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const notFound = (res, message = 'Not found') => res.status(404).json({ success: false, message });

export const ok = (res, data: unknown, message = 'Success', meta?: unknown) =>
  res.status(200).json({ success: true, message, data, meta });