import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Test session API appelée');
    
    const session = await getServerSession(authOptions);
    
    console.log('Session détaillée:', {
      session: session,
      hasSession: !!session,
      hasUser: !!session?.user,
      userEmail: session?.user?.email,
      userRole: session?.user?.role,
      expires: session?.expires,
    });
    
    return NextResponse.json({
      success: true,
      hasSession: !!session,
      session: session ? {
        user: {
          email: session.user?.email,
          name: session.user?.name,
          role: session.user?.role,
        },
        expires: session.expires,
      } : null,
      message: session ? 'Session active' : 'Pas de session',
    });
    
  } catch (error) {
    console.error('❌ Erreur test session:', error);
    return NextResponse.json(
      { error: 'Erreur test session', details: String(error) },
      { status: 500 }
    );
  }
} 