const { initializeApp } = require('firebase/app');
const { getDatabase, ref, push, set } = require('firebase/database');
const fs = require('fs');
const csv = require('csv-parse');
const dotenv = require('dotenv');

// Load environment variables from the correct path
dotenv.config({ path: '.env.local' });

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Validate Firebase config
const requiredEnvVars = [
  'REACT_APP_FIREBASE_API_KEY',
  'REACT_APP_FIREBASE_AUTH_DOMAIN',
  'REACT_APP_FIREBASE_DATABASE_URL',
  'REACT_APP_FIREBASE_PROJECT_ID',
  'REACT_APP_FIREBASE_STORAGE_BUCKET',
  'REACT_APP_FIREBASE_MESSAGING_SENDER_ID',
  'REACT_APP_FIREBASE_APP_ID'
];

const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars.join(', '));
  process.exit(1);
}

// Your user ID from Clerk
const USER_ID = 'user_2pZ5QUjNpq8sBcOyuvfsQBNRhDz';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

async function importEarnings(csvFilePath) {
  console.log('Starting import from:', csvFilePath);
  let successCount = 0;
  let errorCount = 0;
  let totalAmount = 0;

  const parser = fs.createReadStream(csvFilePath).pipe(
    csv.parse({
      columns: true,
      skip_empty_lines: true,
      trim: true,
    })
  );

  const earningsRef = ref(db, `users/${USER_ID}/earnings`);
  
  try {
    for await (const record of parser) {
      try {
        // Parse numeric values
        const timeWorked = parseFloat(record['Time Worked']) || 0;
        const timeAmount = parseFloat(record['Time Amount']) || 0;
        const materialAmount = parseFloat(record['Material Amount']) || 0;
        const tips = parseFloat(record.Tips) || 0;
        const totalEarnings = parseFloat(record.Total) || 0;

        // Validate the record
        if (!record.Date) {
          console.error('Skipping record: Missing date');
          errorCount++;
          continue;
        }

        // Create a new earning entry
        const earning = {
          date: record.Date,
          customerName: record.Customer || '',
          customerLocation: record.Location || '',
          category: record.Category || 'Sonstiges',
          description: record.Description || '',
          timeWorked,
          timeAmount,
          materialAmount,
          tips,
          totalEarnings,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        // Push the earning to Firebase
        const newEarningRef = push(earningsRef);
        await set(newEarningRef, earning);
        
        successCount++;
        totalAmount += totalEarnings;
        
        // Log progress every 10 records
        if (successCount % 10 === 0) {
          console.log(`Processed ${successCount} records...`);
        }
      } catch (recordError) {
        console.error('Error processing record:', record, recordError);
        errorCount++;
      }
    }

    console.log('\nImport completed!');
    console.log('Successfully imported:', successCount, 'records');
    console.log('Failed to import:', errorCount, 'records');
    console.log('Total amount imported:', totalAmount.toFixed(2), '€');
  } catch (error) {
    console.error('Fatal error during import:', error);
    process.exit(1);
  }
}

// Check if CSV file path is provided
if (process.argv.length < 3) {
  console.error('Please provide the path to your CSV file');
  console.error('Usage: node importEarnings.js <path-to-csv>');
  process.exit(1);
}

// Run the import
const csvFilePath = process.argv[2];
if (!fs.existsSync(csvFilePath)) {
  console.error('CSV file not found:', csvFilePath);
  process.exit(1);
}

importEarnings(csvFilePath)
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Error:', error);
    process.exit(1);
  });
