const fs = require('fs');
const csv = require('csv-parse/sync');
const { stringify } = require('csv-stringify/sync');

// Read the input CSV and remove BOM if present
let input = fs.readFileSync('datatoimport.csv', 'utf-8');
if (input.charCodeAt(0) === 0xFEFF) {
    input = input.slice(1);
}

// Parse the input CSV with semicolon delimiter
const records = csv.parse(input, {
    delimiter: ';',
    columns: true,
    skip_empty_lines: true,
    trim: true
});

// Function to parse German date
function parseGermanDate(dateStr) {
    try {
        if (!dateStr || typeof dateStr !== 'string') {
            console.error('Invalid date:', dateStr);
            return new Date().toISOString().split('T')[0]; // fallback to today
        }

        const months = {
            'Jänner': '01', 'Februar': '02', 'März': '03', 'April': '04',
            'Mai': '05', 'Juni': '06', 'Juli': '07', 'August': '08',
            'September': '09', 'Oktober': '10', 'November': '11', 'Dezember': '12'
        };
        
        // Remove day of week if present
        const dateParts = dateStr.split(', ');
        const dateString = dateParts.length > 1 ? dateParts[1] : dateParts[0];
        
        const parts = dateString.trim().split(' ');
        if (parts.length !== 3) {
            console.error('Invalid date format:', dateStr);
            return new Date().toISOString().split('T')[0];
        }

        const day = parts[0].replace('.', '').padStart(2, '0');
        const month = months[parts[1]];
        const year = parts[2];
        
        if (!month || !year) {
            console.error('Invalid month or year:', dateStr);
            return new Date().toISOString().split('T')[0];
        }

        return `${year}-${month}-${day}`;
    } catch (error) {
        console.error('Error parsing date:', dateStr, error);
        return new Date().toISOString().split('T')[0];
    }
}

// Function to extract tips amount
function extractTips(description) {
    if (!description) return 0;
    
    try {
        // Match patterns like "TG5", "5TG", "TG 5", "5 TG"
        const match = description.match(/(\d+)\s*TG|TG\s*(\d+)/);
        if (match) {
            return parseInt(match[1] || match[2]);
        }
    } catch (error) {
        console.error('Error extracting tips:', description, error);
    }
    return 0;
}

// Function to extract hours worked
function extractHours(description) {
    if (!description) return 0;
    
    try {
        // Match patterns like "5h", "5 h", "2.5h"
        const match = description.match(/(\d+\.?\d*)\s*h/);
        if (match) {
            return parseFloat(match[1]);
        }
    } catch (error) {
        console.error('Error extracting hours:', description, error);
    }
    return 0;
}

// Function to parse Euro amount
function parseEuroAmount(amount) {
    if (!amount) return 0;
    try {
        return parseFloat(amount.replace('€', '').replace(',', '.').trim());
    } catch (error) {
        console.error('Error parsing amount:', amount, error);
        return 0;
    }
}

// Convert records
const convertedRecords = records
    .filter(record => record.Datum && record.Datum.trim() !== '' && record.Wert && record.Wert.trim() !== '') // Skip records without date or value
    .map(record => {
        try {
            const total = parseEuroAmount(record.Wert);
            const tips = extractTips(record['Zusatz, TG']);
            const timeWorked = extractHours(record['Zusatz, TG']);
            
            // When no specific breakdown is given, put everything in timeAmount
            const timeAmount = total - tips;
            const materialAmount = 0; // Default to 0 as requested
            
            const description = (record['Zusatz, TG'] || '')
                .replace(/\d+\s*TG|TG\s*\d+|\d+\s*h/g, '')
                .trim();
            
            return {
                Date: parseGermanDate(record.Datum),
                Customer: record.Name || '',
                Location: record.Ort || '',
                Category: record.Art || 'Sonstiges',
                Description: description,
                'Time Worked': timeWorked,
                'Time Amount': timeAmount,
                'Material Amount': materialAmount,
                Tips: tips,
                Total: total
            };
        } catch (error) {
            console.error('Error processing record:', record, error);
            return null;
        }
    })
    .filter(record => record !== null); // Remove any records that failed to process

// Calculate total sum to verify
const totalSum = convertedRecords.reduce((sum, record) => sum + record.Total, 0);
console.log('Total sum:', totalSum.toFixed(2), '€');
console.log('Total records processed:', convertedRecords.length);

// Write the converted CSV
const output = stringify(convertedRecords, {
    header: true,
    columns: ['Date', 'Customer', 'Location', 'Category', 'Description', 'Time Worked', 'Time Amount', 'Material Amount', 'Tips', 'Total']
});

fs.writeFileSync('converted_earnings.csv', output);
console.log('Conversion completed! Check converted_earnings.csv');
