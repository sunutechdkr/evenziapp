import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { writeFile, unlink } from "fs/promises";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";
import { mkdir } from "fs/promises";
import { existsSync } from "fs";

// GET /api/events/[id]/sponsors/[sponsorId] - Récupérer un sponsor spécifique
export async function GET(
  request: Request,
  { params }: { params: { id: string; sponsorId: string } }
) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json(
      { message: "Non autorisé" },
      { status: 401 }
    );
  }
  
  const { id, sponsorId } = params;
  
  try {
    // Récupérer le sponsor spécifique
    const sponsors = await prisma.$queryRaw`
      SELECT * FROM sponsors
      WHERE id = ${sponsorId} AND event_id = ${id}
    `;
    
    if (!sponsors || (sponsors as any[]).length === 0) {
      return NextResponse.json(
        { message: "Sponsor non trouvé" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(sponsors[0]);
  } catch (error) {
    console.error("Erreur lors de la récupération du sponsor:", error);
    return NextResponse.json(
      { message: "Erreur lors de la récupération du sponsor" },
      { status: 500 }
    );
  }
}

// PUT /api/events/[id]/sponsors/[sponsorId] - Mettre à jour un sponsor
export async function PUT(
  request: Request,
  { params }: { params: { id: string; sponsorId: string } }
) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json(
      { message: "Non autorisé" },
      { status: 401 }
    );
  }
  
  const { id, sponsorId } = params;
  
  try {
    // Vérifier que le sponsor existe
    const existingSponsorResult = await prisma.$queryRaw`
      SELECT * FROM sponsors
      WHERE id = ${sponsorId} AND event_id = ${id}
    `;
    
    const existingSponsor = Array.isArray(existingSponsorResult) && existingSponsorResult.length > 0 ? existingSponsorResult[0] : null;
    
    if (!existingSponsor) {
      return NextResponse.json(
        { message: "Sponsor non trouvé" },
        { status: 404 }
      );
    }

    // Traiter le formulaire multipart
    const formData = await request.formData();
    const name = formData.get("name")?.toString();
    const description = formData.get("description")?.toString();
    const website = formData.get("website")?.toString();
    const level = formData.get("level")?.toString();
    const visible = formData.get("visible") === "true";
    const logoFile = formData.get("logo") as File | null;

    if (!name) {
      return NextResponse.json(
        { message: "Le nom du sponsor est requis" },
        { status: 400 }
      );
    }

    let logoPath = (existingSponsor as any).logo;

    // Si un nouveau logo a été envoyé, le sauvegarder
    if (logoFile) {
      const bytes = await logoFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      // Créer un nom de fichier unique
      const uniqueFilename = `${uuidv4()}-${logoFile.name.replace(/\s/g, '_')}`;
      const relativePath = `/uploads/sponsors/${uniqueFilename}`;
      const uploadDir = join(process.cwd(), 'public', 'uploads', 'sponsors');
      
      // S'assurer que le répertoire existe
      try {
        await mkdir(uploadDir, { recursive: true });
      } catch (error) {
        console.error("Erreur lors de la création du répertoire:", error);
      }
      
      const filePath = join(uploadDir, uniqueFilename);
      
      try {
        await writeFile(filePath, buffer);
        
        // Supprimer l'ancien logo s'il existe
        if ((existingSponsor as any).logo) {
          const oldLogoPath = join(process.cwd(), 'public', (existingSponsor as any).logo);
          if (existsSync(oldLogoPath)) {
            await unlink(oldLogoPath);
          }
        }
        
        logoPath = relativePath;
      } catch (error) {
        console.error("Erreur lors de l'enregistrement du logo:", error);
        return NextResponse.json(
          { message: "Erreur lors de l'enregistrement du logo" },
          { status: 500 }
        );
      }
    }

    // Mettre à jour le sponsor
    const now = new Date();
    
    await prisma.$executeRaw`
      UPDATE sponsors
      SET name = ${name},
          description = ${description || null},
          logo = ${logoPath},
          website = ${website || null},
          level = ${level || "GOLD"},
          visible = ${visible},
          updated_at = ${now}
      WHERE id = ${sponsorId} AND event_id = ${id}
    `;

    // Récupérer le sponsor mis à jour
    const updatedSponsor = await prisma.$queryRaw`
      SELECT * FROM sponsors WHERE id = ${sponsorId}
    `;

    return NextResponse.json(Array.isArray(updatedSponsor) ? updatedSponsor[0] : null);
  } catch (error) {
    console.error("Erreur lors de la mise à jour du sponsor:", error);
    return NextResponse.json(
      { message: "Erreur lors de la mise à jour du sponsor" },
      { status: 500 }
    );
  }
}

// DELETE /api/events/[id]/sponsors/[sponsorId] - Supprimer un sponsor
export async function DELETE(
  request: Request,
  { params }: { params: { id: string; sponsorId: string } }
) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json(
      { message: "Non autorisé" },
      { status: 401 }
    );
  }
  
  const { id, sponsorId } = params;
  
  try {
    // Vérifier que le sponsor existe
    const existingSponsorResult = await prisma.$queryRaw`
      SELECT * FROM sponsors
      WHERE id = ${sponsorId} AND event_id = ${id}
    `;
    
    const existingSponsor = Array.isArray(existingSponsorResult) && existingSponsorResult.length > 0 ? existingSponsorResult[0] : null;
    
    if (!existingSponsor) {
      return NextResponse.json(
        { message: "Sponsor non trouvé" },
        { status: 404 }
      );
    }

    // Supprimer le logo s'il existe
    if ((existingSponsor as any).logo) {
      const logoPath = join(process.cwd(), 'public', (existingSponsor as any).logo);
      if (existsSync(logoPath)) {
        try {
          await unlink(logoPath);
        } catch (error) {
          console.error("Erreur lors de la suppression du logo:", error);
        }
      }
    }

    // Supprimer le sponsor
    await prisma.$executeRaw`
      DELETE FROM sponsors
      WHERE id = ${sponsorId} AND event_id = ${id}
    `;

    return NextResponse.json({ message: "Sponsor supprimé avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression du sponsor:", error);
    return NextResponse.json(
      { message: "Erreur lors de la suppression du sponsor" },
      { status: 500 }
    );
  }
} 