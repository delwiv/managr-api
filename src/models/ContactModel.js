import mongoose from 'mongoose'

const Schema = mongoose.Schema

const contactSchema = new Schema(
  {
    adresse: String,
    cd: String,
    cible: String,
    cp: String,
    date_cd: String,
    departement: Number,
    envoi_mail: String,
    id: String,
    mail: String,
    mail2: String,
    mail3: String,
    mois_contact: String,
    mois_envoi: String,
    nom: String,
    notes: String,
    responsable: String,
    responsable2: String,
    responsable3: String,
    tel_perso: String,
    tel_pro: String,
    tel3: String,
    ville: String,
    vu_le: String,
    site: String,
    sendMailStatus: {},
  },
  {
    strict: false,
    timestamps: true,
  }
)

contactSchema.statics = {
  fixDocs() {
    return new Promise((resolve, reject) => {
      let fixed = 0
      const cursor = this.find({}).cursor()
      cursor.on('data', async doc => {
        try {
          doc.departement = +doc.departement
          await doc.save()
          ++fixed
          console.log('fixed: ', fixed)
        } catch (error) {
          console.error(error)
        }
      })
      cursor.on('end', () => resolve(fixed))
    })
  },
}

const model = mongoose.model('contact', contactSchema)

export default model
