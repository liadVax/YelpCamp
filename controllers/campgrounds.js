const { cloudinary } = require('../cloudinary');
const Campground = require('../models/campground');
const nominatim = require('nominatim-client');

const client = nominatim.createClient({
  useragent: 'Yelp-Camp', // The name of your application
  referer: 'http://example.com', // The referer link
});

module.exports.index = async (req, res) => {
  const campgrounds = await Campground.find({});
  res.render('campgrounds/index', { campgrounds });
};

module.exports.createCampground = async (req, res, next) => {
  const newCamp = new Campground(req.body.campground);
  newCamp.images = req.files.map((f) => ({ url: f.path, filename: f.filename }));
  newCamp.author = req.user._id;
  await newCamp.save();
  req.flash('success', 'Successfully made a new campground!');
  res.redirect(`/campgrounds/${newCamp._id}`);
};

module.exports.showCampground = async (req, res) => {
  const campground = await Campground.findById(req.params.id)
    .populate({
      path: 'reviews',
      populate: {
        path: 'author',
      },
    })
    .populate('author');
  if (!campground) {
    req.flash('error', 'Campground is not exist');
    return res.redirect('/campgrounds');
  }

  const geo_info = await client.search({ q: campground.location });
  let map_url = 'https://www.openstreetmap.org/export/embed.html';

  if (geo_info.length > 0) {
    const { boundingbox, lat, lon } = geo_info.at(0);
    map_url = map_url.concat(
      `?bbox=${boundingbox[2]}%2C${boundingbox[0]}%2C${boundingbox[3]}%2C${boundingbox[1]}&amp;layer=mapnik&marker=${lat},${lon}`
    );
  }
  res.render('campgrounds/show', { campground, map_url });
};

module.exports.showEditForm = async (req, res) => {
  const id = req.params.id;
  const campground = await Campground.findById(id);
  if (!campground) {
    req.flash('error', 'Cannot find that campground!');
    return res.redirect('/campgrounds');
  }
  res.render('campgrounds/edit', { campground });
};

module.exports.editCampground = async (req, res) => {
  const id = req.params.id;
  const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
  const images = req.files.map((f) => ({ url: f.path, filename: f.filename }));
  campground.images.push(...images);
  await campground.save();
  if (req.body.deleteImages) {
    for (let filename of req.body.deleteImages) {
      await cloudinary.uploader.destroy(filename);
    }
    await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } });
  }
  req.flash('success', 'Successfully updated campground!');
  res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.deleteCampground = async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  for (let img of campground.images) {
    await cloudinary.uploader.destroy(img.filename);
  }
  await Campground.deleteOne(campground);
  req.flash('success', 'Successfully deleted campground!');
  res.redirect('/campgrounds');
};
