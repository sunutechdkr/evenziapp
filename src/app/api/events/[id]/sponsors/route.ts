import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";
import { put } from '@vercel/blob';

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

// GET /api/events/[id]/sponsors - Récupérer la liste des sponsors
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { message: "Non autorisé" },
        { status: 401 }
      );
    }
    
    const paramsData = await params;
    const id = paramsData.id;
    
    // Vérifier que l'événement existe
    const event = await prisma.event.findUnique({
      where: { id },
    });
    
    if (!event) {
      return NextResponse.json(
        { message: "Événement non trouvé" },
        { status: 404 }
      );
    }

    // Récupérer les sponsors avec leurs statistiques
    const sponsors = await prisma.sponsor.findMany({
      where: { eventId: id },
      orderBy: { createdAt: 'desc' },
    });

    // Pour chaque sponsor, calculer les statistiques
    const sponsorsWithStats = await Promise.all(
      sponsors.map(async (sponsor: any) => {
        // Nombre de membres/participants associés au sponsor
        // (Participants de la même entreprise que le sponsor)
        const membersCount = await prisma.registration.count({
          where: {
            eventId: id,
            company: {
              contains: sponsor.name,
              mode: 'insensitive'
            }
          }
        });

        // Nombre de sessions où le sponsor intervient
        // (Sessions où le speaker contient le nom du sponsor)
        const sessionsCount = await prisma.event_sessions.count({
          where: {
            event_id: id,
            OR: [
              {
                speaker: {
                  contains: sponsor.name,
                  mode: 'insensitive'
                }
              },
              {
                description: {
                  contains: sponsor.name,
                  mode: 'insensitive'
                }
              }
            ]
          }
        });

        // Nombre de documents (à implémenter plus tard)
        const documentsCount = 0; // TODO: Ajouter table documents

        // Nombre de rendez-vous en attente liés au sponsor
        // (RDV où un participant de l'entreprise du sponsor est impliqué)
        const appointmentsCount = await prisma.appointment.count({
          where: {
            eventId: id,
            status: 'PENDING',
            OR: [
              {
                requester: {
                  company: {
                    contains: sponsor.name,
                    mode: 'insensitive'
                  }
                }
              },
              {
                recipient: {
                  company: {
                    contains: sponsor.name,
                    mode: 'insensitive'
                  }
                }
              }
            ]
          }
        });

        // Nombre de produits (à implémenter plus tard)
        const productsCount = 0; // TODO: Ajouter table products

        return {
          ...sponsor,
          stats: {
            members: membersCount,
            sessions: sessionsCount,
            documents: documentsCount,
            appointments: appointmentsCount,
            products: productsCount
          }
        };
      })
    );
    
    return NextResponse.json(sponsorsWithStats);
  } catch (error: unknown) {
    console.error("❌ Erreur lors de la récupération des sponsors:", error);
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    return NextResponse.json(
      { message: "Erreur lors de la récupération des sponsors", error: errorMessage },
      { status: 500 }
    );
  }
}

// POST /api/events/[id]/sponsors - Ajouter un nouveau sponsor
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
  
    if (!session) {
      return NextResponse.json(
        { message: "Non autorisé" },
        { status: 401 }
      );
    }
    
    // Attendre les paramètres avant d'y accéder
    const paramsData = await params;
    const id = paramsData.id;
    console.log("POST sponsor - ID événement:", id);
    
    // Vérifier que l'événement existe
    const event = await prisma.event.findUnique({
      where: { id },
    });
    
    if (!event) {
      console.log("Événement non trouvé:", id);
      return NextResponse.json(
        { message: "Événement non trouvé" },
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
    
    console.log("Données du sponsor:", { name, level, visible });

    if (!name) {
      return NextResponse.json(
        { message: "Le nom du sponsor est requis" },
        { status: 400 }
      );
    }

    let logoPath = null;

    // Si un logo a été envoyé, l'uploader
    if (logoFile && logoFile.size > 0) {
      console.log("Traitement du logo:", logoFile.name, "Taille:", logoFile.size);
      logoPath = await uploadLogo(logoFile);
      
      if (!logoPath) {
        console.warn("⚠️ Upload du logo échoué, création du sponsor sans logo");
      }
    }

    // Créer le nouveau sponsor avec Prisma Client
    const sponsor = await prisma.sponsor.create({
      data: {
        name,
        description: description || undefined,
        logo: logoPath,
        website: website || undefined,
        level: level || "GOLD",
        visible,
        eventId: id,
      }
    });
    
    console.log("✅ Sponsor créé avec succès:", sponsor.id, "Logo:", logoPath);
    return NextResponse.json(sponsor, { status: 201 });
  } catch (error: unknown) {
    console.error("❌ Erreur lors de la création du sponsor:", error);
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    return NextResponse.json(
      { message: "Erreur lors de la création du sponsor", error: errorMessage },
      { status: 500 }
    );
  }
} 