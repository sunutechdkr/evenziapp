import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user.role !== 'ORGANIZER' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { id: eventId } = await params;

    // Statistiques générales des campagnes
    const totalCampaigns = await prisma.emailCampaign.count({
      where: { eventId }
    });

    const sentCampaigns = await prisma.emailCampaign.count({
      where: { 
        eventId,
        status: 'SENT'
      }
    });

    const scheduledCampaigns = await prisma.emailCampaign.count({
      where: { 
        eventId,
        status: 'SCHEDULED'
      }
    });

    const failedCampaigns = await prisma.emailCampaign.count({
      where: { 
        eventId,
        status: 'FAILED'
      }
    });

    // Statistiques des emails
    const emailStats = await prisma.emailCampaign.aggregate({
      where: { eventId },
      _sum: {
        totalRecipients: true,
        successCount: true,
        failureCount: true
      }
    });

    // Dernières campagnes
    const recentCampaigns = await prisma.emailCampaign.findMany({
      where: { eventId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        name: true,
        status: true,
        totalRecipients: true,
        successCount: true,
        failureCount: true,
        sentAt: true,
        scheduledAt: true,
        createdAt: true
      }
    });

    // Statistiques par statut d'email
    const emailStatusStats = await prisma.emailLog.groupBy({
      by: ['status'],
      where: {
        campaign: {
          eventId
        }
      },
      _count: {
        status: true
      }
    });

    // Taux d'ouverture et de clics (si disponible)
    const openedEmails = await prisma.emailLog.count({
      where: {
        campaign: { eventId },
        status: 'OPENED'
      }
    });

    const clickedEmails = await prisma.emailLog.count({
      where: {
        campaign: { eventId },
        status: 'CLICKED'
      }
    });

    return NextResponse.json({
      campaigns: {
        total: totalCampaigns,
        sent: sentCampaigns,
        scheduled: scheduledCampaigns,
        failed: failedCampaigns
      },
      emails: {
        totalSent: emailStats._sum.totalRecipients || 0,
        successful: emailStats._sum.successCount || 0,
        failed: emailStats._sum.failureCount || 0,
        opened: openedEmails,
        clicked: clickedEmails,
        deliveryRate: emailStats._sum.totalRecipients ? 
          Math.round(((emailStats._sum.successCount || 0) / emailStats._sum.totalRecipients) * 100) : 0,
        openRate: emailStats._sum.successCount ? 
          Math.round((openedEmails / (emailStats._sum.successCount || 1)) * 100) : 0,
        clickRate: openedEmails ? 
          Math.round((clickedEmails / openedEmails) * 100) : 0
      },
      recentCampaigns,
      statusBreakdown: emailStatusStats.reduce((acc: Record<string, number>, stat: { status: string; _count: { status: number } }) => {
        acc[stat.status] = stat._count.status;
        return acc;
      }, {} as Record<string, number>)
    });

  } catch (error) {
    console.error('Erreur API campaigns stats:', error);
    return NextResponse.json(
      { error: 'Erreur lors du chargement des statistiques' },
      { status: 500 }
    );
  }
} 