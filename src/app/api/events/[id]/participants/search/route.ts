import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Important: Attendre le paramètre id dans Next.js 14+
    const { id } = await params;
    if (!id) {
      console.error("ID d'événement manquant dans la requête");
      return NextResponse.json(
        { message: "ID d'événement requis" },
        { status: 400 }
      );
    }
    
    console.log("Recherche avec ID d'événement:", id);
    
    // Récupérer le paramètre de recherche
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || '';
    
    // Échapper les caractères spéciaux pour la recherche SQL
    const safeQuery = query.replace(/[%_]/g, '\\$&');
    
    // Déboguer le terme de recherche
    console.log(`Recherche de participants pour l'événement ${id} avec le terme "${safeQuery}"`);
    
    // Recherche par nom/prénom/email avec SQL direct - en n'incluant que les colonnes qui existent
    const searchResults = await prisma.$queryRaw`
      SELECT 
        id, 
        first_name as "firstName", 
        last_name as "lastName", 
        email, 
        type, 
        checked_in as "checkedIn", 
        check_in_time as "checkInTime",
        short_code as "shortCode"
      FROM registrations
      WHERE 
        event_id = ${id} AND (
          LOWER(first_name) LIKE LOWER(${'%' + safeQuery + '%'}) OR
          LOWER(last_name) LIKE LOWER(${'%' + safeQuery + '%'}) OR
          LOWER(email) LIKE LOWER(${'%' + safeQuery + '%'}) OR
          LOWER(CONCAT(first_name, ' ', last_name)) LIKE LOWER(${'%' + safeQuery + '%'})
        )
      ORDER BY 
        CASE 
          WHEN LOWER(first_name) = LOWER(${safeQuery}) OR LOWER(last_name) = LOWER(${safeQuery}) THEN 1
          WHEN LOWER(first_name) LIKE LOWER(${safeQuery + '%'}) OR LOWER(last_name) LIKE LOWER(${safeQuery + '%'}) THEN 2
          ELSE 3
        END,
        first_name,
        last_name
      LIMIT 10
    `;
    
    console.log(`Nombre de résultats trouvés: ${Array.isArray(searchResults) ? searchResults.length : 0}`);
    
    return NextResponse.json({
      message: "Participants trouvés",
      results: Array.isArray(searchResults) ? searchResults : [],
    });
    
  } catch (error) {
    console.error("Erreur détaillée lors de la recherche de participants:", error);
    
    return NextResponse.json(
      { 
        message: "Erreur lors de la recherche", 
        error: error instanceof Error ? error.message : "Erreur inconnue" 
      },
      { status: 500 }
    );
  }
} 