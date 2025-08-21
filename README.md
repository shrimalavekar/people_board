# User Management System

A mobile-first user management application with authentication and role-based access control.

## Features

- **Authentication**: Secure login and signup with Supabase
- **Role-based Access**: Super admin and regular user roles
- **Dashboard**: Super admins can view and manage all user entries
- **User Entry**: Regular users can add new entries
- **Mobile-first Design**: Responsive design optimized for mobile devices
- **Data Export**: CSV export functionality for super admins

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Environment Variables

Make sure to set up your Supabase environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## User Roles

- **Super Admin**: Can access dashboard to view all entries and export data
- **Regular User**: Can only add new user entries

## Technologies Used

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Supabase (Authentication & Database)
- Radix UI Components
