const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/app/dashboard/events/[id]/formulaire/page.tsx');

// Lire le fichier
let content = fs.readFileSync(filePath, 'utf8');

// Code à insérer pour la sélection de billet
const ticketSelectionCode = `
                      {/* Section de sélection de billet */}
                      <div className="sm:col-span-2">
                        <FormLabel>Choisir un billet <span className="text-red-500">*</span></FormLabel>
                        {loadingTickets ? (
                          <div className="flex items-center justify-center py-4">
                            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-[#81B441]"></div>
                            <span className="ml-2 text-sm text-gray-500">Chargement des billets...</span>
                          </div>
                        ) : tickets.length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                            {tickets.filter(ticket => ticket.status === 'ACTIVE' && ticket.visibility === 'VISIBLE').map((ticket) => (
                              <div
                                key={ticket.id}
                                className={\`border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 \${
                                  !previewMode ? 'opacity-60 cursor-not-allowed' : 'hover:border-[#81B441] hover:shadow-md'
                                }\`}
                                onClick={() => previewMode && console.log('Billet sélectionné:', ticket.id)}
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <h4 className="font-semibold text-gray-900">{ticket.name}</h4>
                                    {ticket.description && (
                                      <p className="text-sm text-gray-600 mt-1">{ticket.description}</p>
                                    )}
                                    <div className="mt-2 flex items-center justify-between">
                                      <span className="text-lg font-bold text-[#81B441]">
                                        {ticket.price === 0 ? 'Gratuit' : \`\${ticket.price} \${ticket.currency || 'XOF'}\`}
                                      </span>
                                      <span className="text-xs text-gray-500">
                                        {ticket.quantity ? \`\${ticket.sold || 0}/\${ticket.quantity}\` : 'Illimité'}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="ml-3">
                                    <div className={\`w-4 h-4 rounded-full border-2 \${!previewMode ? 'border-gray-300' : 'border-[#81B441]'}\`}>
                                      {/* Radio button simulation */}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                            <p className="text-sm text-gray-500">
                              Aucun billet disponible pour cet événement.
                            </p>
                          </div>
                        )}
                      </div>
`;

// Chercher l'endroit où insérer le code (après le champ entreprise)
const insertAfter = `                      />

                      <FormField
                        control={form.control}
                        name="type"`;

const insertBefore = `                      <FormField
                        control={form.control}
                        name="type"`;

// Vérifier si le code n'est pas déjà présent
if (content.includes('Choisir un billet')) {
  console.log('✅ La sélection de billet est déjà présente');
  process.exit(0);
}

// Remplacer le contenu
const newContent = content.replace(insertBefore, ticketSelectionCode + insertBefore);

// Écrire le fichier modifié
fs.writeFileSync(filePath, newContent, 'utf8');
console.log('✅ Sélection de billet ajoutée avec succès !'); 