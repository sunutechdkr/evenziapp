import fetch from 'node-fetch';

async function testAPI() {
  // Configuration
  const baseUrl = 'http://localhost:3000/api';
  const credentials = {
    email: 'test@ineventapp.com',
    password: 'Passer@1ok'
  };
  
  let authCookie = '';
  
  try {
    // 1. S'authentifier pour obtenir un cookie de session
    console.log('1. Obtention du CSRF token...');
    const csrfResponse = await fetch(`${baseUrl}/auth/csrf`);
    const csrfData = await csrfResponse.json();
    
    console.log('2. Tentative de connexion...');
    const loginResponse = await fetch(`${baseUrl}/auth/callback/credentials`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        csrfToken: csrfData.csrfToken,
        email: credentials.email,
        password: credentials.password,
        callbackUrl: 'http://localhost:3000/dashboard'
      }),
      redirect: 'manual'
    });
    
    if (loginResponse.ok) {
      console.log('Connexion réussie!');
      // Récupérer le cookie de session
      const cookies = loginResponse.headers.get('set-cookie');
      if (cookies) {
        authCookie = cookies;
      }
    } else {
      console.log('Échec de la connexion. Statut:', loginResponse.status);
    }
    
    // 2. Tester l'API GET pour les événements
    console.log('\n3. Test API GET /events');
    const eventsResponse = await fetch(`${baseUrl}/events`);
    const events = await eventsResponse.json();
    console.log(`- ${events.length} événements trouvés`);
    
    // 3. Tester l'API GET pour un événement spécifique
    if (events.length > 0) {
      const eventId = events[0].id;
      console.log(`\n4. Test API GET /events/${eventId}`);
      const eventResponse = await fetch(`${baseUrl}/events/${eventId}`);
      const event = await eventResponse.json();
      console.log('- Détails événement:', event.name);
      
      // 4. Tester l'API GET pour les sessions d'un événement
      console.log(`\n5. Test API GET /events/${eventId}/sessions`);
      const sessionsResponse = await fetch(`${baseUrl}/events/${eventId}/sessions`);
      const sessions = await sessionsResponse.json();
      console.log(`- ${sessions.length} sessions trouvées`);
      
      // 5. Vérifier si nous avons un cookie d'authentification
      if (authCookie) {
        // 6. Test de création d'une session
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
        
        console.log('\n6. Test API POST /events/:id/sessions');
        try {
          const createSessionResponse = await fetch(`${baseUrl}/events/${eventId}/sessions`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Cookie': authCookie
            },
            body: JSON.stringify(sessionData)
          });
          
          if (createSessionResponse.ok) {
            const newSession = await createSessionResponse.json();
            console.log('- Session créée avec succès:', newSession.id);
            
            // 7. Test de modification de la session
            const updateData = {
              ...sessionData,
              title: sessionData.title + " (modifié)",
              description: sessionData.description + " - Mise à jour via API test"
            };
            
            console.log('\n7. Test API PUT /events/:id/sessions/:sessionId');
            const updateSessionResponse = await fetch(`${baseUrl}/events/${eventId}/sessions/${newSession.id}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Cookie': authCookie
              },
              body: JSON.stringify(updateData)
            });
            
            if (updateSessionResponse.ok) {
              const updatedSession = await updateSessionResponse.json();
              console.log('- Session mise à jour avec succès:', updatedSession.title);
              
              // 8. Test de suppression de la session
              console.log('\n8. Test API DELETE /events/:id/sessions/:sessionId');
              const deleteSessionResponse = await fetch(`${baseUrl}/events/${eventId}/sessions/${newSession.id}`, {
                method: 'DELETE',
                headers: {
                  'Cookie': authCookie
                }
              });
              
              if (deleteSessionResponse.ok) {
                console.log('- Session supprimée avec succès');
              } else {
                console.log('- Échec de la suppression de la session. Statut:', deleteSessionResponse.status);
                const errorText = await deleteSessionResponse.text();
                console.log('- Erreur:', errorText);
              }
            } else {
              console.log('- Échec de la mise à jour de la session. Statut:', updateSessionResponse.status);
              const errorText = await updateSessionResponse.text();
              console.log('- Erreur:', errorText);
            }
          } else {
            console.log('- Échec de la création de la session. Statut:', createSessionResponse.status);
            const errorText = await createSessionResponse.text();
            console.log('- Erreur:', errorText);
          }
        } catch (error) {
          console.error('Erreur lors des tests d\'API en écriture:', error);
        }
      } else {
        console.log('\nPas de cookie d\'authentification disponible, les tests de création/modification/suppression ne seront pas effectués');
      }
    }
    
  } catch (error) {
    console.error('Erreur lors des tests d\'API:', error);
  }
}

testAPI(); 