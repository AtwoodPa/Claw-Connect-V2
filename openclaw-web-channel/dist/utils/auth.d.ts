export interface JwtClaims {
    sub: string;
    session?: string;
    [key: string]: unknown;
}
export declare function generateToken(claims: JwtClaims, secret: string, expiresInSeconds: number): string;
export declare function verifyToken(token: string, secret: string): JwtClaims;
export declare function parseBearerToken(authHeader: string | undefined): string | null;
