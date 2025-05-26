const { PrismaClient } = require('./src/generated/prisma');
const prisma = new PrismaClient();

async function testBadgesAPI() {
  try {
    // Récupérer l'événement Test sample
    const event = await prisma.event.findFirst({
      where: { name: 'Test sample' }
    });
    
    if (!event) {
      console.log('Événement non trouvé');
      return;
    }
    
    console.log('Événement trouvé:', event.id);
    
    // Tester la requête badges comme dans l'API
    const badges = await prisma.$queryRaw`
      SELECT *
      FROM badges
      WHERE event_id = ${event.id}
      LIMIT 1
    `;
    
    console.log('Badges trouvés:', badges);
    
    if (Array.isArray(badges) && badges.length > 0) {
      console.log('Badge template:', {
        id: badges[0].id,
        name: badges[0].name,
        canvasDataLength: badges[0].canvas_data?.length || 0
      });
    }
    
    // Tester la requête participants
    const participants = await prisma.$queryRaw`
      SELECT 
        id, 
        first_name as "firstName", 
        last_name as "lastName", 
        email, 
        phone, 
        type, 
        company,
        job_title as "jobTitle",
        event_id as "eventId", 
        qr_code as "qrCode", 
        short_code as "shortCode"
      FROM registrations
      WHERE event_id = ${event.id}
      ORDER BY last_name ASC, first_name ASC
    `;
    
    console.log('Participants trouvés:', participants.length);
    if (participants.length > 0) {
      console.log('Premier participant:', {
        name: `${participants[0].firstName} ${participants[0].lastName}`,
        email: participants[0].email,
        company: participants[0].company,
        qrCode: participants[0].qrCode
      });
    }
    
  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testBadgesAPI(); 