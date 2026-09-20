import { NextFunction, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { ApiError } from '../utils/ApiError';

export const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

interface UploadedFile {
  filename: string;
  originalname: string;
}

const ALLOWED = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/heic',
  'application/pdf',
]);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 10 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED.has(file.mimetype)) {
      cb(new ApiError(400, `File type not allowed: ${file.mimetype}`));
      return;
    }
    cb(null, true);
  },
});

export function filesToUrls(req: Request, key = 'files'): string[] {
  const files = (req.files as UploadedFile[]) || [];
  return files.map((f) => `/uploads/${f.filename}`);
}

export function fileToUrl(req: Request, key = 'file'): string {
  const file = (req.file as UploadedFile) || (req as any)[key];
  return file ? `/uploads/${file.filename}` : '';
}