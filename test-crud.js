const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testCRUD() {
  try {
    // CREATE - Créer un utilisateur
    const user = await prisma.user.create({
      data: {
        name: 'Test User',
        email: 'test@example.com',
        role: 'ADMIN'
      }
    });
    console.log('User created:', user);

    // READ - Lire un utilisateur
    const fetchedUser = await prisma.user.findUnique({
      where: { email: 'test@example.com' }
    });
    console.log('User fetched:', fetchedUser);

    // UPDATE - Mettre à jour un utilisateur
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { name: 'Updated User' }
    });
    console.log('User updated:', updatedUser);

    // DELETE - Supprimer un utilisateur
    const deletedUser = await prisma.user.delete({
      where: { id: user.id }
    });
    console.log('User deleted:', deletedUser);

    console.log('CRUD operations successful!');
  } catch (error) {
    console.error('Error during CRUD operations:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testCRUD(); 