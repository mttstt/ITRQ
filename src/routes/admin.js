var express = require('express');
var router = express.Router();

const multer = require('multer');
const upload = multer({ dest: 'uploads/' });


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('admin', { title: 'ITRQ' });
});


router.post('/home', function(req, res, next) {
  res.send('<br>- funzionalità per selezionare la campagna in corso<br>- funzionalità per alimentare la tabella users<br>- funzionalità per alimentare la tabella application<br>- funzionalità per alimentare la tabella questions<br>- funzionalità per alimentare la tabella questionaire <br>- funzionalità statistiche relative alla compilazione');
});


router.post('/dashboard', function(req, res, next) {
  res.send('Da questa pagina si monitora lo stato di compilazione dei questionari da parte degli utenti');
});


router.post('/questionnaire', (req, res) => {
  res.send(`
      <div class="container mt-5">
      <form action="/admin/upload-questionnaire" method="post" enctype="multipart/form-data">
        <div class="form-group">
          <label for="fileInput">Upload Questionnaire File:</label>
          <input type="file" class="form-control-file" id="fileInput" name="file">
        </div>
        <button type="submit" class="btn btn-primary btn-sm">Upload</button>
      </form>
    </div>
  `);
});


router.post('/upload-questionnaire', upload.single('file'), (req, res) => {
  // Leggere il file esterno
  const fs = require('fs');
  fs.readFile(req.file.path, 'utf-8', (err, data) => {
    if (err) throw err;
    // Dividi il file in righe
    const rows = data.split('\n');
    // Per ogni riga, inserire i dati nel database
    rows.forEach(row => {
      const values = row.split(',');
      const query = `INSERT INTO questionnaire(cmdb_id, campagn)
                     VALUES(?, ?)`;
      const params = [values[0], values[1]];
      console.log(values[0],"----",values[1])
      req.db.query(query, params, (err, result) => {
        if (err) throw err;
        console.log("Upload riuscito, id:s",result.insertId);
      });
    });
    // Chiudere la connessione al database
    //connection.end();
    });

    res.send('File upload completato con successo!');

});


module.exports = router;


