import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    console.log('=== TEST OTP API ===');
    
    // Test 1: Vérifier la clé API
    console.log('1. Clé API Resend:', process.env.RESEND_API_KEY ? 'Configurée' : 'NON CONFIGURÉE');
    
    // Test 2: Vérifier la connexion à la base de données
    console.log('2. Test connexion base de données...');
    const dbTest = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('   Connexion DB OK:', dbTest);
    
    // Test 3: Vérifier les participants
    console.log('3. Test participants...');
    const participantCount = await prisma.registration.count();
    console.log('   Nombre de participants:', participantCount);
    
    if (participantCount > 0) {
      const firstParticipant = await prisma.registration.findFirst({
        select: {
          email: true,
          firstName: true,
          lastName: true,
        },
      });
      console.log('   Premier participant:', firstParticipant);
    }
    
    // Test 4: Test envoi email simple
    console.log('4. Test envoi email...');
    const emailResult = await resend.emails.send({
      from: 'InEvent <noreply@ineventapp.com>',
      to: ['bouba@ineventapp.com'],
      subject: 'Test API OTP',
      html: '<h1>Test API OTP - Tout fonctionne !</h1>',
    });
    
    console.log('   Résultat email:', emailResult);
    
    return NextResponse.json({
      success: true,
      tests: {
        resendKey: !!process.env.RESEND_API_KEY,
        database: !!dbTest,
        participantCount,
        emailSent: !emailResult.error,
      },
    });
    
  } catch (error) {
    console.error('❌ Erreur dans test OTP:', error);
    return NextResponse.json(
      { 
        error: 'Erreur dans le test',
        details: error.message,
        stack: error.stack,
      },
      { status: 500 }
    );
  }
} 