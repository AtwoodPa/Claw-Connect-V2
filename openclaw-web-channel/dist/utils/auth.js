import jwt from 'jsonwebtoken';
export function generateToken(claims, secret, expiresInSeconds) {
    return jwt.sign(claims, secret, {
        algorithm: 'HS256',
        expiresIn: expiresInSeconds
    });
}
export function verifyToken(token, secret) {
    const decoded = jwt.verify(token, secret);
    if (typeof decoded === 'string') {
        throw new Error('AUTH_001');
    }
    if (!decoded.sub || typeof decoded.sub !== 'string') {
        throw new Error('AUTH_001');
    }
    return decoded;
}
export function parseBearerToken(authHeader) {
    if (!authHeader) {
        return null;
    }
    const [scheme, token] = authHeader.split(' ');
    if (!scheme || !token || scheme.toLowerCase() !== 'bearer') {
        return null;
    }
    return token;
}
//# sourceMappingURL=auth.js.map