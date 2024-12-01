import { ClerkProvider } from '@clerk/clerk-react';
import { ReactNode } from 'react';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const clerkPubKey = process.env.REACT_APP_CLERK_PUBLISHABLE_KEY;

  if (!clerkPubKey) {
    throw new Error('Missing Clerk Publishable Key');
  }

  return (
    <ClerkProvider publishableKey={clerkPubKey}>
      {children}
    </ClerkProvider>
  );
}
