const mongoose = require('mongoose')
const Store = mongoose.model('Store')
const multer = require('multer')
const uuid = require('uuid')
const jimp = require('jimp')

const multerOptions = {
  storage: multer.memoryStorage(),
  fileFilter(req, file, next) {
    const isPhoto = file.mimetype.startsWith('image')
    if (isPhoto) {
      next(null, true)
    } else {
      next({ message: 'Invalid file type'}, false)
    }
  }
}

exports.homePage = (req, res) => {
  res.render('index')
}

exports.addStore = (req, res) => {
  res.render('editStore', {title: 'Add Store'})
}

exports.upload = multer(multerOptions).single('photo')

exports .resize = async (req, res, next) => {
  if (!req.file) {
    next()
    return
  }

  const extension = req.file.mimetype.split('/')[1]
  req.body.photo = `${uuid.v4()}.${extension}`
  const photo = await jimp.read(req.file.buffer)
  await photo.resize(800, jimp.AUTO)
  await photo.write(`./public/uploads/${req.body.photo}`)
  next()
}

exports.saveStore = async (req, res) => {
  const store = new Store(req.body)
  await store.save()
  req.flash('success', 'New Store Saved')
  res.redirect('/')
}

exports.getStores = async (req, res) => {
  const stores = await Store.find()
  console.log(stores);
  res.render('stores', {title: 'Stores', stores})
}

exports.editStore = async (req, res) => {
  const store = await Store.findOne({_id: req.params.id})
  res.render('editStore', {title: 'Edit Store', store})
}

exports.updateStore = async (req, res) => {
  req.body.location.type = 'Point'
  const store = await Store.findOneAndUpdate({_id: req.params.id}, req.body, {
    new: true,
    runValidators: true
  }).exec()
  req.flash('success', 'Store updated')
  res.redirect(`/stores/${store.id}/edit`)
}
