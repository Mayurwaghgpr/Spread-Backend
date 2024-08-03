import User from '../models/user.js';
import Sequelize from 'sequelize';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import AccessAndRefreshTokenGenerator from '../utils/AccessAndRefreshTokenGenerator.js';

dotenv.config();
const saltRounds = 10;

// const isProduction = process.env.NODE_ENV === 'production';
const CookieOptions = {
    httpOnly: true,
    secure: true,
};

export const SignUp = async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        const existingUser = await User.findOne({
            where: {
                [Sequelize.Op.or]: [{ username }, { email }],
            },
        });

        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const newUser = await User.create({ username, email, password: hashedPassword });
        // console.log({newUser})

        const { AccessToken, RefreshToken } = AccessAndRefreshTokenGenerator({
            id: newUser.id,
            email: newUser.email,
            name: username,
            image: newUser.userImage,
        });
        console.log({AccessToken})

        if (!AccessToken || !RefreshToken) {
            throw new Error("Failed to generate tokens");
        }

        // await User.update({ refreshToken: RefreshToken }, { where: { id: newUser.id } });

        res.status(201)
            .cookie('AccessToken', AccessToken, CookieOptions)
            .cookie('RefreshToken', RefreshToken, CookieOptions)
            .json({ user: newUser.dataValues, AccessToken, RefreshToken });

    } catch (err) {
        console.error('Error during sign up:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

export const LogIn = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        const user = await User.findOne({
            where: { username: username },
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

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const { AccessToken, RefreshToken } = AccessAndRefreshTokenGenerator({
            id: user.id,
            email: user.email,
            name: username,
            image: user.userImage,
        });

        if (!AccessToken || !RefreshToken) {
            throw new Error("Failed to generate tokens");
        }

        await User.update({ refreshToken: RefreshToken }, { where: { id: user.id } });

        res.status(200)
            .cookie('AccessToken', AccessToken, CookieOptions)
            .cookie('RefreshToken', RefreshToken, CookieOptions)
            .json({ user: user.dataValues, AccessToken, RefreshToken });
    } catch (err) {
        console.error('Error during login:', err);
        res.status(500).json({ message: err.message });
    }
};

export const RefreshToken = async (req, res) => {
    const clientRefreshToken = req.cookies.RefreshToken || req.header("Authorization")?.replace("Bearer ", "");

    try {
        if (!clientRefreshToken) {
            return res.status(401).json({ message: 'Unauthorized request' });
        }

        const decodedToken = jwt.verify(clientRefreshToken, process.env.REFRESH_TOKEN_SECRET);
        const user = await User.findByPk(decodedToken?.id);

        if (!user) {
            return res.status(401).json({ message: 'Invalid refresh token' });
        }

        if (clientRefreshToken !== user.dataValues.refreshToken) {
            return res.status(401).json({ message: 'Refresh token is expired or used' });
        }

        const { AccessToken, RefreshToken } = AccessAndRefreshTokenGenerator(user.id);

        await User.update({ refreshToken: RefreshToken }, { where: { id: user.id } });
        console.log('new toekn hase created')
        res.status(200)
            .cookie('AccessToken', AccessToken, CookieOptions)
            .cookie('RefreshToken', RefreshToken, CookieOptions)
            .json({ user: user.dataValues, AccessToken, RefreshToken });

    } catch (error) {
        console.error('Error during token refresh:', error);
        res.status(500).json({ message: error.message });
    }
};

export const Logout = async (req, res) => {
    res.clearCookie('AccessToken', CookieOptions);
    res.clearCookie('RefreshToken', CookieOptions);

    try {
        await User.update({ refreshToken: null }, { where: { id: req.userId } });
        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error('Error during logout:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
