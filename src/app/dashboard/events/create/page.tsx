import CreateEventForm from "@/components/dashboard/CreateEventForm";

export default function CreateEventPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Créer un nouvel événement</h1>
      <CreateEventForm />
    </div>
  );
} 