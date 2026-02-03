const errorhandler= (err, req, res, next)=> {
    console.error('error:', err.message);
    console.error('Stack:'. err.stack);

    const statusCode= err.statusCode || 500;
    const message= err.message || "Internal server error";

    if (err.code===11000){
        return res.status(400).json({
            error:'duplicate key error',
            details:'this value already exists'
        });
    }

    if (err.name=== 'validationError'){
        const errors= Object.values(err.errors).map(e=> e.message);
        return res.status(400).json({
            error: 'validation failed',
            details: errors
        });
    
        // dead mount death play

    }
    if (err.name=== 'JsonWebTokenError'){
        return res.status(401).json({error: 'invalid token'});
    }
    if( err.name=== 'TokenExpiredError'){
        return res.status(401).json({error: 'token expired'});
    }

    const response={
        error: message
    };

    if (process.env.NODE_ENV==='development'){
        response.satck= err.stack;
    }
    res.status(statusCode).json(response);


};
module.exports= errorhandler;