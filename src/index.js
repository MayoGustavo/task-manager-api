const express = require('express')
require('./db/mongoose')
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')


const app = express()
const PORT = process.env.PORT


app.use(express.json())
app.use(userRouter)
app.use(taskRouter)


app.listen(PORT, () => {
    console.log("Tasks manager app listening at http://localhost:" + PORT)
})