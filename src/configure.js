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
