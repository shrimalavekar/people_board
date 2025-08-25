# Mobile-first User Management Web App

A modern, mobile-first user management application built with Next.js, TypeScript, and Supabase.

## Features

- **Authentication**: Secure login and signup with Supabase Auth
- **Role-based Access**: Different interfaces for regular users and super admins
- **User Management**: Add, edit, and manage user entries
- **Dashboard**: Comprehensive dashboard with search, filtering, and export capabilities
- **Mobile-first Design**: Responsive design optimized for mobile devices
- **Modern UI**: Built with Radix UI components and Tailwind CSS

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **Backend**: Supabase
- **Authentication**: Supabase Auth
- **Icons**: Lucide React
- **Forms**: React Hook Form
- **Notifications**: Sonner

## Project Structure

```
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Home page
│   │   └── globals.css        # Global styles
│   ├── components/            # React components
│   │   ├── ui/               # Reusable UI components
│   │   ├── LoginScreen.tsx   # Login component
│   │   ├── SignupScreen.tsx  # Signup component
│   │   ├── UserEntryScreen.tsx # User entry form
│   │   ├── DashboardScreen.tsx # Admin dashboard
│   │   └── EditPersonDialog.tsx # Edit user dialog
│   ├── utils/                # Utility functions
│   │   └── supabase/        # Supabase configuration
│   └── types/               # TypeScript type definitions
├── public/                  # Static assets
├── package.json            # Dependencies and scripts
├── next.config.js          # Next.js configuration
├── tailwind.config.js      # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
└── README.md              # Project documentation
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account and project

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd mobile-first-user-management-web-app
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

4. Update Supabase configuration:
Update the Supabase configuration in `src/utils/supabase/info.tsx` with your project details.

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Deployment

The application can be deployed to various platforms:

- **Vercel** (Recommended for Next.js)
- **Netlify**
- **Railway**
- **AWS Amplify**

Make sure to set the environment variables in your deployment platform.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
  