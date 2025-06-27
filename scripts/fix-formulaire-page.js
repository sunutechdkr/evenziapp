const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/app/dashboard/events/[id]/formulaire/page.tsx');

// Lire le fichier
let content = fs.readFileSync(filePath, 'utf8');

// 1. Corriger la fonction fetchTickets pour utiliser params.id
const oldFetchTickets = `  // Fonction pour récupérer les billets
  const fetchTickets = async () => {
    setLoadingTickets(true);
    try {
      const eventIdResolved = await params;
      const response = await fetch(\`/api/events/\${eventIdResolved.id}/tickets\`);
      if (response.ok) {
        const data = await response.json();
        setTickets(data.tickets || []);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des billets:', error);
    } finally {
      setLoadingTickets(false);
    }
  };`;

const newFetchTickets = `  // Fonction pour récupérer les billets
  const fetchTickets = async () => {
    setLoadingTickets(true);
    try {
      const response = await fetch(\`/api/events/\${params.id}/tickets\`);
      if (response.ok) {
        const data = await response.json();
        setTickets(data.tickets || []);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des billets:', error);
    } finally {
      setLoadingTickets(false);
    }
  };`;

// 2. Modifier le useEffect pour appeler fetchTickets
const oldUseEffect = `    if (params.id) {
      fetchEvent();
    }`;

const newUseEffect = `    if (params.id) {
      fetchEvent();
      fetchTickets();
    }`;

// Appliquer les modifications
content = content.replace(oldFetchTickets, newFetchTickets);
content = content.replace(oldUseEffect, newUseEffect);

// Écrire le fichier modifié
fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ Page formulaire modifiée avec succès !'); 