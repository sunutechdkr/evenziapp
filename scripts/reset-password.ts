import { prisma } from "../src/lib/prisma";
import bcrypt from "bcrypt";

async function resetPassword() {
  const email = "bouba@ineventapp.com";
  const newPassword = "Passer@1ok";
  
  try {
    // Vérifier si l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!user) {
      console.error(`Utilisateur avec l'email ${email} n'existe pas.`);
      return;
    }
    
    // Hacher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Mettre à jour le mot de passe de l'utilisateur
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword }
    });
    
    console.log(`Mot de passe réinitialisé avec succès pour ${email}`);
  } catch (error) {
    console.error("Erreur lors de la réinitialisation du mot de passe:", error);
  } finally {
    await prisma.$disconnect();
  }
}

resetPassword()
  .catch(e => {
    console.error(e);
    process.exit(1);
  }); 