

exports.authorize = (...rolesAuthorize)=>{
    return (req,res,next)=>{
        if(!req.user || !rolesAuthorize.includes(req.user.role)){
            return res.status(403).json({
                success: false,
                error : 'vous avez pas la permission acceder avec cette ressource '
            })
        }

        next()
    }
}
