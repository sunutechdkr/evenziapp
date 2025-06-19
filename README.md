# 🎉 InEvent - Event Management Platform

A modern, full-stack event management platform built with Next.js 15, TypeScript, and Tailwind CSS.

## ✨ Features

- **Event Management**: Create, edit, and manage events with ease
- **Participant Registration**: Streamlined registration process with QR codes
- **Email Campaigns**: Automated email marketing with templates
- **Real-time Analytics**: Track registrations, check-ins, and engagement
- **Multi-role Support**: Admin, organizer, and participant dashboards
- **Responsive Design**: Mobile-first approach with modern UI
- **Authentication**: Secure authentication with NextAuth.js
- **Database**: PostgreSQL with Prisma ORM

## 🚀 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: PostgreSQL + Prisma
- **Authentication**: NextAuth.js
- **Email**: Resend
- **Deployment**: Vercel
- **State Management**: React Hooks + Context

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/sunutechdkr/ineventapp.git
   cd ineventapp
   ```

2. **Install dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Environment Setup**
   ```bash
   cp env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Database Setup**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run Development Server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔧 Environment Variables

Create a `.env.local` file with the following variables:

```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/inevent"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# Email (Resend)
RESEND_API_KEY="your-resend-api-key"

# Upload (Optional)
NEXT_PUBLIC_UPLOAD_URL="your-upload-service-url"
```

## 📁 Project Structure

```
src/
├── app/                    # Next.js 15 App Router
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard pages
│   └── event/             # Public event pages
├── components/            # Reusable UI components
├── lib/                   # Utility functions and configurations
├── types/                 # TypeScript type definitions
└── generated/             # Generated files (Prisma client)

prisma/
└── schema.prisma          # Database schema

public/                    # Static assets
```

## 🎯 Key Features

### Event Management
- Create and customize events
- Manage sessions and speakers
- Handle sponsors and partnerships
- Generate QR codes for check-ins

### Participant Experience
- Easy registration process
- Email confirmations and reminders
- Digital badges and certificates
- Mobile-friendly interface

### Analytics & Reporting
- Real-time dashboard
- Registration analytics
- Check-in tracking
- Email campaign metrics

### Email Marketing
- Custom email templates
- Automated campaigns
- Recipient management
- Delivery tracking

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript checks

### Database Commands

- `npx prisma generate` - Generate Prisma client
- `npx prisma db push` - Push schema to database
- `npx prisma studio` - Open Prisma Studio
- `npx prisma migrate dev` - Create and apply migrations

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically on every push

### Manual Deployment

```bash
npm run build
npm run start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Development**: SunuTech Team
- **Design**: Modern UI/UX principles
- **Architecture**: Full-stack Next.js application

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Contact: [Your contact information]

---

Built with ❤️ using Next.js 15 and modern web technologies. 