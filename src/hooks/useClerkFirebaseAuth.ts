import { useEffect, useState } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { signInWithCustomToken, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';

export const useClerkFirebaseAuth = () => {
  const { getToken } = useAuth();
  const { isLoaded: isClerkLoaded, isSignedIn, user } = useUser();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let unsubscribeAuth: (() => void) | null = null;

    const setupFirebaseAuth = async () => {
      try {
        // If Clerk is not loaded yet, keep loading
        if (!isClerkLoaded) {
          return;
        }

        // If not signed in with Clerk or no user, sign out of Firebase
        if (!isSignedIn || !user) {
          await signOut(auth);
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        // Get the session token from Clerk
        const token = await getToken({ template: 'integration_firebase' });
        if (!token) {
          console.log('No Clerk token available');
          await signOut(auth);
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        // Sign in to Firebase with the token
        await signInWithCustomToken(auth, token);
        console.log('Successfully authenticated with Firebase');

        // Set up Firebase auth state listener
        unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
          setIsAuthenticated(!!firebaseUser);
          setIsLoading(false);
          console.log('Firebase auth state changed:', 
            firebaseUser ? 'authenticated' : 'not authenticated'
          );
        });

      } catch (error) {
        console.error('Error setting up Firebase auth:', error);
        setIsAuthenticated(false);
        setIsLoading(false);
        await signOut(auth);
      }
    };

    // Only run the auth setup if Clerk is loaded
    if (isClerkLoaded) {
      setupFirebaseAuth();
    }

    // Cleanup function
    return () => {
      if (unsubscribeAuth) {
        unsubscribeAuth();
      }
    };
  }, [getToken, isClerkLoaded, isSignedIn, user]);

  return { isAuthenticated, isLoading };
};
