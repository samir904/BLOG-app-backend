import mongoose from "mongoose";

const mongo_url=process.env.MONGO_URI||"mongodb://127.0.0.1:27017/bLOG"

async function dbConnection() {
    const{connection}=await mongoose.connect(mongo_url)
    if(connection){
        console.log(`db is connected to${connection.host}`)
    }
}

export default dbConnection;