import User from '../models/user.js';
import Sequelize from 'sequelize';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const saltRounds = 10;

export const SignUp = async (req, res) => {
    const { username, email, password } = req.body;
    // console.log(req.body);

    try {
        const existingUser = await User.findOne({
            where: {
                [Sequelize.Op.or]: [{ username }, { email }],
            },
        });
        
        if (existingUser) {
            console.log('User already exists');
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const newUser = await User.create({ username, email, password: hashedPassword });

        // console.log('New user created:', newUser);
        const token = jwt.sign({ id: newUser.id, email: newUser.email, name: username, image: newUser.userImage }, process.env.SECRET, { expiresIn: "24h" });

        res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'strict' })
        console.log('userss',newUser.dataValues)
        res.status(201).json({ user: newUser.dataValues, token: token });
    } catch (err) {
        console.error('Error during sign up:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

export const LogIn = async (req, res) => {
    const { username, password } = req.body;
    console.log(req.body);

    try {
        const user = await User.findOne({
            where: { username: username }
        });

        if (!user) {
            return res.status(400).json({ message: 'User does not exist' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            console.log('Password Incorrect, access denied');
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user.id, email: user.email, name: username, image: user.userImage }, process.env.SECRET, { expiresIn: "24h" });
        res.status(200).cookie('token', token, { httpOnly: true, secure:true, sameSite: 'strict' }).json({ user: user.dataValues, token });
    } catch (err) {
        console.error('Error during login:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

export const Logout = (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logged Out' });
};
