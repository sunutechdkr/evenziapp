import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from '@/lib/prisma';
import { format } from "date-fns";
import { CreateEventButton } from "@/components/admin/CreateEventButton";



export default async function AdminEventsPage() {
  const session = await getServerSession(authOptions);
  
  // Check if user is logged in and has admin role
  if (!session || session.user.role !== "ADMIN") {
    redirect("/auth/signin?callbackUrl=/admin/events");
  }
  
  // Fetch all events
  const events = await prisma.event.findMany({
    orderBy: {
      startDate: "desc",
    },
    include: {
      _count: {
        select: {
          registrations: true,
        },
      },
    },
  });
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Manage Events</h1>
        <CreateEventButton />
      </div>
      
      {events.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-gray-300 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-1">No events found</h3>
          <p className="text-gray-500 mb-4">Get started by creating your first event.</p>
          <CreateEventButton />
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Event Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Registrations
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Public URL
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {events.map((event: any) => (
                <tr key={event.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{event.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {format(new Date(event.startDate), "MMMM d, yyyy")}
                    </div>
                    <div className="text-sm text-gray-500">
                      {event.startTime || format(new Date(event.startDate), "h:mm a")}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{event.location}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{event._count.registrations}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <a 
                      href={`/event/${event.slug}`} 
                      target="_blank"
                      className="text-indigo-600 hover:text-indigo-900 text-sm"
                    >
                      /event/{event.slug}
                    </a>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-3">
                      <Link
                        href={`/admin/events/${event.id}/registrations`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Registrations
                      </Link>
                      <Link
                        href={`/checkin/${event.slug}`}
                        className="text-green-600 hover:text-green-900"
                      >
                        Check-in
                      </Link>
                      <Link
                        href={`/admin/events/${event.id}/edit`}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        Edit
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
} 