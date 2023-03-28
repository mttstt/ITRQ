var express = require('express');
var router = express.Router();
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');


function isAuthenticated(req, res, next) {
  const query = 'SELECT COUNT(email) AS n FROM users WHERE rule = \'Administrator\' AND email = ?';
  var params = [req.session.account?.username ];
  req.db.query(query, params, (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Internal Server Error');
    }
      //console.log(data[0].n);
      //console.log('req.session.account?.username: ', req.session.account?.username);
        if (data[0].n>0) {
          return next();
        } else {
          res.redirect('./');
        }
  })
}


//----
const storage = multer.diskStorage({
  destination: './uploads',
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});
const upload = multer({ storage });
//----

router.get('/', isAuthenticated, (req, res) => {
  res.render('admin/home', {
    title: 'Homepage',
    layout: 'admin/layout-admin.hbs'
  });
});

// Homepage
router.get('/home',isAuthenticated, (req, res) => {
    res.render('admin/home', {
      title: 'Homepage',
      layout: 'admin/layout-admin.hbs'
    });
  });
  
  // Dashboard
  router.get('/dashboard',isAuthenticated, (req, res) => {
    res.render('admin/dashboard', {
      title: 'Dashboard',
      layout: 'admin/layout-admin.hbs'
    });
  });

  // Upload
  router.get('/upload',isAuthenticated, (req, res) => {
    res.render('admin/upload', {
      title: 'Upload',
      layout: 'admin/layout-admin.hbs'
    });
  });
  
    // Tabella
    router.get('/tabella/:tb', (req, res) => {
      //console.log('req.params.tb:', req.params.tb);
      res.render('admin/tabella', {
        title: req.params.tb,
        tabella: req.params.tb,
        layout: 'admin/layout-admin.hbs'
      });
    });

    // Utenti Responsabili
    router.get('/utentiresponsabili', isAuthenticated, (req, res) => {
      //console.log('req.params.tb:', req.params.tb);
      res.render('admin/utentiresponsabili', {
        title: 'Utenti Responsabili',
        layout: 'admin/layout-admin.hbs'
      });
    });

  // uploadfile
  router.post('/uploadfile', isAuthenticated, upload.single('file'), (req, res) => {
    const file = req.file;
    const table = file.originalname.replace('.csv', '');
    const fields = [];
    const data = [];
    const results = [];
    // console.log('originalname', file.originalname);
    fs.createReadStream(`./uploads/${file.originalname}`)
      .pipe(csv({ separator: ',' }))
      .on('headers', (headers) => { headers.forEach(header => fields.push(header)); })
      .on('data', data => results.push(data))
      .on('end', () => {
        results.forEach(result => {
          req.db.query(`INSERT INTO ${table} (${fields.join(', ')}) VALUES (${fields.map(field => `'${result[field]}'`).join(', ')})` , (error, results, fields) => {
            if (error) {
              console.error('Error executing query:', error);
              return;
            }
            //console.log('Results:', results);
          });
        });
        // Invio una notifica al client tramite Socket.io
        const socketApi = require("../socketApi");
        const io = require('socket.io')();
        socketApi(io);
        /*
        socket.emit('myEvent', {name: 'World'}, (response) => {
          console.log(response);
        });
        */
        // Elimino il file caricato dal server
        fs.unlinkSync(req.file.path);
        res.render('admin/uploadok', {
          title: 'Upload Ok',
          layout: 'admin/layout-admin.hbs'
        });

      });
  });


    // data
    router.get('/data/:db', isAuthenticated, (req, res) => {
      const query = 'SELECT * FROM ' + req.params.db;
      //console.log(query);
        req.db.query(query, (err, data) => {
          if (err) {
            console.error(err);
            return res.status(500).send('Internal Server Error');
          }
        //console.log(data);  
        res.json(data);
      });
    });

    // dataUtentiResponsabili
    router.get('/dataUtentiResponsabili', isAuthenticated, (req, res) => {
          req.db.query(`
            SELECT username, email, users.id, questions_type.id as question_type_id, type_description, rule, users.status, connected_at, disconnected_at
            FROM users
            LEFT JOIN applications ON (applications.user_id = users.id AND applications.status = 'Enable')
            LEFT JOIN questions_type ON (questions_type.id = applications.question_type)
            LEFT JOIN questionnaire ON applications.id = questionnaire.cmdb_id
            LEFT JOIN campagnes ON questionnaire.campagn_id = campagnes.id
            WHERE campagnes.current_campagn = true
            GROUP BY username, users.id, questions_type.type_description,questions_type.id
        `, [], (err, data) => {
          if (err) {
            console.error(err);
            return res.status(500).send('Internal Server Error');
          }
        //console.log(data);  
        res.json(data);
      });
    });
    
    
    // save-date
    router.post('/save-data', isAuthenticated, (req, res) => {
      const query = 'UPDATE '+ req.body.tb + ' SET '+ req.body.field +' = \''+ req.body.newValue +'\' WHERE id = \''+req.body.id+'\'';
      console.log (query);
      req.db.query(query, (err, data) => {
        if (err) {
          console.error(err);
          return res.status(500).send('Internal Server Error');
        }
      res.send('success');
      });
    });


  // deleteRows
  router.post('/deleteRows', (req, res) => {
    //console.log(req.body);
    let idArray = req.body.map(function(element) {
      return element.id; // returns only the id value of each element
    }).filter(function(element) {
      return element !== undefined; // returns only the elements that are not undefined
    });
    let tb = req.body[req.body.length -1].tb; // gets the value of tb from the last object in array
    if (Array.isArray(idArray) && idArray.length > 0) {
      let query = 'DELETE FROM '+ tb + ' WHERE Id IN ('+idArray.join(',')+')'; 
      console.log (query);
      req.db.query(query, (err, data) => {
        //console.log("data: ",data);
        if (err) {
          //console.error(err);
          return res.status(500).send('Internal Server Error');
        }
        console.log("success");  
        res.status(200).send('Righe cancellate con successo.');
      });
    }  
  });    



  // addRow
  router.post('/addRow', isAuthenticated, (req, res) => {
    console.log(req.body.newItem);

    let query = 'INSERT INTO ' + req.body.tb + ' ' + Object.keys(req.body.newItem)+ ' VALUES ' + Object.values(req.body.newItem);

    console.log (query);
    req.db.query(query, (err, data) => {
      console.log("data: ",data);
      if (err) {
        console.error(err);
        return res.send('err');
        //return res.status(500).send('Internal Server Error');
      }
    console.log("success");  
    res.send('success');
    }); 
  });




  // Gestione degli errori
  router.use((req, res, next) => {
    res.status(404).render('error', { title: '404 - Pagina non trovata',layout: 'admin/layout-admin.hbs' });
  });
  
  module.exports = router;