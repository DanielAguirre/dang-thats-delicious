const mongoose = require('mongoose');
const Store = mongoose.model('Store');
const User = mongoose.model('User');
const multer = require('multer');
const jimp = require('jimp');
const uuid = require('uuid');

const multerOptions = {
  storage: multer.memoryStorage(),
  fileFilter(req, file, next) {
    const isPhoto = file.mimetype.startsWith('image/');
    if(isPhoto) {
      next(null, true);
    } else {
      next({ message: 'That filetype isn\'t allowed!'}, false);
    }
  }
};

exports.homePage = (req, res) => {
  res.render('index');
}

exports.addStore = (req, res) => {
  res.render('editStore', { title: 'Add Store' });
}

exports.upload = multer(multerOptions).single('photo');

exports.resize = async (req, res, next) => {
  // check if there is no new file to resize
  if( !req.file ) {
    next(); // skip to the next middleware
    return;
  }
  const extension = req.file.mimetype.split('/')[1];
  req.body.photo= `${uuid.v4()}.${extension}`;
  // now we resize
  const photo = await jimp.read(req.file.buffer);
  await photo.resize(800, jimp.AUTO);
  await photo.write(`./public/uploads/${req.body.photo}`);
  // once we have  written the photo to our filesystem, keep going!
  next();
}

exports.createStore = async (req, res) => {
  req.body.author = req.user._id;
  const store = await (new Store(req.body)).save();
  req.flash('success', `Succesfully Created ${store.name}. Care to leave a revie`)
  res.redirect(`/store/${store.slug}`);
}

exports.getStores = async (req, res) => {
  const page = req.params.page || 1;
  const limit = 4;
  const skip = (page * limit) - limit;
  // 1. Query all storesu
  const storePromise = Store.find().skip(skip).limit(limit).sort({ created: 'desc' })
  const countPromise = Store.count();


  const [stores, count] = await Promise.all([storePromise, countPromise]);

  const pages = Math.ceil(count / limit);
  if(!stores.length && skip) {
    req.flash('info', `Hey! You asked for page ${page}. But that doesn't exists. So iput you on page ${page}`)
    res.redirect(`/stores/page/${page}`);
    return;
  }
  res.render('stores', { title: 'Stores' + count, stores, page, pages, count });

  res.render('stores', { title:'stores', stores});
}

const confirmOwner = (store, user) => {
  if(!store.author.equals(user._id)){
    throw Error('You must own  a store in order  to edit it!');
  }
}

exports.editStore = async(req, res) => {
 // 1. Find the store given the ID
 const store = await Store.findOne({ _id: req.params.id });

 confirmOwner(store, req.User)

 // 2 Confirm they are the owner of the store
 res.render('editStore', { title: `Edit ${store.name}`, store });
}

exports.updateStore = async (req, res) => {
  // find and update the store
  const store = await Store.findOneAndUpdate({ _id: req.params.id }, req.body, {
    new:true, // return the new store instead of the old one
    runValidators: true,
  }).exec();
  req.flash('success', `Succesfully updated <strong>${store.name}</strong>. <a href="/stores/${store.slug}">View Store -> </a>`);
  // Redirect then the store and tell them it worked
  res.redirect(`/stores/${store._id}/edit`);
}


exports.getStoreBySlug = async (req, res, next) => {
  const store = await Store.findOne({ slug: req.params.slug }).populate('author reviews');
  if(!store) return next();
  res.render('store', { store, title: store.name });
};


exports.getStoresByTag = async (req, res) => {
  const tag = req.params.tag;
  const tagQuery = tag || { exists: true };
  const storese = Store.getTagsList();
  const sotrePromise = store.find({ tags: tag })

  const [tags, stores]= await  Promise.all([tagsPromise, storesPromise]);
 
  res.render('tag', { tags, title:'Tags', tag, stores });
};

exports.searchStore = async (req, res) => {
  const stores = await Store.find({
  // first find stores that match
    $text: {
      $search: req.query.q
    }
  }, {
    score: {$meta: 'textScore' }
  })
  // the sort them
  .sort({
    score: { $meta: 'textSxore' }
  })
  // limit to only 5 results
  .limit(5);

  res.json(stores);
}

exports.mapStores = async(req, res) => {
  const coordinates = [req.query.lng, req.query.lat].map(parseFloat);
  const q = {
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates,
        },
      $maxDistance: 10000 // 10km
      }
    }
  };
  const stores = await Store.find(q).select('slug name description photo').limit(10);
  res.json(stores);
}

exports.mapPage = (req, res) => {
  res.render('map', {title:'Map'});
}

exports.heartStore = async(req, res) => {
  const hearst = req.user.hearts.map(obj => obj.toString());
  const operator = hears.includes(req.params.id) ? '$pull': '$addToSet';
  const user = await User.findByIdAndUpdate(req.user._id, 
    { [operator]: {hearts: req.params.id }},
    { new: true }
  );

  res.json(hearts);
}

exports.getHearst = async (rer, res) => {
  const stores = await Store.find({
    _id: { $in:req.user.hearts }
  });

  res.render('stores', {title: 'Hearted Stores', stores})
}

exports.getTopStores = async(req, res) => {
  const stores = await Store.getTopStores().populate('reviews');
  res.render('topStores', {title: '* Top Stores!', stores})
}
