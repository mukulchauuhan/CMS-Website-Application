import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import './style.css';

function App() {
    const [people, setPeople] = useState([]);
    const [formData, setFormData] = useState({
        id: null,
        name: '',
        email: '',
        mobileNumber: '',
        dateOfBirth: ''
    });
    const [error, setError] = useState('');

    useEffect(() => {
        fetchPeople();
    }, []);

    const fetchPeople = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/people');
            setPeople(response.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateFormData()) return;

        try {
            const existingPerson = people.find(person => {
                return (
                    person.name === formData.name &&
                    person.email === formData.email &&
                    person.mobileNumber === formData.mobileNumber &&
                    person.dateOfBirth === formData.dateOfBirth
                );
            });

            if (existingPerson) {
                setError('Your data already exists in the database.');
                return;
            }

            if (formData.id) {
                await axios.put(`http://localhost:5000/api/people/${formData.id}`, formData);
            } else {
                await axios.post('http://localhost:5000/api/people', formData);
            }

            fetchPeople();
            setFormData({ id: null, name: '', email: '', mobileNumber: '', dateOfBirth: '' }); // Reset form data after submission
        } catch (error) {
            console.error('Error adding/updating person:', error);
        }
    };

    const validateFormData = () => {
        const { email, mobileNumber, dateOfBirth } = formData;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const dobRegex = /^\d{4}-\d{2}-\d{2}$/;

        if (!emailRegex.test(email)) {
            setError('Invalid email address');
            return false;
        }

        if (mobileNumber.length !== 10) {
            setError('Mobile number must be 10 digits long');
            return false;
        }

        const [year, month, day] = dateOfBirth.split('-');
        const dob = new Date(year, month - 1, day);
        if (isNaN(dob.getTime())) {
            setError('Invalid date of birth');
            return false;
        }

        setError('');
        return true;
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/api/people/${id}`);
            fetchPeople();
        } catch (error) {
            console.error('Error deleting person:', error);
        }
    };

    const handleModify = (id) => {
        // Find the person with the given ID
        const personToModify = people.find(person => person.id === id);

        // Set the form data to the person's details
        setFormData({
            id: personToModify.id,
            name: personToModify.name,
            email: personToModify.email,
            mobileNumber: personToModify.mobileNumber,
            dateOfBirth: personToModify.dateOfBirth
        });
    };

    return (
        <div className="container">
            <div className="header">
                <h1>CMS Application</h1>
                <h2>USER DATA</h2> {/* Added heading */}
            </div>
            <div className="form-container">
                <h2>Add New Person</h2>
                {error && <div className="error">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleInputChange} />
                    <input type="text" name="email" placeholder="Email (e.g., example@example.com)" value={formData.email} onChange={handleInputChange} />
                    <input type="text" name="mobileNumber" placeholder="Mobile Number" value={formData.mobileNumber} onChange={handleInputChange} />
                    <input type="text" name="dateOfBirth" placeholder="Date of Birth (YYYY-MM-DD)" value={formData.dateOfBirth} onChange={handleInputChange} />
                    <button type="submit">{formData.id ? 'Modify Person' : 'Add Person'}</button>
                </form>
            </div>
            <div className="data-list">
                <ul>
                    {people.map(person => (
                        <li key={person.id}>
                            {person.name} - {person.email} - {person.mobileNumber} - {person.dateOfBirth}
                            <button className="delete" onClick={() => handleDelete(person.id)}>Delete</button>
                            <button className="modify" onClick={() => handleModify(person.id)}>Modify</button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

ReactDOM.render(<App />, document.getElementById('root'));
