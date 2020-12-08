const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const saucesCtrl = require('../controllers/sauces.js');

router.get('/', saucesCtrl.getAllSauces);

router.get('/:id', saucesCtrl.getOneSauce);

router.post('/', auth, saucesCtrl.createSauce);

router.put('/:id', auth, saucesCtrl.modifySauce);

router.delete('/:id', auth, saucesCtrl.deleteSauce);

//router.post('/:id/like', (req, res, next) => {

module.exports = router;
