import { PrismaClient as PrismaClientGenerated } from "../generated/prisma";

// Configuration pour client Prisma manuel (sans Data Proxy)
const createPrismaClient = () => {
  // Vérifier que l'URL n'est pas prisma://
  if (process.env.DATABASE_URL?.startsWith('prisma://')) {
    throw new Error('❌ Erreur: DATABASE_URL commence par prisma:// mais nous utilisons le client Prisma classique. Utilisez une URL postgresql://');
  }

  // Vérifier que l'URL est bien postgresql://
  if (!process.env.DATABASE_URL?.startsWith('postgresql://')) {
    throw new Error('❌ Erreur: DATABASE_URL doit commencer par postgresql:// pour le client Prisma classique');
  }

  console.log('✅ Configuration Prisma classique détectée (URL postgresql://)');

  return new PrismaClientGenerated({
    log: ['query', 'info', 'warn', 'error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });
};

// PrismaClient est attaché à l'objet global en développement pour éviter
// d'épuiser le nombre de connexions à la DB au hot reload
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClientGenerated | undefined;
}

// Configuration du client Prisma classique
const prismaClientSingleton = () => {
  return createPrismaClient();
};

export const prisma = globalThis.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
}

export default prisma;
