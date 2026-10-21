import mongoose from "mongoose";

let connectionPromise;

const connectDB = async () => {
    const mongoUrl = process.env.MONGODB_URL;

    if (!mongoUrl) {
        throw new Error("MONGODB_URL is not configured");
    }

    if (mongoose.connection.readyState === 1) {
        return mongoose;
    }

    if (!connectionPromise) {
        mongoose.connection.once("connected", () => console.log("Database connected"));
        connectionPromise = mongoose
            .connect(mongoUrl, { dbName: "quickshow" })
            .finally(() => {
                connectionPromise = undefined;
            });
    }

    await connectionPromise;
    return mongoose;
};

export default connectDB;