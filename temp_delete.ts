// DELETE /api/events/[id] - Supprimer un événement
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: "Vous devez être connecté pour supprimer un événement" },
        { status: 401 }
      );
    }

    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { error: "L'identifiant de l'événement est manquant" },
        { status: 400 }
      );
    }

    // Vérifier que l'événement existe
    const existingEvent = await prisma.event.findUnique({
      where: { id }
    });
    
    if (!existingEvent) {
      return NextResponse.json(
        { error: "Événement non trouvé" },
        { status: 404 }
      );
    }

    // Vérifier les autorisations (propriétaire de l'événement ou admin)
    if (existingEvent.userId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Vous n'êtes pas autorisé à supprimer cet événement" },
        { status: 403 }
      );
    }

    // Supprimer l'événement
    await prisma.event.delete({
      where: { id }
    });

    return NextResponse.json(
      { message: "Événement supprimé avec succès" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors de la suppression de l'événement:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la suppression" },
      { status: 500 }
    );
  }
}
