# Expense Tracker

A simple and beautiful expense tracker application to monitor your spending across categories.

## Technologies Used

This project is built with:

- **Vite** - Build tool and dev server
- **TypeScript** - Type safety
- **React 18** - UI library
- **shadcn/ui** - Component library
- **Tailwind CSS** - Styling
- **React Router** - Routing
- **TanStack Query** - State management
- **Bun** - Package manager

## Getting Started

### Prerequisites

- Node.js & npm (or Bun) installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

### Installation

```sh
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to the project directory
cd expense-app

# Install dependencies
npm install
# or if using Bun
bun install

# Start the development server
npm run dev
# or
bun run dev
```

The application will be available at `http://localhost:8080`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Features

- ✅ Add and track expenses with custom dates
- ✅ Categorize expenses (food, clothes, electronics, etc.)
- ✅ View expense summary and statistics
- ✅ Local storage persistence (works offline)
- ✅ Cloud sync with Supabase (optional - sign in to sync across devices)
- ✅ Responsive design
- ✅ Delete expenses
- ✅ PWA support - Install as mobile app
- ✅ Indian Rupees (₹) currency

## Cloud Sync Setup (Optional)

The app works perfectly without an account using localStorage. To enable cloud sync and access your expenses from multiple devices:

### 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Wait for the project to finish setting up (~2 minutes)

### 2. Get Your API Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (e.g., `https://abcdefg.supabase.co`)
   - **anon/public key** (the long JWT token under "Project API keys")

### 3. Create the Database Table

1. In Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Paste and run this SQL:

```sql
-- Drop the table if it exists (to recreate with correct columns)
drop table if exists public.expenses cascade;

-- Create the expenses table (using snake_case, standard for PostgreSQL)
create table public.expenses (
  id uuid primary key,
  user_id uuid references auth.users(id) on delete cascade,
  product_name text not null,
  price numeric not null,
  category text not null,
  place text not null,
  date timestamptz not null,
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table public.expenses enable row level security;

-- Create policy: users can only access their own expenses
create policy "Users can manage their own expenses"
  on public.expenses
  for all
  using ( auth.uid() = user_id )
  with check ( auth.uid() = user_id );
```

### 4. Configure Authentication

1. In Supabase dashboard, go to **Authentication** → **Providers**
2. Make sure **Email** is enabled
3. Go to **Authentication** → **Settings** (URL Configuration)
4. For development, add `http://localhost:8080` to **Site URL** and **Redirect URLs**
5. (Optional) Disable "Confirm email" for testing - under **Email Auth** section

### 5. Add Environment Variables

Create a `.env.local` file in the project root:

```bash
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key-here
```

Replace with your actual values from step 2.

### 6. Restart the Dev Server

```bash
npm run dev
```

### 7. Sign Up

1. Go to `http://localhost:8080/login`
2. Click **Sign up** with your email and password
3. (If email confirmation is enabled, check your email)
4. Sign in and click **Save to Cloud** to sync your local expenses

## Deployment (Vercel)

When deploying to Vercel, add these environment variables in your project settings:

- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anon key

Update Supabase Site URL and Redirect URLs to include your production domain.

## Install as Mobile App

This app can be installed on your phone's homescreen for a native app-like experience!

### On Android (Chrome/Edge):

1. Open the app in Chrome or Edge browser
2. Tap the **menu icon** (⋮) in the top right corner
3. Select **"Add to Home screen"** or **"Install app"**
4. Confirm by tapping **"Add"** or **"Install"**
5. The app icon will appear on your homescreen

**Alternative:** Chrome may show an automatic install banner at the bottom - just tap "Install"

### On iOS (Safari):

1. Open the app in Safari browser
2. Tap the **Share button** (square with arrow pointing up) at the bottom
3. Scroll down and tap **"Add to Home Screen"**
4. Edit the name if desired, then tap **"Add"**
5. The app icon will appear on your homescreen

### Benefits of Installing:

- 📱 Launch directly from homescreen like a native app
- 🚀 Faster load times
- 📴 Works offline after first visit
- 🎨 Full screen experience without browser UI
- 🔔 Better mobile experience

## License

MIT
