import { PrismaClient as PrismaClientGenerated } from "../generated/prisma";

// Configuration pour client Prisma classique (sans Data Proxy)
const createPrismaClient = () => {
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

// Check pour s'assurer qu'on n'utilise pas Accelerate avec client classique
if (process.env.DATABASE_URL?.startsWith('prisma://')) {
  console.warn('⚠️  WARNING: DATABASE_URL commence par prisma:// mais nous utilisons le client Prisma classique.');
  console.warn('   Pour utiliser Accelerate, configurez withAccelerate() dans src/lib/prisma.ts');
  console.warn('   Pour utiliser le client classique, utilisez une URL postgresql://');
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
