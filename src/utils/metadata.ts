import { ref, get, set } from 'firebase/database';
import { db } from '../services/firebase';
import { Earning, UserMetadata } from '../types';

export async function updateMetadata(userId: string, newEarning: Omit<Earning, 'id'>) {
  const metadataRef = ref(db, `users/${userId}/metadata`);
  const metadataSnapshot = await get(metadataRef);
  const currentMetadata = metadataSnapshot.val() as UserMetadata || {
    totalCurrentMonthEarnings: 0,
    totalPreviousMonthEarnings: 0,
    totalCurrentYearEarnings: 0,
  };

  const earningDate = new Date(newEarning.date);
  const currentDate = new Date();
  
  // Check if earning is from current month
  const isCurrentMonth = 
    earningDate.getMonth() === currentDate.getMonth() && 
    earningDate.getFullYear() === currentDate.getFullYear();

  // Check if earning is from previous month
  const isPreviousMonth = 
    (earningDate.getMonth() === currentDate.getMonth() - 1 && 
     earningDate.getFullYear() === currentDate.getFullYear()) ||
    (currentDate.getMonth() === 0 && 
     earningDate.getMonth() === 11 && 
     earningDate.getFullYear() === currentDate.getFullYear() - 1);

  // Check if earning is from current year
  const isCurrentYear = earningDate.getFullYear() === currentDate.getFullYear();

  const updatedMetadata: UserMetadata = {
    totalCurrentMonthEarnings: isCurrentMonth 
      ? currentMetadata.totalCurrentMonthEarnings + newEarning.totalEarnings 
      : currentMetadata.totalCurrentMonthEarnings,
    totalPreviousMonthEarnings: isPreviousMonth 
      ? currentMetadata.totalPreviousMonthEarnings + newEarning.totalEarnings 
      : currentMetadata.totalPreviousMonthEarnings,
    totalCurrentYearEarnings: isCurrentYear 
      ? currentMetadata.totalCurrentYearEarnings + newEarning.totalEarnings 
      : currentMetadata.totalCurrentYearEarnings,
  };

  await set(metadataRef, updatedMetadata);
}
