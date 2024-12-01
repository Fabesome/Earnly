import { useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { auth } from '../config/firebase';

export const useFirebaseAuth = () => {
  const { user } = useUser();

  useEffect(() => {
    const setupFirebaseAuth = async () => {
      if (!user) return;

      try {
        // Sign in anonymously to Firebase
        await signInAnonymously(auth);
      } catch (error) {
        console.error('Error setting up Firebase auth:', error);
      }
    };

    setupFirebaseAuth();
  }, [user]);
};
