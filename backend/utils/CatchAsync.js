
module.exports = (fn)=>{
    return (req , res, next)=>{
        // executer la fonction et si il renvoie une promesse rejeté , on appel next(err)
        Promise.resolve(fn(req,res,next)).catch(next)
    }
}