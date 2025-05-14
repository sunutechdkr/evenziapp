import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

// GET /api/events - Récupérer la liste des événements
export async function GET() {
  try {
    // Utiliser une requête SQL directe
    const events = await prisma.$queryRaw`
      SELECT * FROM events ORDER BY created_at DESC
    `;
    
    return NextResponse.json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue" },
      { status: 500 }
    );
  }
}
