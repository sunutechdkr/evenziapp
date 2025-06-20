import NextAuth from "next-auth";
import { authOptions } from '@/lib/auth';

const handler = NextAuth(authOptions);

// Export named handlers for NextJS 13+
export { handler as GET, handler as POST };
