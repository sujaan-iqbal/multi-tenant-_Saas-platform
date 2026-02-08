const { Tenant, User } = require('../models');
const { hashPassword, comparePassword } = require('../utils/bcrypt');
const jwt = require('../utils/jwt');

// small helper to create simple slug
const slugify = (str = '') => {
    return str
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9\-]/g, '')
        .replace(/-+/g, '-');
};

const register = async (req, res) => {
    try {
        const { email, password, tenantName } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'email and password required' });
        }

        // Create tenant (simple single-tenant per register)
        const name = tenantName || email.split('@')[0];
        const slug = slugify(name + '-' + Date.now().toString(36).slice(-4));

        const tenant = await Tenant.create({ name, slug });

        const passwordHash = await hashPassword(password);

        const user = await User.create({
            tenantId: tenant._id,
            email,
            passwordHash,
            role: 'owner'
        });

        // generate token
        const token = jwt.generateToken({ userId: user._id, tenantId: tenant._id });

        const userObj = user.toObject();
        delete userObj.passwordHash;

        res.status(201).json({ message: 'registered', user: userObj, token });
    } catch (error) {
        console.error('Register error:', error.message);
        // duplicate key handling
        if (error.code === 11000) {
            return res.status(409).json({ error: 'Email or tenant already exists' });
        }
        res.status(500).json({ error: 'Registration failed' });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'email and password required' });
        }

        // find user and include passwordHash
        const user = await User.findOne({ email }).select('+passwordHash');
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const match = await comparePassword(password, user.passwordHash);
        if (!match) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // successful login
        const token = jwt.generateToken({ userId: user._id, tenantId: user.tenantId });

        const userObj = user.toObject();
        delete userObj.passwordHash;

        res.status(200).json({ message: 'login successful', token, user: userObj });
    } catch (error) {
        console.error('Login error:', error.message);
        res.status(500).json({ error: 'Login failed' });
    }
};

const getCurrentUser = async (req, res) => {
    try {
        // User is attached by auth middleware
        const user = req.user.toObject();
        delete user.passwordHash;
        
        res.status(200).json({
            user,
            tenantId: req.tenantId
        });
    } catch (error) {
        console.error('Get current user error:', error);
        res.status(500).json({ error: 'Failed to get user info' });
    }
};

const logout= async(req, res)=>{
    try{
        res.status(200).json({
            message: 'logout successful',
            note: 'client should delete the token'
        });
    }catch (error){
        console.error("logout error:", error);
        res.status(500).json({message: 'logout failed'
        });
    }
};

module.exports= {register, login, getCurrentUser, logout };