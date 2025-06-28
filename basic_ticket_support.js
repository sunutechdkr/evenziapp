const fs = require('fs');

// Lire le fichier
let content = fs.readFileSync('src/app/dashboard/events/[id]/participants/page.tsx', 'utf8');

// 1. Ajouter le champ ticket au type Participant
content = content.replace(
  'qrCode?: string;',
  `qrCode?: string;
  ticket?: {
    id: string;
    name: string;
    price: number;
    currency: string;
  };`
);

// 2. Ajouter le type Ticket après le type Event
content = content.replace(
  'slug?: string; // Ajouter le slug à l\'interface Event\n};',
  `slug?: string; // Ajouter le slug à l'interface Event
};

// Type de billet
type Ticket = {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  quantity?: number;
  sold: number;
  status: string;
  visibility: string;
};`
);

// 3. Ajouter ticketId au newParticipant et les états des billets
content = content.replace(
  'const [newParticipant, setNewParticipant] = useState({',
  `// États pour la gestion des billets
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  
  const [newParticipant, setNewParticipant] = useState({`
);

content = content.replace(
  "type: 'PARTICIPANT'",
  "type: 'PARTICIPANT',\n    ticketId: ''"
);

// 4. Modifier le type de mapping dans fetchParticipants
content = content.replace(
  'qrCode?: string;',
  `qrCode?: string;
        ticket_id?: string;
        ticket_name?: string;
        ticket_price?: number;
        ticket_currency?: string;`
);

// 5. Modifier le mapping pour inclure les informations des billets
content = content.replace(
  'qrCode: reg.qrCode',
  `qrCode: reg.qrCode,
        ticket: reg.ticket_id ? {
          id: reg.ticket_id,
          name: reg.ticket_name || 'Billet',
          price: reg.ticket_price || 0,
          currency: reg.ticket_currency || 'XOF'
        } : undefined`
);

// 6. Modifier handleAddParticipant pour inclure ticketId
content = content.replace(
  'type: newParticipant.type,',
  `type: newParticipant.type,
          ticketId: newParticipant.ticketId,`
);

// 7. Ajouter ticketId à la réinitialisation du formulaire
content = content.replace(
  "type: 'PARTICIPANT'\n    });",
  "type: 'PARTICIPANT',\n      ticketId: ''\n    });"
);

// Écrire le fichier modifié
fs.writeFileSync('src/app/dashboard/events/[id]/participants/page.tsx', content);
console.log('Support de base des billets ajouté avec succès!');
