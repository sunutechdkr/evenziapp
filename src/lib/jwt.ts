import jwt from 'jsonwebtoken';

function getSecret(): string {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    console.error('JWT Secret (NEXTAUTH_SECRET) is not set.');
    throw new Error('NEXTAUTH_SECRET is not set');
  }
  return secret;
}

interface JWTPayload {
  participantId?: string;
  email?: string;
  eventId?: string;
  type?: string;
  exp?: number;
  [key: string]: unknown;
}

export async function signJWT(payload: JWTPayload): Promise<string> {
  const secret = getSecret();
  const token = jwt.sign(payload, secret, {
    expiresIn: '10m',
    algorithm: 'HS256'
  });
  
  return token;
}

export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    const secret = getSecret();
    const decoded = jwt.verify(token, secret, { algorithms: ['HS256'] });
    return decoded as JWTPayload;
  } catch (error) {
    console.error('Erreur de vérification JWT:', error);
    return null;
  }
} 