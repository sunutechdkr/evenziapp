import Link from 'next/link';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from '@/lib/prisma';
import { format } from "date-fns";

interface EventRegistrationsPageProps {
  params: Promise<{
    id: string;
  }>;
}

type Registration = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  type: string;
  createdAt: Date;
  checkedIn: boolean;
  checkInTime?: Date | null;
  eventId: string;
  qrCode: string;
  shortCode: string;
  updatedAt: Date;
  jobTitle?: string | null;
  company?: string | null;
};

export default async function EventRegistrationsPage({ params }: EventRegistrationsPageProps) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  
  // Check if user is logged in and has admin role
  if (!session || session.user.role !== "ADMIN") {
    redirect("/auth/signin?callbackUrl=/admin/events");
  }
  
  // Fetch event details
  const event = await prisma.event.findUnique({
    where: { id },
  });
  
  if (!event) {
    redirect("/admin/events");
  }
  
  // Check if the user is the owner of the event
  if (event.userId !== session.user.id) {
    redirect("/admin/events");
  }
  
  // Fetch registrations for the event
  const registrations = await prisma.registration.findMany({
    where: {
      eventId: id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">{event.name}: Registrations</h1>
          <p className="text-gray-500 mt-1">
            {format(new Date(event.startDate), "MMMM d, yyyy")}
            {event.startTime && ` at ${event.startTime}`} • {event.location}
          </p>
        </div>
        <div className="flex space-x-3">
          <Link
            href={`/admin/events`}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
          >
            Back to Events
          </Link>
          <Link
            href={`/checkin/${event.slug}`}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Check-in Page
          </Link>
        </div>
      </div>
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-medium text-gray-900">Registered Attendees ({registrations.length})</h2>
          <button 
            onClick={() => {
              // Create CSV content
              const headers = ['First Name', 'Last Name', 'Email', 'Phone', 'Type', 'Registration Date', 'Checked In'];
              const rows = registrations.map((reg: Registration) => [
                reg.firstName,
                reg.lastName,
                reg.email,
                reg.phone,
                reg.type,
                new Date(reg.createdAt).toLocaleString(),
                reg.checkedIn ? 'Yes' : 'No'
              ]);
              
              const csvContent = [
                headers.join(','),
                ...rows.map((row: string[]) => row.join(','))
              ].join('\n');
              
              // Create download link
              const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.setAttribute('href', url);
              link.setAttribute('download', `${event.name}-registrations.csv`);
              link.click();
            }}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
          >
            Export CSV
          </button>
        </div>
        
        {registrations.length === 0 ? (
          <div className="text-center py-12 px-4">
            <p className="text-gray-500">No registrations yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Attendee
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Registration Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {registrations.map((registration: Registration) => (
                  <tr key={registration.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{registration.firstName} {registration.lastName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{registration.email}</div>
                      <div className="text-sm text-gray-500">{registration.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                        {registration.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(registration.createdAt), "MMM d, yyyy")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {registration.checkedIn ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Checked In
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Not Checked In
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-3">
                        {!registration.checkedIn && (
                          <button
                            className="text-indigo-600 hover:text-indigo-900"
                            onClick={async () => {
                              await prisma.registration.update({
                                where: { id: registration.id },
                                data: {
                                  checkedIn: true,
                                  checkInTime: new Date(),
                                },
                              });
                            }}
                          >
                            Check In
                          </button>
                        )}
                        <button
                          className="text-gray-600 hover:text-gray-900"
                          onClick={() => {
                            // Logic to view or print badge
                          }}
                        >
                          View Badge
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
} 