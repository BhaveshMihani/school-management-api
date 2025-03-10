const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const geolib = require('geolib');

const app = express();
app.use(bodyParser.json());

// Set up the database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Bhavesh@07',
    database: 'school_management'
});

// Connect to the database
db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to database');
});

// Add a new school to the database
app.post('/addSchool', (req, res) => {
    const name = req.body.name;
    const address = req.body.address;
    const latitude = req.body.latitude;
    const longitude = req.body.longitude;

    // Validate the input data
    if (!name || !address || !latitude || !longitude) {
        res.status(400).send('All fields are required');
        return;
    }

    // Insert the new school into the database
    const query = 'INSERT INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)';
    db.query(query, [name, address, latitude, longitude], (err, result) => {
        if (err) {
            console.error('Error adding school:', err);
            res.status(500).send('Error adding school');
            return;
        }
        res.status(201).send('School added successfully');
    });
});

// List all schools sorted by proximity to the user's location
app.get('/listSchools', (req, res) => {
    const latitude = req.query.latitude;
    const longitude = req.query.longitude;

    // Validate the input data
    if (!latitude || !longitude) {
        res.status(400).send('Latitude and longitude are required');
        return;
    }

    // Fetch all schools from the database
    const query = 'SELECT * FROM schools';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching schools:', err);
            res.status(500).send('Error fetching schools');
            return;
        }

        // Calculate the distance to each school and sort by proximity
        const schools = [];
        for (let i = 0; i < results.length; i++) {
            const school = results[i];
            const distance = geolib.getDistance(
                { latitude: parseFloat(latitude), longitude: parseFloat(longitude) },
                { latitude: school.latitude, longitude: school.longitude }
            );
            school.distance = distance;
            schools.push(school);
        }

        schools.sort((a, b) => a.distance - b.distance);

        res.status(200).json(schools);
    });
});

// Start the server
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
