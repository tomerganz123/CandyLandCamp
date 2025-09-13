import jwt from 'jsonwebtoken';
const bcrypt = require('bcryptjs');

const JWT_SECRET = process.env.JWT_SECRET!;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD!;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set');
}

if (!ADMIN_PASSWORD) {
  throw new Error('ADMIN_PASSWORD environment variable is not set');
}

export interface AdminTokenPayload {
  isAdmin: boolean;
  iat: number;
  exp: number;
}

export async function verifyAdminPassword(password: string): Promise<boolean> {
  // For simplicity, we're using a plain text comparison
  // In production, you should hash the admin password
  return password === ADMIN_PASSWORD;
}

export function generateAdminToken(): string {
  return jwt.sign(
    { isAdmin: true },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

export function verifyAdminToken(token: string): AdminTokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AdminTokenPayload;
    return decoded.isAdmin ? decoded : null;
  } catch (error) {
    return null;
  }
}

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export function comparePasswords(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}
