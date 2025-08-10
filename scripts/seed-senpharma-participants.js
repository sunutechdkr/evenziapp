// Seed ~30 Senegalese participants for the "Senpharma" event into Neon via Prisma
// Usage: node scripts/seed-senpharma-participants.js [count]

/* eslint-disable no-console */
// Project uses a generated Prisma client under src/generated/prisma
// Import from there to ensure compatibility across environments (Neon)
const { PrismaClient } = require('../src/generated/prisma');
const crypto = require('crypto');

const prisma = new PrismaClient();

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

const SENEGAL_FIRST_NAMES = [
  'Abdallah','Mamadou','Ibrahima','Cheikh','Pape','Moussa','Alioune','Serigne','Moustapha','Amadou',
  'Fatou','Aminata','Awa','Coumba','Mame','Sokhna','Astou','Khady','Adji','Bineta'
];

const SENEGAL_LAST_NAMES = [
  'Diop','Ndiaye','Ba','Sarr','Fall','Sy','Ndiaye','Faye','Gueye','Diallo','Sow','Ka','Thiam','Diagne','Diouf'
];

const COMPANIES = [
  'SenPharma Labs','Dakar Biotech','Pharma Sénégal','Baobab Health','Atlantic Médical','SunuCare','Sahel Diagnostics'
];

const JOB_TITLES = [
  'Pharmacien','Responsable Qualité','Chef de produit','Commercial Santé','Consultant Réglementaire',
  'Chercheur Clinique','Data Analyst Santé','Responsable Partenariats','CEO','COO'
];

const INTERESTS = [
  'Pharmacie','Biotechnologie','Réglementation','Essais cliniques','Distribution','Santé digitale','IA Santé','Partenariats'
];

const GOALS = [
  'Networking','Partenariat','Investissement','Apprentissage','Recrutement','Vente','Collaboration'
];

function generateEmail(first, last, i) {
  const slug = `${first}.${last}`.toLowerCase().normalize('NFD').replace(/[^a-z.]/g, '');
  return `${slug}+senpharma${i}@evenzi.io`;
}

function generateQrCode() {
  return crypto.randomBytes(16).toString('hex');
}

async function main() {
  const count = parseInt(process.argv[2], 10) || 30;
  console.log(`🌱 Seeding ${count} participants for Senpharma...`);

  // Find event by name/slug contains Senpharma (case-insensitive)
  const event = await prisma.event.findFirst({
    where: {
      OR: [
        { name: { contains: 'Senpharma', mode: 'insensitive' } },
        { slug: { contains: 'senpharma', mode: 'insensitive' } }
      ]
    }
  });

  if (!event) {
    console.error('❌ Event "Senpharma" not found. Please create the event first.');
    process.exit(1);
  }

  const created = [];

  for (let i = 0; i < count; i += 1) {
    const firstName = randomItem(SENEGAL_FIRST_NAMES);
    const lastName = randomItem(SENEGAL_LAST_NAMES);
    const name = `${firstName} ${lastName}`;
    const email = generateEmail(firstName, lastName, i + 1);
    const phone = `+221 77 ${Math.floor(1000000 + Math.random() * 8999999)}`;
    const company = randomItem(COMPANIES);
    const jobTitle = randomItem(JOB_TITLES);

    // Upsert user
    const user = await prisma.user.upsert({
      where: { email },
      update: { name },
      create: { name, email },
    });

    // Create or update registration (by email + eventId)
    const existingReg = await prisma.registration.findFirst({ where: { email, eventId: event.id } });
    if (existingReg) {
      await prisma.registration.update({
        where: { id: existingReg.id },
        data: { firstName, lastName, phone, company, jobTitle },
      });
    } else {
      await prisma.registration.create({
        data: { firstName, lastName, email, phone, type: 'PARTICIPANT', eventId: event.id, qrCode: generateQrCode(), company, jobTitle },
      });
    }

    // Create or update matchmaking profile
    const interests = Array.from(new Set([randomItem(INTERESTS), randomItem(INTERESTS), randomItem(INTERESTS)]));
    const goals = Array.from(new Set([randomItem(GOALS), randomItem(GOALS)]));
    const headline = `${jobTitle} chez ${company}`;
    const bio = `Professionnel sénégalais actif dans la santé/pharmacie. Intéressé par ${interests.join(', ').toLowerCase()}.`;

    await prisma.userMatchProfile.upsert({
      where: { userId_eventId: { userId: user.id, eventId: event.id } },
      update: { headline, bio, interests, goals, jobTitle, company, availability: ['09:00 - 10:00','10:00 - 11:00','14:00 - 15:00'] },
      create: { userId: user.id, eventId: event.id, headline, bio, interests, goals, jobTitle, company, availability: ['09:00 - 10:00','10:00 - 11:00','14:00 - 15:00'] },
    });

    created.push({ name, email });
  }

  console.log(`✅ Created/updated ${created.length} participants for event ${event.name}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


