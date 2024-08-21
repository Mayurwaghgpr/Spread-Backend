import User from '../models/user.js';
import Sequelize from 'sequelize';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import AccessAndRefreshTokenGenerator from '../utils/AccessAndRefreshTokenGenerator.js';

dotenv.config();
const saltRounds = 10;

// Cookie options for setting secure, HTTP-only cookies
const CookieOptions = {
    httpOnly: true,
    secure: true,  // Set to false if not using HTTPS
};

// Sign up a new user
export const SignUp = async (req, res) => {
    const { username, email, password } = req.body;

    // Validate required fields
    if (!username || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        // Check if user already exists
        const existingUser = await User.findOne({
            where: {
                [Sequelize.Op.or]: [{ username }, { email }],
            },
        });

        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Hash the password and create a new user
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const newUser = await User.create({ username, email, password: hashedPassword });

        // Generate access and refresh tokens
        const { AccessToken, RefreshToken } = AccessAndRefreshTokenGenerator({
            id: newUser.id,
            email: newUser.email,
            name: username,
            image: newUser.userImage,
        });

        if (!AccessToken || !RefreshToken) {
            throw new Error("Failed to generate tokens");
        }

        // Set tokens as cookies and respond
        res.status(201)
            .cookie('AccessToken', AccessToken, CookieOptions)
            .cookie('RefreshToken', RefreshToken, CookieOptions)
            .json({ user: newUser.dataValues, AccessToken, RefreshToken });

    } catch (err) {
        console.error('Error during sign up:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Log in an existing user
export const LogIn = async (req, res) => {
    const { username, password } = req.body;

    // Validate required fields
    if (!username || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        // Find user by username
        const user = await User.findOne({
            where: { username },
            include: [
                {
                    model: User,
                    as: 'Followers',
                    through: { attributes: { exclude: ['password'] }},
                },
                {
                    model: User,
                    as: 'Following',
                    through: { attributes: { exclude: ['password'] } },
                }
            ]
        });

        if (!user) {
            return res.status(400).json({ message: 'User does not exist' });
        }

        // Compare provided password with hashed password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate access and refresh tokens
        const { AccessToken, RefreshToken } = AccessAndRefreshTokenGenerator({
            id: user.id,
            email: user.email,
            name: username,
            image: user.userImage,
        });

        if (!AccessToken || !RefreshToken) {
            throw new Error("Failed to generate tokens");
        }

        // Update user with new refresh token
        await User.update({ refreshToken: RefreshToken }, { where: { id: user.id } });

        // Set tokens as cookies and respond
        res.status(200)
            .cookie('AccessToken', AccessToken, CookieOptions)
            .cookie('RefreshToken', RefreshToken, CookieOptions)
            .json({ user: user.dataValues, AccessToken, RefreshToken });
    } catch (err) {
        console.error('Error during login:', err);
        res.status(500).json({ message: err.message });
    }
};




// Refresh access token using refresh token
export const RefreshToken = async (req, res) => {
       console.log("Request Cookies:", req.cookies);
    // Extract token from cookies or Authorization header
    const clientRefreshToken = req.cookies.RefreshToken || req.header("Authorization")?.replace("Bearer ", "");

    if (!clientRefreshToken) {
        return res.status(401).json({ message: 'Unauthorized request' });
    }

    try {
        // Verify refresh token
        const decodedToken = jwt.verify(clientRefreshToken,  process.env.REFRESH_TOKEN_SECRET);
        const { dataValues: user } = await User.findByPk(decodedToken.id);
        console.log(user)
        console.log(decodedToken)
        if (!user) {
            return res.status(401).json({ message: 'Invalid refresh token' });
        }

        // Check if the refresh token matches the one stored in the database
        if (clientRefreshToken !== user.refreshToken) {
            return res.status(401).json({ message: 'Refresh token is expired or used' });
        }

        // Generate new access and refresh tokens
        const { AccessToken, RefreshToken } = AccessAndRefreshTokenGenerator({ id: decodedToken.id,    email: decodedToken.email,
            name: decodedToken.name,
            image: decodedToken.image });

        // Update user with new refresh token
        // await User.update({ refreshToken: RefreshToken }, { where: decodedToken.id });

        // Set new tokens as cookies and respond
        res.status(200)
            .cookie('AccessToken', AccessToken, CookieOptions)
            .cookie('RefreshToken', RefreshToken, CookieOptions)
            .json({ user: user, AccessToken, RefreshToken });

    } catch (error) {
        console.error('Error during token refresh:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


// Log out the user by clearing cookies and updating user record
export const Logout = async (req, res) => {
    res.clearCookie('AccessToken', CookieOptions);
    res.clearCookie('RefreshToken', CookieOptions);

    try {
        // Clear refresh token from user record
        await User.update({ refreshToken: null }, { where: { id: req.userId } });
        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error('Error during logout:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
