const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createUser() {
  try {
    const hashedPassword = await bcrypt.hash('password', 10);
    
    const user = await prisma.user.create({
      data: {
        name: 'Admin',
        email: 'admin@inevent.fr',
        password: hashedPassword,
        role: 'ADMIN'
      }
    });
    
    console.log('User created:', user);
  } catch (error) {
    console.error('Error creating user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createUser(); 