import User from '../models/user.js';
import Sequelize from 'sequelize';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const saltRounds = 10;

export const SignUp = async (req, res) => {
    const { username, email, password } = req.body;
    console.log(req.body);

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

        console.log('New user created:', newUser);
        // You can uncomment and use JWT token creation if needed
        const token = jwt.sign({ id: newUser.id, email: newUser.email }, process.env.SECRET, { expiresIn: "24h" });
        console.log(token)
        res.status(201).json({
            message: 'User registered successfully',
            token:token
        });

    } catch (err) {
        console.error('Error during sign up:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

export const LogIn =async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({
            where: { username },
        });

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log('Password Incorrect access denied');
            return res.status(401).json({ message: 'Invalid credentials' });
        }else if(isMatch){
           const token = jwt.sign({ id: newUser.id, email: newUser.email }, process.env.SECRET, { expiresIn: "24h" });
        console.log(token)
                res.status(200).json({
                    message: 'User logged in successfully',
                    user: {
                        id: user.id,
                        username: user.username,
                        email: user.email,
                    },
                });
          res.status(201).json({
            message: 'User registered successfully',
            token:token
        });

           
    }
    } catch (err) {
        const error = new Error(err)
        error.errorStatusCode = 500;
        error.message='Server error'
    }
}