import { prisma } from './prisma';

export async function cleanupExpiredOtpCodes() {
  try {
    const result = await prisma.otpCode.deleteMany({
      where: {
        OR: [
          {
            expiresAt: {
              lt: new Date(), // Codes expirés
            },
          },
          {
            used: true,
            createdAt: {
              lt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Codes utilisés depuis plus de 24h
            },
          },
        ],
      },
    });

    console.log(`🧹 Nettoyage OTP: ${result.count} codes supprimés`);
    return result.count;
  } catch (error) {
    console.error('Erreur lors du nettoyage des codes OTP:', error);
    throw error;
  }
} 