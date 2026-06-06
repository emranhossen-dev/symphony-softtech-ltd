# Symphony Institute of Technology

A comprehensive training centre management system built with Next.js 14, TypeScript, and Tailwind CSS.

## Features

### 🎓 Training Management
- Category-based training programs (Government, Online, Offline, Recorded)
- Course management and enrollment system
- Student progress tracking
- Certificate generation

### 👥 User Management
- Multi-role authentication system (Admin, Employee, Mentor, Student)
- User registration and profile management
- Role-based access control (RBAC)

### 📊 Dashboard & Analytics
- Admin dashboard with comprehensive statistics
- Student enrollment tracking
- Revenue and performance analytics
- Real-time data updates

### 💬 Communication
- WhatsApp integration for notifications
- In-app messaging system
- Email notifications

### 🏗️ Technical Features
- Next.js 14 with App Router
- TypeScript for type safety
- Tailwind CSS for responsive design
- Prisma ORM for database management
- JWT-based authentication
- RESTful API architecture

## Installation

1. Clone the repository:
```bash
git clone https://github.com/faiyazsumon786/Symphony-Institute-of-Technology.git
cd Symphony-Institute-of-Technology
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Set up the database:
```bash
npm run db:push  # Safe option for development - no migration history required
# OR for production migrations:
npm run db:migrate <migration-name>  # Use safe migration script with prompts
npx prisma generate
```

## ⚠️ Database Migration Safety

**CRITICAL:** Never run `npx prisma migrate dev` directly without understanding the consequences. It can reset your database and delete all data.

### Safe Migration Practices

**For Development:**
- Use `npm run db:push` to apply schema changes without migration history
- This is safer and won't reset your database
- Use `npx prisma studio` to view database contents

**For Production:**
- Use `npm run db:migrate <migration-name>` with the safe migration script
- The script will prompt for confirmation before proceeding
- Always have a database backup before migrating
- Review the `.windsurf/workflows/database-migration.md` for detailed guidelines

### What Happened Before
A migration reset caused complete data loss on 2026-06-05. The safe migration workflow has been implemented to prevent this from happening again. See `.windsurf/workflows/database-migration.md` for the full post-mortem and prevention guidelines.

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── admin/             # Admin dashboard and management
│   ├── employee/          # Employee portal
│   ├── mentor/            # Mentor dashboard
│   ├── student/           # Student portal
│   └── api/               # API routes
├── components/            # Reusable React components
│   ├── admin/            # Admin-specific components
│   ├── employee/         # Employee-specific components
│   ├── mentor/           # Mentor-specific components
│   ├── student/          # Student-specific components
│   └── ui/               # General UI components
├── contexts/              # React contexts
├── hooks/                 # Custom React hooks
├── lib/                   # Utility libraries
└── prisma/               # Database schema and migrations
```

## User Roles

### Admin
- Full system access
- User management
- Course and category management
- Analytics and reporting

### Employee
- Student enrollment management
- Follow-up management
- Course assignment

### Mentor
- Course management
- Student progress tracking
- Homework assignment

### Student
- Course enrollment
- Progress tracking
- Certificate access

## Technologies Used

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API routes, Prisma ORM
- **Database**: PostgreSQL (configurable)
- **Authentication**: JWT with refresh tokens
- **Styling**: Tailwind CSS with custom components
- **Icons**: Lucide React
- **Notifications**: WhatsApp API integration

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

For any inquiries or support, please contact:
- GitHub: [@faiyazsumon786](https://github.com/faiyazsumon786)

---

**Built with ❤️ for Symphony Institute of Technology**
