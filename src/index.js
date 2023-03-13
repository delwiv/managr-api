import bodyParser from 'body-parser'
import contacts from './routes/contactRoutes'
import cors from 'cors'
import emails from './routes/emails'
import express from 'express'
import mongoose from 'mongoose'
import morgan from 'morgan'
import { MONGODB_DATABASE, MONGODB_HOST, MONGODB_PASSWORD, MONGODB_PORT, MONGODB_USERNAME, PORT } from './config.json'

mongoose.connect(`mongodb://${MONGODB_USERNAME}:${MONGODB_PASSWORD}@${MONGODB_HOST}:${MONGODB_PORT}/${MONGODB_DATABASE}`, { useNewUrlParser: true }, connectErr => {
  console.log(connectErr || `MongoDB connected to ${MONGODB_HOST}:${MONGODB_PORT}`)
})

const app = express()

app.use(morgan('tiny'))
app.use(cors())

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.use('/contacts', contacts)
app.use('/emails', emails)

app.listen(PORT, () => {
  console.log(`App listenning on ${PORT}`)
})
