import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { cleanupExpiredOtpCodes } from "@/lib/cleanup";

export async function POST() {
  try {
    // Vérifier que l'utilisateur est authentifié et est admin
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 403 }
      );
    }

    // Effectuer le nettoyage
    const deletedCount = await cleanupExpiredOtpCodes();

    return NextResponse.json({
      success: true,
      message: `${deletedCount} codes OTP supprimés`,
      deletedCount,
    });

  } catch (error) {
    console.error("Erreur lors du nettoyage OTP:", error);
    return NextResponse.json(
      { error: "Erreur lors du nettoyage" },
      { status: 500 }
    );
  }
} 