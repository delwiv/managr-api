import '@babel/polyfill'
import 'dotenv/config'

import { join } from 'path'
import { promises } from 'fs'

const { writeFile } = promises

const config = {
  DB_URL: process.env.DB_URL,
  PORT: process.env.PORT,
  MAILCHIMP_API_KEY: process.env.MAILCHIMP_API_KEY,
  MAILCHIMP_BASE_URL: process.env.MAILCHIMP_BASE_URL,
  MONGODB_USERNAME:process.env.MONGODB_USERNAME,
  MONGODB_HOST:process.env.MONGODB_HOST,
  MONGODB_PORT:process.env.MONGODB_PORT,
  MONGODB_PASSWORD:process.env.MONGODB_PASSWORD,
  MONGODB_DATABASE:process.env.MONGODB_DATABASE,
  months: [
    'Ignorer',
    'Janvier',
    'Février',
    'Mars',
    'Avril',
    'Mai',
    'Juin',
    'Juillet',
    'Août',
    'Septembre',
    'Octobre',
    'Novembre',
    'Décembre',
  ],
}
const configure = async () => {
  await writeFile(join(__dirname, 'config.json'), JSON.stringify(config, null, 2))
  await writeFile(join(__dirname, '..', 'dist', 'config.json'), JSON.stringify(config, null, 2))
  process.exit(0)
}

configure()
