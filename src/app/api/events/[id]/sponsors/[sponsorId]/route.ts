import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { writeFile, unlink } from "fs/promises";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";
import { mkdir } from "fs/promises";
import { existsSync } from "fs";
import { put, del } from '@vercel/blob';

type SponsorLevel = 'PLATINUM' | 'GOLD' | 'SILVER' | 'BRONZE' | 'PARTNER' | 'MEDIA' | 'OTHER';

// Fonction utilitaire pour déterminer si utiliser Blob storage
function shouldUseBlob(): boolean {
  const useBlobStorage = process.env.NEXT_PUBLIC_USE_BLOB_STORAGE === 'true';
  const migrationTypes = process.env.BLOB_MIGRATION_TYPES?.split(',') || [];
  return useBlobStorage && migrationTypes.includes('sponsors');
}

// Fonction utilitaire pour uploader via Blob ou local
async function uploadLogo(logoFile: File): Promise<string | null> {
  try {
    const useBlob = shouldUseBlob();
    console.log(`📁 Upload logo sponsor via ${useBlob ? 'Vercel Blob' : 'stockage local'}`);

    if (useBlob) {
      // Upload vers Vercel Blob
      const timestamp = Date.now();
      const extension = logoFile.name.split('.').pop() || 'jpg';
      const filename = `sponsor_${timestamp}.${extension}`;
      const pathname = `sponsors/${filename}`;

      const { url } = await put(pathname, logoFile, {
        access: 'public',
      });

      console.log('✅ Logo uploadé vers Blob:', url);
      return url;
    } else {
      // Upload local (ancien système)
      const bytes = await logoFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      const uniqueFilename = `${uuidv4()}-${logoFile.name.replace(/\s/g, '_')}`;
      const relativePath = `/uploads/sponsors/${uniqueFilename}`;
      const uploadDir = join(process.cwd(), 'public', 'uploads', 'sponsors');
      
      await mkdir(uploadDir, { recursive: true });
      const filePath = join(uploadDir, uniqueFilename);
      await writeFile(filePath, buffer);
      
      console.log('✅ Logo uploadé localement:', relativePath);
      return relativePath;
    }
  } catch (error) {
    console.error('❌ Erreur lors de l\'upload du logo:', error);
    return null;
  }
}

// Fonction utilitaire pour supprimer un ancien logo
async function deleteOldLogo(logoUrl: string): Promise<void> {
  try {
    const useBlob = shouldUseBlob();
    
    if (useBlob && logoUrl.includes('vercel-storage.com')) {
      // Supprimer depuis Vercel Blob
      await del(logoUrl);
      console.log('✅ Ancien logo supprimé de Blob:', logoUrl);
    } else if (!useBlob && logoUrl.startsWith('/uploads/')) {
      // Supprimer du stockage local
      const oldLogoPath = join(process.cwd(), 'public', logoUrl);
      if (existsSync(oldLogoPath)) {
        await unlink(oldLogoPath);
        console.log('✅ Ancien logo supprimé localement:', logoUrl);
      }
    }
  } catch (error) {
    console.error('⚠️ Erreur lors de la suppression de l\'ancien logo:', error);
    // Ne pas faire échouer la requête pour une erreur de suppression
  }
}

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
    const level = formData.get("level")?.toString() as SponsorLevel;
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

    // Si un nouveau logo a été envoyé, l'uploader
    if (logoFile && logoFile.size > 0) {
      console.log("Traitement du nouveau logo:", logoFile.name, "Taille:", logoFile.size);
      
      const newLogoPath = await uploadLogo(logoFile);
      
      if (newLogoPath) {
        // Supprimer l'ancien logo si un nouveau a été uploadé avec succès
        if (existingSponsor.logo) {
          await deleteOldLogo(existingSponsor.logo);
        }
        logoPath = newLogoPath;
      } else {
        console.warn("⚠️ Upload du nouveau logo échoué, conservation de l'ancien");
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
        level: level || "GOLD",
        visible
      }
    });
    
    console.log("✅ Sponsor mis à jour avec succès:", updatedSponsor.id, "Logo:", logoPath);
    return NextResponse.json(updatedSponsor);
  } catch (error: unknown) {
    console.error("❌ Erreur lors de la mise à jour du sponsor:", error);
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    return NextResponse.json(
      { message: "Erreur lors de la mise à jour du sponsor", error: errorMessage },
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
      await deleteOldLogo(existingSponsor.logo);
    }

    // Supprimer le sponsor avec Prisma Client
    await prisma.sponsor.delete({
      where: {
        id: sponsorId
      }
    });

    console.log("✅ Sponsor supprimé avec succès:", sponsorId);
    return NextResponse.json({ message: "Sponsor supprimé avec succès" });
  } catch (error: unknown) {
    console.error("❌ Erreur lors de la suppression du sponsor:", error);
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    return NextResponse.json(
      { message: "Erreur lors de la suppression du sponsor", error: errorMessage },
      { status: 500 }
    );
  }
} 