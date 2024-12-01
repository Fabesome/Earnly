# Earnly

A web application designed to help users track and analyze their work-related earnings and transactions with ease, providing comprehensive financial insights across multiple devices.

## Features

- Modern iOS 18-style design
- Secure authentication with Clerk
- Real-time data synchronization with Firebase
- Comprehensive earnings tracking and analysis
- Responsive design for desktop and mobile
- CSV export functionality

## Tech Stack

- React with TypeScript
- Tailwind CSS for styling
- Firebase Realtime Database
- Clerk for authentication
- Recharts for data visualization

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root directory with the following variables:
   ```
   REACT_APP_FIREBASE_API_KEY=your_api_key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
   REACT_APP_FIREBASE_DATABASE_URL=your_database_url
   REACT_APP_FIREBASE_PROJECT_ID=your_project_id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   REACT_APP_FIREBASE_APP_ID=your_app_id
   REACT_APP_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   ```

4. Start the development server:
   ```bash
   npm start
   ```

## Project Structure

```
earnly/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/         # Page components
│   ├── hooks/         # Custom React hooks
│   ├── services/      # Firebase and API services
│   ├── types/         # TypeScript type definitions
│   └── utils/         # Utility functions
├── public/           # Static assets
└── ...config files
```

## Available Scripts

- `npm start`: Run the development server
- `npm test`: Run tests
- `npm run build`: Build for production
- `npm run eject`: Eject from Create React App

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License.
