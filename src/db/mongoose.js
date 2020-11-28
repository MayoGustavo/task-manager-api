const mongoose = require('mongoose')


mongoose.connect(process.env.MONGODB_URL, {useNewUrlParser:true, useUnifiedTopology:true, useCreateIndex:true, useFindAndModify:false})
.then( () => 
{
    console.log("Mongoose is now connected to Mongo DB")
}
).catch( (error) => 
{
    console.log("Connection Error!" , error)
})