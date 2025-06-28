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

// 4. Ajouter la fonction fetchTickets et useEffect après extractParams
content = content.replace(
  '  }, [params]);',
  `  }, [params]);
  
  // Fonction pour récupérer les billets
  const fetchTickets = async () => {
    setLoadingTickets(true);
    try {
      const response = await fetch(\`/api/public/events/\${eventId}/tickets\`);
      if (response.ok) {
        const data = await response.json();
        const availableTickets = (data.tickets || []).filter(
          ticket => ticket.status === 'ACTIVE' && ticket.visibility === 'VISIBLE'
        );
        setTickets(availableTickets);
        
        // Sélectionner automatiquement le premier billet disponible
        if (availableTickets.length > 0) {
          setNewParticipant(prev => ({
            ...prev,
            ticketId: availableTickets[0].id
          }));
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des billets:', error);
    } finally {
      setLoadingTickets(false);
    }
  };
  
  // Charger les billets quand eventId change
  useEffect(() => {
    if (eventId) {
      fetchTickets();
    }
  }, [eventId]);`
);

// 5. Modifier le type de mapping dans fetchParticipants
content = content.replace(
  'qrCode?: string;',
  `qrCode?: string;
        ticket_id?: string;
        ticket_name?: string;
        ticket_price?: number;
        ticket_currency?: string;`
);

// 6. Modifier le mapping pour inclure les informations des billets
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

// 7. Modifier handleAddParticipant pour inclure ticketId
content = content.replace(
  'type: newParticipant.type,',
  `type: newParticipant.type,
          ticketId: newParticipant.ticketId,`
);

// 8. Ajouter la colonne Billet dans l'en-tête du tableau
content = content.replace(
  '<TableHead>Type</TableHead>',
  `<TableHead>Type</TableHead>
                  <TableHead>Billet</TableHead>`
);

// 9. Ajouter la cellule pour afficher le billet dans le tableau
content = content.replace(
  '{participant.type === \'PARTICIPANT\' ? \'Participant\' : \'Intervenant\'}',
  `{participant.type === 'PARTICIPANT' ? 'Participant' : 'Intervenant'}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-6">
                      {participant.ticket ? (
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-900">{participant.ticket.name}</span>
                          <span className="text-xs text-gray-500">
                            {participant.ticket.price > 0 ? \`\${participant.ticket.price} \${participant.ticket.currency}\` : 'Gratuit'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">Aucun billet</span>
                      )}`
);

// 10. Ajouter les informations du billet dans la sidebar (après les informations d'inscription)
const sidebarTicketInfo = `
                  
                  {/* Informations du billet */}
                  {selectedParticipant.ticket && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1 flex items-center">
                        <TicketIcon className="h-3 w-3 mr-1" />
                        Billet sélectionné
                      </p>
                      <div className="bg-gray-50 p-3 rounded-lg border">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{selectedParticipant.ticket.name}</p>
                            <p className="text-xs text-gray-600 mt-1">
                              {selectedParticipant.ticket.price > 0 
                                ? \`\${selectedParticipant.ticket.price} \${selectedParticipant.ticket.currency}\` 
                                : 'Gratuit'}
                            </p>
                          </div>
                          <TicketIcon className="h-4 w-4 text-[#81B441]" />
                        </div>
                      </div>
                    </div>
                  )}`;

content = content.replace(
  '                </div>\n                  </div>\n                      </div>',
  `                </div>
                  </div>${sidebarTicketInfo}
                      </div>`
);

// 11. Ajouter la sélection de billets dans le formulaire d'ajout
const ticketSelectionForm = `
              <div className="form-field-animation">
                <label htmlFor="ticketId" className="text-xs font-medium text-gray-700 mb-1 block">
                  Billet <span className="text-red-500">*</span>
                </label>
                {loadingTickets ? (
                  <div className="w-full rounded-md border border-gray-300 py-2 pl-3 pr-10 text-sm bg-gray-50">
                    Chargement des billets...
                  </div>
                ) : tickets.length > 0 ? (
                  <select
                    id="ticketId"
                    name="ticketId"
                    required
                    value={newParticipant.ticketId}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-300 py-2 pl-3 pr-10 text-sm focus:border-[#81B441] focus:outline-none focus:ring-[#81B441]"
                  >
                    <option value="">Sélectionner un billet</option>
                    {tickets.map((ticket) => (
                      <option key={ticket.id} value={ticket.id}>
                        {ticket.name} - {ticket.price > 0 ? \`\${ticket.price} \${ticket.currency}\` : 'Gratuit'}
                        {ticket.quantity && \` (\${ticket.quantity - ticket.sold} disponibles)\`}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="w-full rounded-md border border-gray-300 py-2 pl-3 pr-10 text-sm bg-gray-50 text-gray-500">
                    Aucun billet disponible
                  </div>
                )}
              </div>
              `;

content = content.replace(
  '<div className="form-field-animation">\n                <label htmlFor="type"',
  `${ticketSelectionForm}
              <div className="form-field-animation">
                <label htmlFor="type"`
);

// 12. Ajouter ticketId à la réinitialisation du formulaire
content = content.replace(
  "type: 'PARTICIPANT'\n    });",
  "type: 'PARTICIPANT',\n      ticketId: ''\n    });"
);

// Écrire le fichier modifié
fs.writeFileSync('src/app/dashboard/events/[id]/participants/page.tsx', content);
console.log('Implémentation complète des billets terminée!');
