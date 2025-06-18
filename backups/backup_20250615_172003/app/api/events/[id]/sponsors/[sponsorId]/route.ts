import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { writeFile, unlink } from "fs/promises";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";
import { mkdir } from "fs/promises";
import { existsSync } from "fs";

// GET /api/events/[id]/sponsors/[sponsorId] - Récupérer un sponsor spécifique
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string; sponsorId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { message: "Non autorisé" },
        { status: 401 }
      );
    }
    
    const { id, sponsorId } = await params;
    
    // Récupérer le sponsor spécifique
    const sponsor = await prisma.sponsor.findFirst({
      where: {
        id: sponsorId,
        eventId: id
      }
    });
    
    if (!sponsor) {
      return NextResponse.json(
        { message: "Sponsor non trouvé" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(sponsor);
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
  { params }: { params: Promise<{ id: string; sponsorId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { message: "Non autorisé" },
        { status: 401 }
      );
    }
    
    const { id, sponsorId } = await params;
    console.log("PUT sponsor - ID événement:", id, "ID sponsor:", sponsorId);
    
    // Vérifier que le sponsor existe
    const existingSponsor = await prisma.sponsor.findFirst({
      where: {
        id: sponsorId,
        eventId: id
      }
    });
    
    if (!existingSponsor) {
      console.log("Sponsor non trouvé:", sponsorId);
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
    
    console.log("Données de mise à jour du sponsor:", { name, level, visible });

    if (!name) {
      return NextResponse.json(
        { message: "Le nom du sponsor est requis" },
        { status: 400 }
      );
    }

    let logoPath = existingSponsor.logo;

    // Si un nouveau logo a été envoyé, le sauvegarder
    if (logoFile) {
      try {
        console.log("Traitement du nouveau logo:", logoFile.name);
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
        
        await writeFile(filePath, buffer);
        
        // Supprimer l'ancien logo s'il existe
        if (existingSponsor.logo) {
          const oldLogoPath = join(process.cwd(), 'public', existingSponsor.logo);
          if (existsSync(oldLogoPath)) {
            try {
              await unlink(oldLogoPath);
              console.log("Ancien logo supprimé:", existingSponsor.logo);
            } catch (unlinkError) {
              console.error("Erreur lors de la suppression de l'ancien logo:", unlinkError);
            }
          }
        }
        
        logoPath = relativePath;
        console.log("Nouveau logo sauvegardé:", relativePath);
      } catch (logoError) {
        console.error("Erreur lors du traitement du logo:", logoError);
        // Garder l'ancien logo plutôt que d'échouer
      }
    }

    // Mettre à jour le sponsor avec Prisma Client
    const updatedSponsor = await prisma.sponsor.update({
      where: {
        id: sponsorId
      },
      data: {
        name,
        description: description || undefined,
        logo: logoPath,
        website: website || undefined,
        level: level as any || "GOLD",
        visible
      }
    });
    
    console.log("Sponsor mis à jour avec succès:", updatedSponsor.id);
    return NextResponse.json(updatedSponsor);
  } catch (error: any) {
    console.error("Erreur lors de la mise à jour du sponsor:", error);
    return NextResponse.json(
      { message: "Erreur lors de la mise à jour du sponsor", error: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/events/[id]/sponsors/[sponsorId] - Supprimer un sponsor
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; sponsorId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { message: "Non autorisé" },
        { status: 401 }
      );
    }
    
    const { id, sponsorId } = await params;
    
    // Vérifier que le sponsor existe
    const existingSponsor = await prisma.sponsor.findFirst({
      where: {
        id: sponsorId,
        eventId: id
      }
    });
    
    if (!existingSponsor) {
      return NextResponse.json(
        { message: "Sponsor non trouvé" },
        { status: 404 }
      );
    }

    // Supprimer le logo s'il existe
    if (existingSponsor.logo) {
      const logoPath = join(process.cwd(), 'public', existingSponsor.logo);
      if (existsSync(logoPath)) {
        try {
          await unlink(logoPath);
          console.log("Logo supprimé:", existingSponsor.logo);
        } catch (error) {
          console.error("Erreur lors de la suppression du logo:", error);
        }
      }
    }

    // Supprimer le sponsor avec Prisma Client
    await prisma.sponsor.delete({
      where: {
        id: sponsorId
      }
    });

    return NextResponse.json({ message: "Sponsor supprimé avec succès" });
  } catch (error: any) {
    console.error("Erreur lors de la suppression du sponsor:", error);
    return NextResponse.json(
      { message: "Erreur lors de la suppression du sponsor", error: error.message },
      { status: 500 }
    );
  }
} 