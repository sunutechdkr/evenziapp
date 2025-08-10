import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const FIRST_NAMES = [
  "Abdallah","Mamadou","Ibrahima","Cheikh","Pape","Moussa","Alioune","Serigne","Moustapha","Amadou",
  "Fatou","Aminata","Awa","Coumba","Mame","Sokhna","Astou","Khady","Adji","Bineta"
];

const LAST_NAMES = [
  "Diop","Ndiaye","Ba","Sarr","Fall","Sy","Faye","Gueye","Diallo","Sow","Ka","Thiam","Diagne","Diouf"
];

const COMPANIES = [
  "SenPharma Labs","Dakar Biotech","Pharma Sénégal","Baobab Health","Atlantic Médical","SunuCare","Sahel Diagnostics"
];

const JOB_TITLES = [
  "Pharmacien","Responsable Qualité","Chef de produit","Commercial Santé","Consultant Réglementaire",
  "Chercheur Clinique","Data Analyst Santé","Responsable Partenariats","CEO","COO"
];

const INTERESTS = [
  "Pharmacie","Biotechnologie","Réglementation","Essais cliniques","Distribution","Santé digitale","IA Santé","Partenariats"
];

const GOALS = [
  "Networking","Partenariat","Investissement","Apprentissage","Recrutement","Vente","Collaboration"
];

function toEmail(first: string, last: string, idx: number) {
  const slug = `${first}.${last}`.toLowerCase().normalize("NFD").replace(/[^a-z.]/g, "");
  return `${slug}+senpharma${idx}@evenzi.io`;
}

function randomPhone() {
  const num = Math.floor(1000000 + Math.random() * 8999999);
  return `+221 77 ${num}`;
}

function randomUniqueFrom(source: string[], count: number): string[] {
  const bag = [...source];
  const pick: string[] = [];
  while (pick.length < count && bag.length > 0) {
    const idx = Math.floor(Math.random() * bag.length);
    pick.push(bag[idx]);
    bag.splice(idx, 1);
  }
  return pick;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    const seedKeyHeader = request.headers.get("x-seed-key");
    const allowedByKey = seedKeyHeader && process.env.SEED_ADMIN_KEY && seedKeyHeader === process.env.SEED_ADMIN_KEY;

    if (!session?.user?.id && !allowedByKey) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    if (session?.user && session.user.role !== "ADMIN" && !allowedByKey) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const { count: paramCount } = await request.json().catch(() => ({ count: 30 }));
    const count = Math.max(1, Math.min(60, Number(paramCount) || 30));

    const event = await prisma.event.findFirst({
      where: {
        OR: [
          { name: { contains: "Senpharma", mode: "insensitive" } },
          { slug: { contains: "senpharma", mode: "insensitive" } },
        ],
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Événement Senpharma introuvable" }, { status: 404 });
    }

    let created = 0;

    for (let i = 0; i < count; i += 1) {
      const first = randomItem(FIRST_NAMES);
      const last = randomItem(LAST_NAMES);
      const name = `${first} ${last}`;
      const email = toEmail(first, last, i + 1);
      const phone = randomPhone();
      const company = randomItem(COMPANIES);
      const jobTitle = randomItem(JOB_TITLES);

      const user = await prisma.user.upsert({
        where: { email },
        update: { name },
        create: { name, email },
      });

      const existingReg = await prisma.registration.findFirst({ where: { email, eventId: event.id } });
      if (existingReg) {
        await prisma.registration.update({
          where: { id: existingReg.id },
          data: { firstName: first, lastName: last, phone, company, jobTitle },
        });
      } else {
        // qrCode unique
        const qr = crypto.randomUUID();
        await prisma.registration.create({
          data: {
            firstName: first,
            lastName: last,
            email,
            phone,
            type: "PARTICIPANT",
            eventId: event.id,
            qrCode: qr,
            company,
            jobTitle,
          },
        });
      }

      const interests = randomUniqueFrom(INTERESTS, 3);
      const goals = randomUniqueFrom(GOALS, 2);
      const headline = `${jobTitle} chez ${company}`;
      const bio = `Professionnel sénégalais du secteur santé/pharma. Intéressé par ${interests.join(", ").toLowerCase()}.`;

      await prisma.userMatchProfile.upsert({
        where: { userId_eventId: { userId: user.id, eventId: event.id } },
        update: {
          headline,
          bio,
          interests,
          goals,
          jobTitle,
          company,
          availability: ["09:00 - 10:00", "10:00 - 11:00", "14:00 - 15:00"],
        },
        create: {
          userId: user.id,
          eventId: event.id,
          headline,
          bio,
          interests,
          goals,
          jobTitle,
          company,
          availability: ["09:00 - 10:00", "10:00 - 11:00", "14:00 - 15:00"],
        },
      });

      created += 1;
    }

    return NextResponse.json({ success: true, created, eventId: event.id, eventName: event.name });
  } catch (error: any) {
    console.error("❌ seed-senpharma error:", error);
    return NextResponse.json({ error: error.message || "Erreur serveur" }, { status: 500 });
  }
}


