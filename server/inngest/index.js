
import { Inngest } from "inngest";
import User from "../models/user.js";
import connectDB from "../configs/db.js";

// Create Inngest client
export const inngest = new Inngest({
    id: "movie-ticket-booking"
});

// Function to save a newly created Clerk user
const syncUserCreation = inngest.createFunction(
    {
        id: "sync-user-from-clerk",
        triggers: [{ event: "clerk/user.created" }]
    },
    async ({ event }) => {
        await connectDB();

        const {
            id,
            first_name,
            last_name,
            email_addresses,
            image_url
        } = event.data;

        const userData = {
            _id: id,
            email: email_addresses[0].email_address,
            name: first_name + " " + last_name,
            image: image_url
        };

        await User.create(userData);
    }
);

// Function to delete a Clerk user
const syncUserDeletion = inngest.createFunction(
    {
        id: "delete-user-from-clerk",
        triggers: [{ event: "clerk/user.deleted" }]
    },
    async ({ event }) => {
        await connectDB();

        const { id } = event.data;

        await User.findByIdAndDelete(id);
    }
);

// Function to update a Clerk user
const syncUserUpdation = inngest.createFunction(
    {
        id: "update-user-from-clerk",
        triggers: [{ event: "clerk/user.updated" }]
    },
    async ({ event }) => {
        await connectDB();

        const {
            id,
            first_name,
            last_name,
            email_addresses,
            image_url
        } = event.data;

        const userData = {
            email: email_addresses[0].email_address,
            name: first_name + " " + last_name,
            image: image_url
        };

        await User.findByIdAndUpdate(id, userData);
    }
);

// Export all Inngest functions
export const functions = [
    syncUserCreation,
    syncUserDeletion,
    syncUserUpdation
];
