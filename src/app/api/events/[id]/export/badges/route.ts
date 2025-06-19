import { NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import PDFDocument from 'pdfkit';

// GET /api/events/[id]/export/badges - Exporter les badges au format PDF
export async function GET(
  request: Request, 
  context: { params: { id: string } }
) {
  // Vérification de l'authentification
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json(
      { message: "Non autorisé" },
      { status: 401 }
    );
  }
  
  const { id } = context.params;
  
  try {
    // Vérifier si l'événement existe
    const event = await prisma.$queryRaw`
      SELECT 
        id, 
        name, 
        description, 
        location, 
        start_date as "startDate", 
        end_date as "endDate",
        user_id as "userId"
      FROM events
      WHERE id = ${id}
    `;

    // Si l'événement n'est pas trouvé
    if (!event || !Array.isArray(event) || event.length === 0) {
      return NextResponse.json(
        { message: "Événement non trouvé" },
        { status: 404 }
      );
    }
    
    // Autoriser l'accès aux administrateurs et aux propriétaires de l'événement
    if (session.user.role !== "ADMIN" && event[0].userId !== session.user.id) {
      return NextResponse.json(
        { message: "Non autorisé" },
        { status: 401 }
      );
    }
    
    // Récupérer le modèle de badge pour l'événement
    const badges = await prisma.$queryRaw`
      SELECT *
      FROM badges
      WHERE event_id = ${id}
      LIMIT 1
    `;
    
    // Si aucun modèle de badge n'est trouvé
    if (!Array.isArray(badges) || badges.length === 0) {
      return NextResponse.json(
        { message: "Aucun modèle de badge trouvé pour cet événement" },
        { status: 404 }
      );
    }
    
    const badgeTemplate = badges[0];
    
    // Récupérer tous les participants de l'événement
    const participants = await prisma.$queryRaw`
      SELECT 
        id, 
        first_name as "firstName", 
        last_name as "lastName", 
        email, 
        phone, 
        type, 
        event_id as "eventId", 
        qr_code as "qrCode", 
        short_code as "shortCode"
      FROM registrations
      WHERE event_id = ${id}
      ORDER BY last_name ASC, first_name ASC
    `;
    
    // Si aucun participant n'est trouvé
    if (!Array.isArray(participants) || participants.length === 0) {
      return NextResponse.json(
        { message: "Aucun participant trouvé pour cet événement" },
        { status: 404 }
      );
    }
    
    // Créer un document PDF
    const doc = new PDFDocument({ autoFirstPage: false });
    const chunks: Uint8Array[] = [];
    
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    
    // Générer un badge pour chaque participant
    for (const participant of participants) {
      // Ajouter une nouvelle page pour chaque badge
      doc.addPage({ size: 'A4', margin: 0 });
      
      // Utiliser les données de canvasData pour dessiner le badge
      // Ce code est simplifié et doit être adapté en fonction du format exact de canvasData
      try {
        const canvasData = JSON.parse(badgeTemplate.canvasData);
        
        // Dessiner le fond du badge (si spécifié)
        if (canvasData.background) {
          doc.rect(0, 0, doc.page.width, doc.page.height).fill(canvasData.background);
        }
        
        // Dessiner les éléments du badge
        if (canvasData.elements && Array.isArray(canvasData.elements)) {
          for (const element of canvasData.elements) {
            // Remplacer les variables dans le texte
            let text = element.text || '';
            text = text.replace('{firstName}', participant.firstName || '')
                      .replace('{lastName}', participant.lastName || '')
                      .replace('{name}', `${participant.firstName} ${participant.lastName}` || '')
                      .replace('{email}', participant.email || '')
                      .replace('{type}', participant.type || '')
                      .replace('{qrCode}', participant.qrCode || '')
                      .replace('{shortCode}', participant.shortCode || '');
            
            // Positionner et écrire le texte
            if (element.type === 'text') {
              doc.font(element.fontFamily || 'Helvetica')
                .fontSize(element.fontSize || 12)
                .fillColor(element.color || 'black')
                .text(text, element.x || 0, element.y || 0, {
                  width: element.width,
                  align: element.align || 'left'
                });
            }
            
            // Pour un QR code, nous devrions normalement utiliser une bibliothèque comme qrcode
            // Mais pour simplifier, nous utilisons juste un texte représentant le QR code
            if (element.type === 'qrCode') {
              doc.font('Helvetica')
                .fontSize(8)
                .fillColor('black')
                .text(`QR Code: ${participant.shortCode || participant.qrCode}`, 
                      element.x || 0, element.y || 0, {
                        align: 'center'
                      });
            }
          }
        }
      } catch (error) {
        console.error("Erreur lors du traitement des données du badge:", error);
      }
    }
    
    // Finaliser le document PDF
    doc.end();
    
    return new Promise<NextResponse>((resolve) => {
      doc.on('end', () => {
        const buffer = Buffer.concat(chunks);
        
        // Définir les en-têtes de réponse
        const headers = new Headers();
        const eventName = event[0].name.replace(/[^a-zA-Z0-9]/g, '_');
        const fileName = `Badges_${eventName}.pdf`;
        
        headers.append('Content-Disposition', `attachment; filename=${fileName}`);
        headers.append('Content-Type', 'application/pdf');
        
        // Retourner le fichier PDF
        resolve(new NextResponse(buffer, {
          status: 200,
          headers: headers
        }));
      });
    });
    
  } catch (error) {
    console.error("Erreur lors de l'exportation des badges:", error);
    return NextResponse.json(
      { message: "Erreur lors de l'exportation des badges" },
      { status: 500 }
    );
  }
} 