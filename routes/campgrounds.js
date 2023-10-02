const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isCampAuthor, validateCampground } = require('../middleware');
const campgrounds = require('../controllers/campgrounds');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

router
  .route('/')
  .get(catchAsync(campgrounds.index))
  .post(isLoggedIn, upload.array('image', 5), validateCampground, catchAsync(campgrounds.createCampground));

router.get('/new', isLoggedIn, (req, res) => {
  res.render('campgrounds/new');
});

router
  .route('/:id')
  .get(catchAsync(campgrounds.showCampground))
  .put(isLoggedIn, isCampAuthor, upload.array('image', 5), validateCampground, catchAsync(campgrounds.editCampground))
  .delete(isLoggedIn, isCampAuthor, catchAsync(campgrounds.deleteCampground));

router.get('/:id/edit', isLoggedIn, isCampAuthor, catchAsync(campgrounds.showEditForm));

module.exports = router;
