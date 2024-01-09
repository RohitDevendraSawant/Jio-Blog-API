import jwt from "jsonwebtoken";
const JWT_SECRET = 'AuthenticationSuccessfull';


const authenticateUser = (req,res,next) => {
    const token = req.header('auth-token');
    if(!token){
        return res.status(401).send({error:"Authenticate using a valid token"});
    }
    try{
        const data = jwt.verify(token,JWT_SECRET);
        console.log(data);
        req.user = data.user;
        next();
    } catch(error){
        return res.status(501).json({"message" : "You are not an authorised user to perform this operation."});
    }
}

export default authenticateUser;