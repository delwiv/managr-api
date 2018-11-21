import mongoose from 'mongoose'

const Schema = mongoose.Schema

const contactSchema = new Schema(
  {
    adresse: String,
    cd: String,
    cible: String,
    cp: String,
    date_cd: String,
    departement: String,
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
    vu_le: String
  },
  {
    strict: false
  }
)

export default mongoose.model('contact', contactSchema)
