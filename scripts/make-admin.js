// Script pour donner le rôle d'administrateur à un utilisateur existant
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function makeAdmin(email) {
  try {
    // Vérifier si l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      console.error(`Aucun utilisateur avec l'email ${email} n'a été trouvé`);
      return;
    }

    // Mettre à jour le rôle de l'utilisateur
    const updatedUser = await prisma.user.update({
      where: { email },
      data: { role: 'ADMIN' }
    });

    console.log(`L'utilisateur ${email} est maintenant administrateur`);
    console.log(updatedUser);
  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Récupérer l'email depuis les arguments de ligne de commande
const email = process.argv[2];

if (!email) {
  console.error('Veuillez fournir un email: node make-admin.js user@example.com');
} else {
  makeAdmin(email);
} 