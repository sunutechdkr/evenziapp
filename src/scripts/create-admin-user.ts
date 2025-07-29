const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

async function createAdminUser() {
  const prisma = new PrismaClient();
  
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'bouba@evenzi.io' },
    });

    if (existingUser) {
      console.log('Admin user already exists, updating password...');
      
      // Update the existing user with the new password
      const hashedPassword = await bcrypt.hash('Passer@1ok', 10);
      await prisma.user.update({
        where: { email: 'bouba@evenzi.io' },
        data: { password: hashedPassword },
      });
      
      console.log('Admin password updated successfully!');
    } else {
      // Create a new admin user
      const hashedPassword = await bcrypt.hash('Passer@1ok', 10);
      
      await prisma.user.create({
        data: {
          name: 'Bouba Admin',
          email: 'bouba@evenzi.io',
          password: hashedPassword,
          role: 'ADMIN',
        },
      });
      
      console.log('Admin user created successfully!');
    }
  } catch (error) {
    console.error('Error creating/updating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser(); 