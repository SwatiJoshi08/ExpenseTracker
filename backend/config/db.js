import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        await mongoose.connect(
            "mongodb://swatijoshi08072005_db_user:SGWx1BXb80vbXg6c@ac-vvwe72y-shard-00-00.rhqlos4.mongodb.net:27017,ac-vvwe72y-shard-00-01.rhqlos4.mongodb.net:27017,ac-vvwe72y-shard-00-02.rhqlos4.mongodb.net:27017/Expense?ssl=true&replicaSet=atlas-vhss7e-shard-0&authSource=admin&retryWrites=true&w=majority"
        );
        console.log("DB CONNECTED");
    } catch (error) {
        console.error("DB ERROR:", error.message);
    }
};