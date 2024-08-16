// controllers/adminAuthController.js
import User from '../models/user.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Register a new admin user
const registerAdmin = async (req, res) => {
    try {
        // Extract data from the request body
        const { email, username, password } = req.body;

        // Check if email or username is already in use
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({ message: 'Email or username is already in use.' });
        }

        // Create a new user (admin)
        const user = new User({
            email,
            username,
            password // The password will be hashed in the model
        });

        // Save the user to the database
        await user.save();

        // Successful response
        res.status(201).json({ message: 'Admin user successfully registered.' });
    } catch (error) {
        // Send error details in the response
        res.status(500).json({ message: 'An error occurred during registration.', error: error.message });
    }
};

// Admin login
const loginAdmin = async (req, res) => {
    try {
        // Extract data from the request body
        const { email, password } = req.body;

        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User with this email not found.' });
        }

        // Check if the password is valid
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid password.' });
        }

        // Generate a JWT token for the user (admin)
        const token = jwt.sign({ userId: user._id, isAdmin: true }, process.env.JWT_SECRET, {
            expiresIn: '1d' // Token expiration time
        });

        // Successful response with the token
        res.status(200).json({
            message: 'Admin login successful.',
            token
        });
    } catch (error) {
        // Send error details in the response
        res.status(500).json({ message: 'An error occurred during login.', error: error.message });
    }
};

export { registerAdmin, loginAdmin };
