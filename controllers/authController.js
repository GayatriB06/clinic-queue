const jwt = require('jsonwebtoken');
const User = require('../models/User');

const signToken = (user) => 
    jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1w' });

    const setCookie = (res, token) => {
        res.cookie('jwt', token, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
            sameSite: "lax",
        });
    };

    exports.register = async (req, res) => {
        try {
            const { name, email, password } = req.body;

            const exists = await User.findOne({ email });
            if(exists)
                return res.status(400).json({ message: 'User already exists' });
            
            const user = await User.create({ name, email, password, role: 'patient' });
            setCookie(res, signToken(user));
            res.redirect('/');
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }
    };

    exports.login = async (req, res) => {
        try {
            const { email, password } = req.body;
            
            const user = await User.findOne({email});
            if (!user || !(await user.comparePassword(password))){
                return res.status(401).send("invalid");
            }
            setCookie(res, signToken(user));
            res.redirect("/");
            
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }
    };

    exports.logout = (req,res) =>{
        res.clearCookie("jwt");
        res.redirect("/");
    };
