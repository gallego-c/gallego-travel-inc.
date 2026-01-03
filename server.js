// ==========================================
// Gallego Travel Inc. - Express Server
// Simple backend to handle CSV data saving
// ==========================================

const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // Serve static files

// Path to CSV file
const csvFilePath = path.join(__dirname, 'data', 'responses.csv');

// Ensure data directory and CSV file exist
function initializeCSV() {
    const dataDir = path.join(__dirname, 'data');
    
    // Create data directory if it doesn't exist
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir);
    }
    
    // Create CSV file with headers if it doesn't exist
    if (!fs.existsSync(csvFilePath)) {
        const headers = 'Name,Email,Identity Type,Travel Time,Available Date Ranges,Departure City,Foreign City Entered,Continent,Selected Cities,Number of Travelers,Adventure Type,Submission Date\n';
        fs.writeFileSync(csvFilePath, headers, 'utf8');
        console.log('✅ CSV file created with headers');
    }
}

// Initialize CSV on startup
initializeCSV();

// API endpoint to save questionnaire data
app.post('/api/save-response', (req, res) => {
    try {
        const data = req.body;
        
        // Format date ranges
        const dateRangesFormatted = data.availableDates.map(range => 
            `${range.start} to ${range.end}`
        ).join('; ');
        
        // Prepare CSV row
        const values = [
            data.name,
            data.email,
            data.identity,
            data.travelTime,
            dateRangesFormatted,
            data.departure,
            data.foreignCity || 'N/A',
            data.continent,
            data.selectedCities.map(c => c.charAt(0).toUpperCase() + c.slice(1)).join('; '),
            data.travelers,
            data.adventureType,
            new Date().toISOString()
        ];
        
        // Escape values for CSV
        const escapedValues = values.map(val => {
            const stringVal = String(val);
            if (stringVal.includes(',') || stringVal.includes('"') || stringVal.includes('\n')) {
                return `"${stringVal.replace(/"/g, '""')}"`;
            }
            return stringVal;
        });
        
        const csvRow = escapedValues.join(',') + '\n';
        
        // Append to CSV file
        fs.appendFileSync(csvFilePath, csvRow, 'utf8');
        
        console.log(`✅ Response saved: ${data.name} (${data.email})`);
        
        res.json({ 
            success: true, 
            message: 'Response saved successfully!' 
        });
        
    } catch (error) {
        console.error('❌ Error saving response:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to save response',
            error: error.message 
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Gallego Travel Inc. server is running!',
        csvPath: csvFilePath 
    });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log('🚀 Gallego Travel Inc. Server Started!');
    console.log(`📍 Local: http://localhost:${PORT}`);
    console.log(`📍 Network: http://${getLocalIP()}:${PORT}`);
    console.log(`📊 CSV file location: ${csvFilePath}`);
    console.log('');
    console.log('To stop the server, press Ctrl+C');
});

// Helper function to get local IP address
function getLocalIP() {
    const { networkInterfaces } = require('os');
    const nets = networkInterfaces();
    
    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            // Skip internal and non-IPv4 addresses
            if (net.family === 'IPv4' && !net.internal) {
                return net.address;
            }
        }
    }
    return 'localhost';
}
