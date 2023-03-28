var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Campagna di Analisi del Rischio Informatico 2022' });
});

module.exports = router;
