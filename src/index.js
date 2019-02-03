import bodyParser from 'body-parser'
import contacts from './routes/contactRoutes'
import cors from 'cors'
import emails from './routes/emails'
import express from 'express'
import mongoose from 'mongoose'
import morgan from 'morgan'

import { DB_URL, PORT } from './config.json'

mongoose.connect(DB_URL, () => {
  console.log(`connected to ${DB_URL}`)
})

const app = express()

app.use(morgan('tiny'))
app.use(cors())

app.use(bodyParser.urlencoded())
app.use(bodyParser.json())

app.use('/contacts', contacts)
app.use('/emails', emails)

app.listen(PORT, () => {
  console.log(`App listenning on ${PORT}`)
})
