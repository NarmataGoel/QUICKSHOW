
import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const connection = await mongoose.connect(
            `${process.env.MONGODB_URL}/quickshow`,
            { serverSelectionTimeoutMS: 15000 }
        );

        console.log("Database connected:", connection.connection.host);
    } catch (error) {
        console.error("Database connection failed:", error.message);
        console.error("Detailed cause:", error.cause?.message);
        process.exit(1);
    }
};

export default connectDB;
