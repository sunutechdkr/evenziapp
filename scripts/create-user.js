import { PrismaClient } from "../src/generated/prisma/index.js";
import bcrypt from "bcrypt";
import crypto from 'crypto';

const prisma = new PrismaClient();

async function createUser() {
  const email = "test@ineventapp.com";
  const password = "Passer@1ok";
  const name = "Utilisateur Test";
  
  try {
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      console.log(`L'utilisateur avec l'email ${email} existe déjà.`);
      return;
    }
    
    // Hacher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Générer un ID
    const userId = `usr${crypto.randomBytes(4).toString('hex')}`;
    
    // Créer l'utilisateur
    const newUser = await prisma.user.create({
      data: {
        id: userId,
        name,
        email,
        password: hashedPassword,
        role: "ADMIN",
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
    
    console.log(`Nouvel utilisateur créé avec succès:`, newUser);
  } catch (error) {
    console.error("Erreur lors de la création de l'utilisateur:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createUser()
  .catch(e => {
    console.error(e);
    process.exit(1);
  }); 