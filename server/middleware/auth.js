import { clerkClient } from "@clerk/express";

export const protectAdmin = async (req,res,next)=>{
    try{
        const {userId} = req.auth();
        if(!userId){
            return res.status(401).json({
                success:false,
                message:"Authentication required"
            })
        }

        const user = await clerkClient.users.getUser(userId)
        if(user.privateMetadata.role!== 'admin'){
           return res.status(403).json({
            success:false ,
            message :"not authorized"
           })
        }
        next();

    }catch(error){
       console.error('Admin authorization failed:', error)
       res.status(500).json({
            success:false ,
            message :"Unable to verify admin access"
           })

    }
}