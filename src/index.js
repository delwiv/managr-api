import express from 'express'
import mongoose from 'mongoose'
import contacts from './routes/contactRoutes'
import morgan from 'morgan'
import cors from 'cors'
import bodyParser from 'body-parser'

import { DB_URL, PORT } from './config.json'

mongoose.connect(
  DB_URL,
  () => {
    console.log(`connected to ${DB_URL}`)
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
