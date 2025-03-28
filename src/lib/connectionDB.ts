import mongoose from 'mongoose';

const connectionString:string = "mongodb://localhost:27017";

export const db = mongoose.connect(connectionString, {dbName:"compunet03"}).then(()=>{
    console.log("Connected to MongoDB");
}
).catch((error)=>{
    console.log(error);
    process.exit(1);
}
);