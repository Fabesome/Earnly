import { useState, useEffect } from 'react';
import { ref, onValue, remove, get } from 'firebase/database';
import { db } from '../config/firebase';
import { useUser } from '@clerk/clerk-react';
import { useClerkFirebaseAuth } from './useClerkFirebaseAuth';
import { Earning } from '../types';

interface EarningWithId extends Earning {
  id: string;
}

export const useEarnings = () => {
  const { user } = useUser();
  const { isAuthenticated } = useClerkFirebaseAuth();
  const [earnings, setEarnings] = useState<EarningWithId[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const fetchEarnings = async () => {
      if (!user || !isAuthenticated) {
        setIsLoading(false);
        setEarnings([]);
        return;
      }

      try {
        console.log('Setting up Firebase listener for user:', user.id);
        const earningsRef = ref(db, `users/${user.id}/earnings`);

        unsubscribe = onValue(earningsRef, (snapshot) => {
          console.log('Received database update:', snapshot.val());
          const data = snapshot.val();
          setIsLoading(false);
          
          if (!data) {
            console.log('No data available');
            setEarnings([]);
            return;
          }

          const earningsArray = Object.entries(data).map(([key, value]) => ({
            id: key,
            ...(value as Omit<Earning, 'id'>),
          }));

          console.log('Processed earnings:', earningsArray);
          setEarnings(earningsArray);
        }, (error) => {
          console.error('Database error:', error);
          setError(error.message);
          setIsLoading(false);
        });
      } catch (error) {
        console.error('Error setting up earnings listener:', error);
        setError(error instanceof Error ? error.message : 'Unknown error');
        setIsLoading(false);
      }
    };

    fetchEarnings();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user, isAuthenticated]);

  const removeEarning = async (id: string) => {
    if (!user) {
      throw new Error('No user available');
    }

    try {
      const earningRef = ref(db, `users/${user.id}/earnings/${id}`);
      await remove(earningRef);
    } catch (error) {
      console.error('Error removing earning:', error);
      throw error;
    }
  };

  return { earnings, isLoading, error, removeEarning };
};
