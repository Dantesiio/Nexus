import mongoose from "mongoose";

export async function connectionDB() {
    try {
        const db = (await mongoose.connect(process.env.DB_URI as string)).connection;
        db.on("error", console.error.bind(console, "MongoDB connection error:"));
        db.once("open", () => console.log("Connected to MongoDB database"));
        return db;
    } catch (error) {
        console.error("Database connection failed:", error);
        process.exit(1); // Cerrar el proceso si la conexión falla
    }
}
