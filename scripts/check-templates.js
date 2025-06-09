const { PrismaClient } = require('../src/generated/prisma');

const prisma = new PrismaClient();

async function checkTemplates() {
  try {
    const templates = await prisma.emailTemplate.findMany({
      where: {
        isGlobal: true
      },
      select: {
        id: true,
        name: true,
        category: true,
        isActive: true,
        isDefault: true
      }
    });

    console.log(`📧 Found ${templates.length} global templates:`);
    
    const categories = {};
    templates.forEach(template => {
      if (!categories[template.category]) {
        categories[template.category] = [];
      }
      categories[template.category].push(template);
    });

    Object.keys(categories).forEach(category => {
      console.log(`\n${category}:`);
      categories[category].forEach(template => {
        console.log(`  - ${template.name} (${template.isActive ? 'Active' : 'Inactive'})`);
      });
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTemplates(); 