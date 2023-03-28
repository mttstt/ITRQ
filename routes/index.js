/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

var express = require('express');
var router = express.Router();


router.get('/', function (req, res, next) {
    if (req.session.isAuthenticated) {
        const query1 = 'UPDATE users SET username = \''+ req.session.account?.name +'\' WHERE email = \''+req.session.account?.username +'\' ';
        console.log (query1);
        req.db.query(query1, (err, data) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Internal Server Error');
            }
            const query = 'SELECT * FROM users WHERE email = ?';
            var params = [req.session.account?.username ];
            req.db.query(query, params, (err, data) => {
                if (err) {
                    console.error(err);
                    return res.status(500).send('Internal Server Error');
                }
                console.log('data[0]: ',data[0]);
                if (data && data[0]) {
                    //req.session.username = data[0].username;
                    req.session.itrq = data[0];
                    //-----------------------------------
                    // il codice viene inserito qui, perchè deve attendere il completamente dell'esecuzione della query 
                    if (req.session.itrq?.rule == 'Administrator') { 
                        res.redirect('./admin'); }
                    // in realtà solo se Utente Responsabile o Collaboratore...
                    else { res.redirect('./questionnaires'); }
                    //-------------------
                }
            })
        })        
    }
    else {
        res.render('index', {
            title: 'Campagna di Analisi del Rischio Informatico 2022',
        //    isAuthenticated: req.session.isAuthenticated,
        //    username: req.session.account?.username,
        });
    }
});

module.exports = router;