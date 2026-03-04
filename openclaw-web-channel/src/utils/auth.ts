import jwt from 'jsonwebtoken';

export interface JwtClaims {
  sub: string;
  session?: string;
  [key: string]: unknown;
}

export function generateToken(claims: JwtClaims, secret: string, expiresInSeconds: number): string {
  return jwt.sign(claims, secret, {
    algorithm: 'HS256',
    expiresIn: expiresInSeconds
  });
}

export function verifyToken(token: string, secret: string): JwtClaims {
  const decoded = jwt.verify(token, secret);
  if (typeof decoded === 'string') {
    throw new Error('AUTH_001');
  }

  if (!decoded.sub || typeof decoded.sub !== 'string') {
    throw new Error('AUTH_001');
  }

  return decoded as JwtClaims;
}

export function parseBearerToken(authHeader: string | undefined): string | null {
  if (!authHeader) {
    return null;
  }

  const [scheme, token] = authHeader.split(' ');
  if (!scheme || !token || scheme.toLowerCase() !== 'bearer') {
    return null;
  }

  return token;
}
