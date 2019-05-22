const fs = require('fs')
const readline = require('readline')
const { google } = require('googleapis')

// If modifying these scopes, delete token.json.
const SCOPES = [
  'https://mail.google.com/',
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/gmail.compose',
  'https://www.googleapis.com/auth/gmail.send',
]

const TOKEN_PATH = 'token.json'

export default function auth() {
  return new Promise((resolve, reject) => {
    // Load client secrets from a local file.
    fs.readFile('credentials.json', (err, content) => {
      if (err) return reject(err)
      // Authorize a client with credentials, then call the Gmail API.
      authorize(JSON.parse(content), resolve)
    })
  })
}
/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  const { client_secret, client_id, redirect_uris } = credentials.installed
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0])

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getNewToken(oAuth2Client, callback)
    oAuth2Client.setCredentials(JSON.parse(token))
    callback(oAuth2Client)
  })
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  })
  console.log('Authorize this app by visiting this url:', authUrl)
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })
  rl.question('Enter the code from that page here: ', code => {
    rl.close()
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err)
      oAuth2Client.setCredentials(token)
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), err => {
        if (err) return console.error(err)
        console.log('Token stored to', TOKEN_PATH)
      })
      callback(oAuth2Client)
    })
  })
}

/**
 * Lists the labels in the user's account.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
// function listLabels (auth) {
//   const gmail = google.gmail({ version: 'v1', auth })
//   gmail.users.labels.list({
//     userId: 'me'
//   }, (err, res) => {
//     if (err) return console.log(require('util').inspect({ err }, true, 10, true))
//     const labels = res.data.labels
//     if (labels.length) {
//       console.log('Labels:')
//       labels.forEach((label) => {
//         console.log(`- ${label.name}`)
//       })
//     } else {
//       console.log('No labels found.')
//     }
//   })
// }

export async function sendMail({ subject, body, to }) {
  const oAuth2Client = await auth(Promise.resolve)
  const gmail = google.gmail({
    version: 'v1',
    auth: oAuth2Client,
  })

  // const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`
  const messageParts = [
    `From: =?utf-8?B?${Buffer.from('Frédéric Robert').toString('base64')}?= mailfredericrobert@gmail.com>`,
    `To: ${to}`,
    'Content-Type: text/html; charset=utf-8',
    'MIME-Version: 1.0',
    `Subject: =?utf-8?B?${Buffer.from(subject).toString('base64')}?=`,
    '',
    body,
  ]
  const message = messageParts.join('\n')

  // The body needs to be base64url encoded.
  const encodedMessage = Buffer.from(message)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')

  const res = await gmail.users.messages.send({
    userId: 'me',
    requestBody: {
      raw: encodedMessage,
    },
  })
  console.log(res.data)
  return res
}
