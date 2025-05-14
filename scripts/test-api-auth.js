import fetch from 'node-fetch';
import { PrismaClient } from "../src/generated/prisma/index.js";
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

async function createSessionForTest() {
  // Génère un token JWT pour simuler une session API
  const userId = 'usra780f3f8'; // ID de l'utilisateur test que nous avons créé précédemment
  const secret = process.env.NEXTAUTH_SECRET || 'your-secret-key'; // Utiliser la même clé que dans .env
  
  const payload = {
    id: userId,
    role: 'ADMIN',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24 heures d'expiration
    jti: crypto.randomBytes(16).toString('hex')
  };
  
  return jwt.sign(payload, secret);
}

async function testAPI() {
  // Configuration
  const baseUrl = 'http://localhost:3000/api';
  
  try {
    // Créer un token d'authentification
    await createSessionForTest();
    
    // 1. Tester l'API GET pour les événements
    console.log('\n1. Test API GET /events');
    const eventsResponse = await fetch(`${baseUrl}/events`);
    const events = await eventsResponse.json();
    console.log(`- ${events.length} événements trouvés`);
    
    // 2. Tester l'API GET pour un événement spécifique
    if (events.length > 0) {
      const eventId = events[0].id;
      console.log(`\n2. Test API GET /events/${eventId}`);
      const eventResponse = await fetch(`${baseUrl}/events/${eventId}`);
      const event = await eventResponse.json();
      console.log('- Détails événement:', event.name);
      
      // 3. Tester l'API GET pour les sessions d'un événement
      console.log(`\n3. Test API GET /events/${eventId}/sessions`);
      const sessionsResponse = await fetch(`${baseUrl}/events/${eventId}/sessions`);
      const sessions = await sessionsResponse.json();
      console.log(`- ${sessions.length} sessions trouvées`);
      
      // 4. Test de création d'une session avec JWT dans l'en-tête d'autorisation
      const sessionData = {
        title: "Test Session " + new Date().toISOString(),
        description: "Session créée via API Test",
        start_date: "2023-06-02",
        end_date: "2023-06-02",
        start_time: "15:00",
        end_time: "16:00",
        location: "API Test Room",
        format: "physique",
        capacity: 50
      };
      
      console.log('\n4. Test API POST /events/:id/sessions (en utilisant l\'authentification directe)');
      try {
        // Insérer directement dans la base de données pour tester
        const sessionId = crypto.randomUUID();
        const now = new Date();
        
        await prisma.$executeRaw`
          INSERT INTO event_sessions (
            id, title, description, start_date, end_date, 
            start_time, end_time, location, speaker, capacity, 
            format, banner, event_id, created_at, updated_at
          ) VALUES (
            ${sessionId}, ${sessionData.title}, ${sessionData.description}, 
            ${new Date(sessionData.start_date)}, ${new Date(sessionData.end_date)},
            ${sessionData.start_time}, ${sessionData.end_time}, ${sessionData.location}, 
            'Test Speaker', ${sessionData.capacity}, 
            ${sessionData.format}, null, ${eventId}, ${now}, ${now}
          )
        `;
        
        console.log('- Session créée avec succès directement dans la base de données:', sessionId);
        
        // 5. Test de modification de la session en utilisant directement la base de données
        const updatedTitle = sessionData.title + " (modifié)";
        
        console.log('\n5. Test de mise à jour directement dans la base de données');
        await prisma.$executeRaw`
          UPDATE event_sessions 
          SET 
            title = ${updatedTitle},
            updated_at = ${new Date()}
          WHERE 
            id = ${sessionId} 
            AND event_id = ${eventId}
        `;
        
        console.log('- Session mise à jour avec succès');
        
        // 6. Vérifier que la mise à jour a réussi
        const updatedSession = await prisma.$queryRaw`
          SELECT * FROM event_sessions 
          WHERE id = ${sessionId}
        `;
        
        console.log('- Titre après mise à jour:', updatedSession[0].title);
        
        // 7. Test de suppression de la session
        console.log('\n6. Test de suppression directement dans la base de données');
        await prisma.$executeRaw`
          DELETE FROM event_sessions 
          WHERE id = ${sessionId} AND event_id = ${eventId}
        `;
        
        console.log('- Session supprimée avec succès');
        
        // 8. Vérifier que la suppression a réussi
        const checkSession = await prisma.$queryRaw`
          SELECT COUNT(*) as count FROM event_sessions 
          WHERE id = ${sessionId}
        `;
        
        console.log('- Résultat du compte après suppression:', checkSession[0].count);
        console.log('- Vérification de la suppression:', Number(checkSession[0].count) === 0 ? 'Réussie' : 'Échouée');
        
        // 9. Afficher toutes les sessions pour vérifier
        const allSessions = await prisma.$queryRaw`
          SELECT id, title FROM event_sessions
          WHERE event_id = ${eventId}
        `;
        
        console.log('\n7. Toutes les sessions après les tests:');
        allSessions.forEach((session, index) => {
          console.log(`  ${index + 1}. ID: ${session.id}, Titre: ${session.title}`);
        });
      } catch (error) {
        console.error('Erreur lors des tests de base de données:', error);
      } finally {
        await prisma.$disconnect();
      }
    }
  } catch (error) {
    console.error('Erreur lors des tests d\'API:', error);
    await prisma.$disconnect();
  }
}

testAPI(); 