require('dotenv').config()
const express = require('express')
const path = require('path')
const cors = require('cors')
const { logger } = require('./middleware/logEvents')
const errorHandler = require('./middleware/errorHandler')
const corsOptions = require('./config/corsOptions')
const verifyJWT = require('./middleware/verifyJWT')
const cookieParser = require('cookie-parser')
const credentials = require('./middleware/credentials')
const mongoose = require('mongoose')
const connectDB = require('./config/dbConfig')
const app = express()
const PORT = process.env.PORT || 3500

// Connecting to the Database
connectDB()

// Custom middleware logger
app.use(logger)
app.use(credentials)

// CORS - Cross Origin Resource Sharing 
app.use(cors(corsOptions))

// Built-in middleware
app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.use(cookieParser())
app.use(express.static(path.join(__dirname, '/public')))

app.use('/', require('./routes/root'))
app.use('/register', require('./routes/register'))
app.use('/auth', require('./routes/auth'))
app.use('/refreshToken', require('./routes/refresh'))
app.use('/logout', require('./routes/logout'))
app.use(verifyJWT)
app.use('/employees', require('./routes/apis/employee'))

app.all('*', (req, res) =>{
    res.status(404)
    if (req.accepts('html')) {
        res.sendFile(path.join(__dirname, 'views', '404.html'))
    } else if (req.accepts('json')) {
        res.json({ error: '404 Not Found'})
    } else {
        res.type('txt').send('404 Not Found')
    } 
})

app.use(errorHandler)

mongoose.connection.once('open', () => {
    console.log(`Connected to MongoDB`)
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
})

 