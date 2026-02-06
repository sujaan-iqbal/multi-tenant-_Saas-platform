const register= (req, res) =>{
    console.log('Register called with:', req.body);
    res.json({message: 'real register will create tenant++user'});
};
const login= (req, res)=> {
    console.log({message: 'real login auth'});
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