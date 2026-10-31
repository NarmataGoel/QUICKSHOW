import { clerkClient } from "@clerk/express";
import Booking from "../models/Booking.js";
import Movie from "../models/Movie.js";
import Show from "../models/Show.js";


// API controller function to get user bookings
export const getUserBookings = async (req, res) => {
    try{
        const {userId} = req.auth();
        if(!userId){
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        const storedBookings = await Booking.find({user: userId})
            .sort({createdAt:-1})
            .lean();
        const shows = await Show.find({
            _id: {$in: storedBookings.map(booking => booking.show)}
        }).populate("movie").lean();
        const showsById = new Map(shows.map(show => [String(show._id), show]));
        const bookings = storedBookings.map(booking => ({
            ...booking,
            show: showsById.get(String(booking.show)) || null
        }));

        return res.json({success:true ,
            bookings
        })
    }catch(error){
        console.error(error);
        return res.status(500).json({
            success: false,
             message:error.message
        })
    }
}

// api controller function to update favorite movie in clerk user Metadata
export const UpdateFavorite = async (req,res) => {
    try{
        const {movieId}= req.body;
        const {userId} = req.auth();

        const user = await clerkClient.users.getUser(userId)

        if(!user.privateMetadata.favorites){
            user.privateMetadata.favorites =  []
        }
        if(!user.privateMetadata.favorites.includes(movieId)){
            user.privateMetadata.favorites.push(movieId);
        }else {
            user.privateMetadata.favorites = user.privateMetadata.favorites.filter(
                item => item!== movieId
            )
        }
        await clerkClient.users.updateUserMetadata(userId,{privateMetadata:user.privateMetadata})
         res.json({
            success:true ,
            message:"Favorite movies updated"
         })
    }catch(error){
        console.error(error.message)
        res.json({
            success : false ,
            message : error.message
        })

    }
}

export const getFavorites = async (req,res)=>{
    try{
        const user = await clerkClient.users.getUser(req.auth().userId)
        const favorites = user.privateMetadata.favorites || [];

        // getting movies from database
        const movies = await Movie.find({_id:{$in:favorites}})
        res.json({
             success : true ,
            movies
        })

    }catch(error){
        console.error(error.message)
        res.json({
            success : false ,
            message : error.message
        })
    }

}