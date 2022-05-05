const jwt = require("jsonwebtoken");

const auth = async(req,res,next)=>{
    let token = req.cookies.jwt;
    if(token==null){
        return res.sendStatus(401);
    }

    jwt.verify(token, process.env.ACCESS_TOKEN, (err,user) => {
        if(err){
            return res.sendStatus(401);
        }
        req.user = user;
        next();
    });
};

module.exports = auth;