const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { sequelize, Person } = require('./models');

const app = express();
const PORT = 5000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Sync Sequelize models
sequelize.sync().then(() => {
    console.log('Database synchronized');

    // Start server
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}).catch(err => {
    console.error('Error synchronizing the database:', err);
});

// Routes
// Get all people
app.get('/api/people', async (req, res) => {
    try {
        const people = await Person.findAll();
        res.json(people);
    } catch (error) {
        console.error('Error fetching people:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create a new person
app.post('/api/people', async (req, res) => {
    try {
        const { name, email, mobileNumber, dateOfBirth } = req.body;

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Invalid email address' });
        }

        // Validate mobile number length
        if (mobileNumber.length !== 10) {
            return res.status(400).json({ error: 'Mobile number must be 10 digits long' });
        }

        // Validate date of birth format
        const dobRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dobRegex.test(dateOfBirth)) {
            return res.status(400).json({ error: 'Invalid date of birth format. Use YYYY-MM-DD' });
        }

        // Check for existing person with the same details
        const existingPerson = await Person.findOne({ where: { email } });
        if (existingPerson) {
            return res.status(400).json({ error: 'Person with same email already exists' });
        }

        // Create new person
        const newPerson = await Person.create(req.body);
        res.status(201).json(newPerson);
    } catch (error) {
        console.error('Error creating person:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update a person by ID
app.put('/api/people/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [updatedCount] = await Person.update(req.body, { where: { id } });
        if (updatedCount === 0) {
            return res.status(404).json({ error: 'Person not found' });
        }
        const updatedPerson = await Person.findByPk(id);
        res.json(updatedPerson);
    } catch (error) {
        console.error('Error updating person:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete a person by ID
app.delete('/api/people/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deletedCount = await Person.destroy({ where: { id } });
        if (deletedCount === 0) {
            return res.status(404).json({ error: 'Person not found' });
        }
        res.json({ message: 'Person deleted successfully' });
    } catch (error) {
        console.error('Error deleting person:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = app;
