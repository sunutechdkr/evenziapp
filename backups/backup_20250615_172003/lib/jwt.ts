import jwt from 'jsonwebtoken';

const secret = process.env.NEXTAUTH_SECRET || 'default-secret-for-dev';

interface JWTPayload {
  participantId?: string;
  email?: string;
  eventId?: string;
  type?: string;
  exp?: number;
  [key: string]: unknown;
}

export async function signJWT(payload: JWTPayload): Promise<string> {
  const token = jwt.sign(payload, secret, {
    expiresIn: '10m',
    algorithm: 'HS256'
  });
  
  return token;
}

export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    const decoded = jwt.verify(token, secret, { algorithms: ['HS256'] });
    return decoded as JWTPayload;
  } catch (error) {
    console.error('Erreur de vérification JWT:', error);
    return null;
  }
} 