import ContactModel from '../models/ContactModel.js'

export default {
  list: async (req, res) => {
    const { q } = req.query

    const query = {}
    if (q) {
      if (q.match(/month:\d+/)) {
        Object.assign(query, {
          mois_contact: q.replace('month:', '')
        })
      } else if (q.match(/v:.+/)) {
        Object.assign(query, {
          ville: new RegExp(q.replace('v:', ''), 'gi')
        })
      } else {
        const regex = new RegExp(q, 'i')
        Object.assign(query, {
          $or: [
            {
              nom: regex
            },
            {
              mail: regex
            },
            {
              mail2: regex
            },
            {
              mail3: regex
            },
            {
              responsable: regex
            },
            {
              ville: regex
            },
            {
              notes: regex
            }
          ]
        })
      }
    }

    const params = {
      sort: {
        departement: 1,
        ville: 1,
        nom: 1
      }
    }

    const [contacts, count] = await Promise.all([
      ContactModel.find(query, 'departement ville _id nom responsable mail envoi_mail mois_contact vu_le site', params),
      ContactModel.count(query)
    ])
    return res.json({ contacts, count })
  },

  show: function (req, res) {
    var id = req.params.id
    ContactModel.findOne({ _id: id }, function (err, contact) {
      if (err) {
        return res.status(500).json({
          message: 'Error when getting contact.',
          error: err
        })
      }
      if (!contact) {
        return res.status(404).json({
          message: 'No such contact'
        })
      }
      return res.json(contact)
    })
  },

  create: function (req, res) {
    var contact = new ContactModel(req.body)

    contact.save(function (err, contact) {
      if (err) {
        return res.status(500).json({
          message: 'Error when creating contact',
          error: err
        })
      }
      return res.status(201).json(contact)
    })
  },

  update: function (req, res) {
    var id = req.params.id
    ContactModel.findOne({ _id: id }, function (err, contact) {
      if (err) {
        return res.status(500).json({
          message: 'Error when getting contact',
          error: err
        })
      }
      if (!contact) {
        return res.status(404).json({
          message: 'No such contact'
        })
      }

      const { checked, ...body } = req.body

      Object.assign(contact, body)

      contact.save(function (err, contact) {
        if (err) {
          return res.status(500).json({
            message: 'Error when updating contact.',
            error: err
          })
        }

        return res.json(contact)
      })
    })
  },

  remove: function (req, res) {
    var id = req.params.id
    ContactModel.findByIdAndRemove(id, function (err, contact) {
      if (err) {
        return res.status(500).json({
          message: 'Error when deleting the contact.',
          error: err
        })
      }
      return res.status(204).json()
    })
  }
}
