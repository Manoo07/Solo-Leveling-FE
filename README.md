# Solo Leveling - Habit Tracker

A modern habit tracking application built with React, TypeScript, and Vite.

## Technologies

This project is built with:

- **Frontend**: React, TypeScript, Vite, shadcn-ui, Tailwind CSS
- **Backend**: Cloudflare Workers, Hono, Prisma ORM
- **Deployment**: GitHub Pages (Frontend), Cloudflare Workers (Backend)

## Getting Started

### Prerequisites

- Node.js 20.x or higher
- npm or yarn

### Local Development

```sh
# Step 1: Clone the repository
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory
cd solo-leveling-fe

# Step 3: Install the necessary dependencies
npm install

# Step 4: Copy the environment file
cp .env.example .env

# Step 5: Start the development server
npm run dev
```

The app will be available at `http://localhost:8080`

## Environment Variables

Create a `.env` file in the root directory:

```env
# Backend API URL
VITE_API_BASE_URL=https://habit-tracker-backend.manoharboinapalli2003.workers.dev/api
```

For local backend development, use:
```env
VITE_API_BASE_URL=http://localhost:8787/api
```

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build for production
- `npm run preview` - Preview the production build
- `npm run lint` - Run ESLint

## Deployment

### GitHub Pages (Frontend)

The frontend is automatically deployed to GitHub Pages when you push to the `main` branch.

**Setup Instructions:**
1. Go to your GitHub repository → Settings → Pages
2. Under "Build and deployment", select "GitHub Actions" as the source
3. Push your changes to the `main` branch
4. The workflow will automatically build and deploy your app

Your app will be available at: `https://[username].github.io/Solo-Leveling-FE/`

### Cloudflare Workers (Backend)

The backend API is already deployed at:
```
https://habit-tracker-backend.manoharboinapalli2003.workers.dev/api
```

## Features

- ✅ **Habit Tracking**: Track daily habits with visual calendar grid
- 🔒 **Date Locking**: Only today's entries can be edited (past and future dates are locked)
- 🔥 **Streak Tracking**: Monitor your consistency with streak counters
- 📊 **Analytics**: View your progress with charts and insights
- 🎯 **Goals**: Set and track long-term goals
- ✅ **Todos**: Manage tasks alongside your habits
- 🎨 **Custom Icons**: Personalize habits with emoji icons
- 📱 **Responsive Design**: Works on desktop, tablet, and mobile

## Project Structure

```
├── src/
│   ├── components/     # React components
│   ├── hooks/         # Custom React hooks
│   ├── lib/           # API client and utilities
│   ├── pages/         # Page components
│   └── main.tsx       # App entry point
├── .github/
│   └── workflows/     # GitHub Actions for deployment
└── vite.config.ts     # Vite configuration
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
