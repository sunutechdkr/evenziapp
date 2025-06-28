const fs = require('fs');

// Lire le fichier
let content = fs.readFileSync('src/app/dashboard/events/[id]/participants/page.tsx', 'utf8');

// 1. Ajouter seulement ticketId au newParticipant
content = content.replace(
  "type: 'PARTICIPANT'",
  "type: 'PARTICIPANT',\n    ticketId: ''"
);

// 2. Ajouter ticketId à handleAddParticipant
content = content.replace(
  'type: newParticipant.type,',
  `type: newParticipant.type,
          ticketId: newParticipant.ticketId || null,`
);

// 3. Ajouter ticketId à la réinitialisation du formulaire
content = content.replace(
  "type: 'PARTICIPANT'\n    });",
  "type: 'PARTICIPANT',\n      ticketId: ''\n    });"
);

// Écrire le fichier modifié
fs.writeFileSync('src/app/dashboard/events/[id]/participants/page.tsx', content);
console.log('Support minimal des billets ajouté!');
