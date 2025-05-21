import { NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

interface RouteContext {
  params: {
    id: string;
    registrationId: string;
  };
}

// GET /api/events/[id]/registrations/[registrationId] - Get a specific registration
export async function GET(request: Request, context: RouteContext) {
  const { id, registrationId } = context.params;
  
  try {
    // Get the registration
    const registration = await prisma.registration.findUnique({
      where: {
        id: registrationId,
        eventId: id,
      },
      include: {
        event: {
          select: {
            id: true,
            name: true,
            location: true,
            startDate: true,
            endDate: true,
            slug: true,
          }
        }
      }
    });
    
    if (!registration) {
      return NextResponse.json(
        { message: "Registration not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      registration,
    });
    
  } catch (error) {
    console.error("Error fetching registration:", error);
    return NextResponse.json(
      { message: "Error fetching registration" },
      { status: 500 }
    );
  }
}

// PUT /api/events/[id]/registrations/[registrationId] - Update a registration
export async function PUT(request: Request, context: RouteContext) {
  // Check for authentication
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    );
  }
  
  const { id, registrationId } = context.params;
  
  try {
    // Check if the registration exists
    const existingRegistration = await prisma.registration.findUnique({
      where: {
        id: registrationId,
        eventId: id,
      },
    });
    
    if (!existingRegistration) {
      return NextResponse.json(
        { message: "Registration not found" },
        { status: 404 }
      );
    }
    
    // Parse request body
    const { firstName, lastName, email, phone, jobTitle, company, type } = await request.json();
    
    // Validate required fields
    if (!firstName || !lastName || !email || !phone) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }
    
    // Update the registration
    const updatedRegistration = await prisma.registration.update({
      where: {
        id: registrationId,
      },
      data: {
        firstName,
        lastName,
        email,
        phone,
        type: type || "PARTICIPANT",
        jobTitle,
        company,
      },
    });
    
    // Loguer les informations additionnelles pour référence future
    if (jobTitle || company) {
      console.log(`Additional info for updated registration ${updatedRegistration.id}: jobTitle=${jobTitle}, company=${company}`);
    }
    
    return NextResponse.json({
      registration: updatedRegistration,
      message: "Registration updated successfully"
    });
    
  } catch (error) {
    console.error("Error updating registration:", error);
    return NextResponse.json(
      { message: "Error updating registration" },
      { status: 500 }
    );
  }
}

// DELETE /api/events/[id]/registrations/[registrationId] - Delete a registration
export async function DELETE(request: Request, context: RouteContext) {
  // Check for authentication
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    );
  }
  
  const { id, registrationId } = context.params;
  
  try {
    // Check if the registration exists
    const existingRegistration = await prisma.registration.findUnique({
      where: {
        id: registrationId,
        eventId: id,
      },
    });
    
    if (!existingRegistration) {
      return NextResponse.json(
        { message: "Registration not found" },
        { status: 404 }
      );
    }
    
    // Delete the registration
    await prisma.registration.delete({
      where: {
        id: registrationId,
      },
    });
    
    return NextResponse.json({
      message: "Registration deleted successfully"
    });
    
  } catch (error) {
    console.error("Error deleting registration:", error);
    return NextResponse.json(
      { message: "Error deleting registration" },
      { status: 500 }
    );
  }
} 