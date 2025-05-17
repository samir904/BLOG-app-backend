import app from "./app.js";
import dbConnection from "./config/dbconnection.js";



const port=process.env.PORT||8080;

app.listen(port,async()=>{
    
        await dbConnection()
    console.log(`app is listning on port http://localhost:${port}`)

})