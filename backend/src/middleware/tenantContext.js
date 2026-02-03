function tenantContext (req, res, next) {
    
    if (req.tenantId){
        if (req.method=== 'POST' || req.method=== 'PUT' || req.method=== 'PATCH'){
            if (req.body && typeof req.body=== 'object'){
                req.body.tenantId= req.tenantId;
            }
        }

        req.tenantFilter= { tenantId: req.tenantId};

        req.tenantContext={
            tenantId: req.tenantId,
            userId: req.user?._id
        };

    }
    next();
}
module.exports= {tenantContext};