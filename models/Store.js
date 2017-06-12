const mongoose = require('mongoose')
mongoose.Promise = global.Promise
const slug = require('slugs')

const storeSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: 'Please enter a name'
  },
  slug: String,
  description: {
    type: String,
    trim: true
  },
  tags: [String],
  created: {
    type: Date,
    default: Date.now
  },
  location: {
    type: {
      type: String,
      default: 'Point'
    },
    coordinates: [{
      type: Number,
      required: 'You must provide coordinates'
    }],
    address: {
      type: String,
      required: 'You must provide an address'
    }
  },
  photo: String,
  author: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: 'You must supply an author'
  }
})

storeSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = slug(this.name)
  }
  next()
})

storeSchema.statics.getTagsList = function() {
  return this.aggregate([
    { $unwind: '$tags'},
    { $group: { _id: '$tags', count: {$sum: 1}}},
    { $sort: {order: 1}}

  ])
}

module.exports = mongoose.model('Store', storeSchema)
