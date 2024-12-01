import { ClerkProvider, SignIn, SignUp, SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
  useLocation
} from 'react-router-dom';
import { AddEarning } from './pages/AddEarning';
import { Overview } from './pages/Overview';
import { Dashboard } from './pages/Dashboard';
import { Navigation } from './components/common/Navigation';
import { ThemeProvider } from './context/ThemeContext';
import { useClerkFirebaseAuth } from './hooks/useClerkFirebaseAuth';

if (!process.env.REACT_APP_CLERK_PUBLISHABLE_KEY) {
  throw new Error('Missing Clerk Publishable Key');
}
const clerkPubKey = process.env.REACT_APP_CLERK_PUBLISHABLE_KEY as string;

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white"></div>
    </div>
  );
}

function ProtectedLayout() {
  const { isAuthenticated, isLoading } = useClerkFirebaseAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Redirect to sign-in if not authenticated
  if (!isAuthenticated) {
    return <RedirectToSignIn redirectUrl={location.pathname} />;
  }

  return (
    <>
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </>
  );
}

function App() {
  return (
    <ClerkProvider publishableKey={clerkPubKey}>
      <ThemeProvider>
        <Router>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <Routes>
              {/* Auth Routes */}
              <Route
                path="/sign-in/*"
                element={<SignIn routing="path" path="/sign-in" afterSignInUrl="/dashboard" />}
              />
              <Route
                path="/sign-up/*"
                element={<SignUp routing="path" path="/sign-up" afterSignUpUrl="/dashboard" />}
              />

              {/* Protected Routes */}
              <Route element={<ProtectedLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/overview" element={<Overview />} />
                <Route path="/add" element={<AddEarning />} />
                {/* Redirect root to dashboard */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
              </Route>

              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        </Router>
      </ThemeProvider>
    </ClerkProvider>
  );
}

export default App;
