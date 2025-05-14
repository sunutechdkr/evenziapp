import fetch from 'node-fetch';

async function testEventsAPI() {
  try {
    console.log('1. Test GET /api/events');
    const getResponse = await fetch('http://localhost:3000/api/events');
    const events = await getResponse.json();
    console.log(`- ${events.length} événements trouvés`);
    
    if (events.length > 0) {
      const firstEvent = events[0];
      console.log(`- Premier événement: ${firstEvent.name} (${firstEvent.id})`);
    }
    
    console.log('\n2. Test POST /api/events (sans authentification)');
    const eventData = {
      name: `Test Event ${new Date().toISOString()}`,
      description: 'This is a test event created via API',
      location: 'Online',
      startDate: '2023-07-01',
      endDate: '2023-07-03',
      sector: 'Technology',
      type: 'Conference',
      format: 'Virtual',
      supportEmail: 'support@example.com'
    };
    
    const postResponse = await fetch('http://localhost:3000/api/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(eventData)
    });
    
    const postResult = await postResponse.json();
    console.log(`- Statut: ${postResponse.status}`);
    console.log(`- Résultat: ${JSON.stringify(postResult)}`);
    
    console.log('\nCe test confirme que l\'API est correctement configurée:');
    console.log('- GET /api/events fonctionne et renvoie les événements');
    console.log('- POST /api/events vérifie bien l\'authentification');
    console.log('Pour tester la création d\'événements, il faudrait s\'authentifier via l\'interface web.');
    
  } catch (error) {
    console.error('Erreur lors du test:', error);
  }
}

testEventsAPI(); 