import express from 'express'
import mongoose from 'mongoose'
import contacts from './routes/contactRoutes'
import morgan from 'morgan'
import cors from 'cors'
import bodyParser from 'body-parser'

const DB = 'mongodb://localhost/managr'
const PORT = 3038

mongoose.connect(
  DB,
  () => {
    console.log(`connected to ${DB}`)
  }
)

const app = express()

app.use(morgan('tiny'))
app.use(cors())

app.use(bodyParser.urlencoded())
app.use(bodyParser.json())

app.use('/contacts', contacts)

app.listen(PORT, () => {
  console.log(`App listenning on ${PORT}`)
})
