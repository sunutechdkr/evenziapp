import fetch from 'node-fetch';

async function testLogin() {
  const credentials = {
    email: 'bouba@ineventapp.com',
    password: 'Passer@1ok'
  };
  
  try {
    // 1. Obtenir un CSRF token
    const csrfResponse = await fetch('http://localhost:3000/api/auth/csrf');
    const csrfData = await csrfResponse.json();
    
    console.log('CSRF token obtenu:', csrfData);
    
    // 2. Tentative de connexion
    const loginResponse = await fetch('http://localhost:3000/api/auth/callback/credentials', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        csrfToken: csrfData.csrfToken,
        email: credentials.email,
        password: credentials.password,
        callbackUrl: 'http://localhost:3000/dashboard'
      })
    });
    
    console.log('Statut HTTP:', loginResponse.status);
    
    // Lire la réponse brute
    const responseText = await loginResponse.text();
    console.log('Réponse brute:', responseText.substring(0, 500) + '...');
    
    // 3. Vérifier la session
    const sessionResponse = await fetch('http://localhost:3000/api/auth/session');
    const sessionData = await sessionResponse.json();
    
    console.log('Session après connexion:', sessionData);
    
  } catch (error) {
    console.error('Erreur lors du test de connexion:', error);
  }
}

testLogin(); 