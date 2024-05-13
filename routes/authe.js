import express from 'express';
const router = express.Router();
import User from '../models/user.js';
import sequelize from 'sequelize';
import jtw from "jsonwebtoken"
const saltround = 10;

import bcrypt, { hash } from 'bcrypt';
router.post('/Register', async (req, res) => {
    const { username, email, password } = req.body;
    console.log(req.body);
    try {
        const existingUser = await User.findOne({
            where: {
                [sequelize.Op.or]: [{ username }, { email }],
            },
        });
        if (existingUser) {
            console.log('user exist')
            return res.status(400).json({ message: "user already exists" })
        }
        const user = bcrypt.hash(password, saltround, async (err, hash) => {
            if (err) {
                console.log('hash erro', err);
            } else {
                await User.create({ username, email, password: hash });
            }
        })

        jtw.sign({ id: user._id, email }, process.env.SECRET, { expiresIn: "10min" })

        user.token
    } catch (err) {
        console.log(err)
    }
    // try {
    //     const checkUserExist = await db.query('SELECT * FROM users WHERE email = $1', [username])
    //     if (checkUserExist.rows.length > 0) {
    //         console.log('user exist')
    //         return res.status(409).json({ error: 'User already exists' });
    //     } else {
    //         bcrypt.hash(password, saltround, async (err, hash) => {
    //             if (err) {
    //                 console.log('hash erro', err);
    //             } else {
    //                 await db.query('INSERT INTO users (email,password) VALUES($1,$2)', [username, hash]);
    //             }
    //         })
    //     }
    // } catch (err) {
    //     console.log(err);
    // }
})

router.post('/Login', async (req, res) => {
    const { username, password } = req.body;

    console.log(req.body)

    const user = await User.findOne({
        where: { username },
    });
    if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }
    bcrypt.compare(password, user.password, (err, result) => {
        if (err) {
            console.log('Password Incorrect access denied')
            res.status(409).json('Password Incorrect access denied')
        } else {
            console.log('user logedin successfully')
            res.status(200).json('user logedin successfully')
        }
    })

    //     const checkuser = await db.query('SELECT * FROM users WHERE email=$1', [username]);

    //     if (checkuser.rows.length > 0) {
    //         const StoredHashPass = checkuser.rows[0].password;
    //         bcrypt.compare(LoginPassword, StoredHashPass, (err, result) => {
    //             if (err) {
    //                 res.status(409).json('Password Incorrect access denied')
    //             } else {
    //                 res.status(200).json('user logedin successfully')
    //             }
    //         })
    //     } else {
    //         res.status(409).json('User not found')
    //         console.log('user not found');
    //     }
    // } catch (err) {
    //     console.log(err);
})

export default router