# Earnly

A modern earnings tracking application built with React and Firebase, featuring real-time data synchronization and secure authentication.

## Key Features

- 📊 Comprehensive earnings dashboard with comparative analysis
- 🔄 Real-time data synchronization with Firebase
- 🔒 Secure authentication with Clerk
- 📱 Responsive design with dark/light mode
- 💰 Detailed monthly breakdowns and averages

## Tech Stack

- **Frontend:** React with TypeScript
- **Database:** Firebase Realtime Database
- **Authentication:** Clerk
- **Styling:** Tailwind CSS
- **Charts:** Recharts

## Getting Started

### Prerequisites

- Node.js 16.x or later
- Firebase account
- Clerk account

### Setup

1. Install dependencies
```bash
npm install
```

2. Configure environment variables in `.env.local`:
```env
REACT_APP_CLERK_PUBLISHABLE_KEY=
REACT_APP_FIREBASE_API_KEY=
REACT_APP_FIREBASE_AUTH_DOMAIN=
REACT_APP_FIREBASE_DATABASE_URL=
REACT_APP_FIREBASE_PROJECT_ID=
REACT_APP_FIREBASE_STORAGE_BUCKET=
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=
REACT_APP_FIREBASE_APP_ID=
```

3. Start the development server
```bash
npm start
```

## Project Structure

```
earnly/
├── src/
│   ├── components/
│   │   ├── common/
│   │   └── dashboard/
│   ├── config/
│   ├── pages/
│   ├── types/
│   └── utils/
├── public/
└── package.json
```

## Features in Detail

### Dashboard
- Current month earnings with comparative analysis
  * Comparison vs. last month (amount & percentage)
  * Comparison vs. average month (amount & percentage)
- Last month and yearly totals
- Monthly breakdown with averages
- Interactive earnings chart

### Add Earning
- Comprehensive earning entry form
- Real-time total calculation
- Multiple earning categories:
  * Repair
  * Installation
  * Tips
  * Other
- Automatic metadata updates

### Data Management
- Real-time data synchronization
- User-specific data isolation
- Automatic calculations
- Secure data storage

## Future Features

- Data export functionality
- Advanced reporting features
- Multiple currency support
- Custom categories


## Acknowledgments

- [React](https://reactjs.org/)
- [Firebase](https://firebase.google.com/)
- [Clerk](https://clerk.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Recharts](https://recharts.org/)
- [Windsurf](https://codeium.com/windsurf)
