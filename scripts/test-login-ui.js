import { chromium } from 'playwright';

async function testLoginUI() {
  console.log('Démarrage du test de connexion via UI...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Accéder à la page de connexion
    await page.goto('http://localhost:3000/login');
    console.log('Page de connexion chargée');
    
    // Attendre que les champs du formulaire soient chargés
    await page.waitForSelector('input[name="email"]');
    
    // Remplir les informations de connexion
    await page.fill('input[name="email"]', 'bouba@ineventapp.com');
    await page.fill('input[name="password"]', 'Passer@1ok');
    console.log('Informations de connexion saisies');
    
    // Soumettre le formulaire
    await page.click('button[type="submit"]');
    console.log('Formulaire soumis');
    
    // Attendre la redirection vers le dashboard (si la connexion réussit)
    try {
      await page.waitForURL('**/dashboard**', { timeout: 10000 });
      console.log('Connexion réussie! Redirigé vers le dashboard.');
      
      // Capturer des informations sur la session
      const cookies = await context.cookies();
      console.log('Cookies de session:', cookies.filter(c => c.name.includes('next-auth')));
      
    } catch (error) {
      console.log('Échec de redirection vers le dashboard');
      
      // Capturer le message d'erreur éventuel
      const errorMessage = await page.textContent('.text-red-600');
      if (errorMessage) {
        console.log('Message d\'erreur affiché:', errorMessage);
      }
      
      // Prendre une capture d'écran de la page d'erreur
      await page.screenshot({ path: 'login-error.png' });
      console.log('Capture d\'écran enregistrée sous login-error.png');
    }
    
    // Attendre un moment pour voir la page
    await new Promise(r => setTimeout(r, 5000));
    
  } finally {
    await browser.close();
    console.log('Test terminé');
  }
}

testLoginUI().catch(console.error); 