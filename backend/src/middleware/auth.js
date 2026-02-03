const jwt= require('jsonwebtoken');
const {User}= require('../models');

async function authenticate(req, res, next){
    try{
        const authHeader= req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')){
            return  res.status(401).json({error:'No token Provided'});
        }
        const token= authHeader.split(' ')[1];
        const decoded =jwt.verify(token.process.env.JWT_SECRET);
        //fetching user form DB (not trusting the token alone)
        const User = await User.findOne({
            _id: decoded.userId,
            tenantId: decoded.tenantId,
            status: 'active'
        }).select('-passwordHash'); //dont return password
        
        if (!user){
            return res.status(401).json({error: 'user not found or inactive!'});
        }

        req.user=  user;
        req.tenantId= user.tenantId;
        next();


    }
    catch(error){
        if (error.name=='JsonWebTokenError'){
            return res.status(401).json({error: 'Invalid Token!'});
        }
        if (error.name=='TokenExpiredError'){
            return res.status(401).json({error: 'Token expired!'});
        }
        console.error('Authentication middleware error', error);
        return res.status(500).json({error: 'authentication failed'});
    }
};
module.exports= {authenticate};