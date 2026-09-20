declare global {
  namespace Express {
    interface Request {
      user?: {
        _id: string;
        role: string;
        name: string;
        email: string;
      };
    }
  }
}

export {};