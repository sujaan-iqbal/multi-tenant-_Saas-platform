function tenantContext(req, res, next){
    
    if (req.body && req.tenantId){
        req.body.tenantId= req.tenantId;

    }
    req.tenantFilter= {tenantId: req.tenantId};

    //logging
    req.tenantContext={
        id: req.tenantId,
        userId: req.user?._id
    };

    next();
}
module.exports= {tenantContext};