var express = require('express');
var router = express.Router();

/* GET home page. */
//router.get('/', function(req, res, next) {
//  res.render('questionnaires', { title: 'Express !!!' });
//});


router.get('/', function(req, res, next) {
  req.db.query(`
    SELECT username, id FROM users WHERE id IN (SELECT user_id FROM applications
    LEFT JOIN questionnaire ON applications.id = questionnaire.cmdb_id
    WHERE questionnaire.campagn= ? GROUP BY user_id)
  `, [req.year_campagn], (error, results) => {
    if (error) throw error;
    // visualizzare il questionario
    console.log({users: results});
    res.render('questionnaires', {users: results});
  });
});

router.get('/questionnaire/:user_id', function(req, res, next) {
  var user_id = req.params.user_id;
  // recuperare le domande e le risposte del questionario per l'utente corrente
  req.db.query(`
  SELECT DISTINCT questions.id, questions.question_text, questions.question_type, user_responses_reduced.response, user_responses_reduced.notes, questionnaire.cmdb_id, questionnaire.campagn, applications.name, applications.user_id, users.username as username
  FROM questions
  CROSS JOIN questionnaire
  LEFT JOIN user_responses_reduced ON (user_responses_reduced.campagn = questionnaire.campagn AND questions.id = user_responses_reduced.question_id and questionnaire.cmdb_id = user_responses_reduced.cmdb_id)
  LEFT JOIN applications ON questionnaire.cmdb_id = applications.id
  LEFT JOIN users ON applications.user_id = users.id
  WHERE questions.campagn = ?
  AND questionnaire.campagn = ?
  AND applications.user_id = ?
  ORDER by questions.id
  `, [req.year_campagn, req.year_campagn, user_id], (error, data) => {
    if (error) throw error;
    
/*
    { 'username': username,
      'campagn': campagn,
      'users_id': users_id,
      'rows'
      'question': question_text,
      'question_type': question_type,
      'question_id': question_id, 
      'apps': [ {'name': name,
                'applications_id': applications_id
                'values': { 'response': response, 
                            'notes': notes
                          }
                }            
              ]
     }
*/
  const dt = data.reduce((acc, item) => {
  const question = acc.find(
    (question) => question.question_id === item.id
  );
  if (!question) {
    acc.push({
      question_id: item.id,
      question_text: item.question_text,
      question_type: item.question_type,
      user_id: item.user_id,
      username: item.username,
      campagn: item.campagn,
      apps: [
        {
          app_name: item.name,
          app_id: item.cmdb_id,
          response: item.response,
          note: item.notes,
        },
      ],
    });
  } else {
    question.apps.push({
      app_name: item.name,
      app_id: item.cmdb_id,
      response: item.response,
      note: item.notes,
    });
  }
  return acc;
}, []);

    // Ordina per question_id ( forse non serve: ho aggiunto order by nell sql)
    //transformedData.sort((a, b) => a.question_id - b.question_id);
  
    // trasforma in formato json
    //const jsonString  = JSON.stringify(transformedData);
    //const jsonObject = JSON.parse(jsonString);

   
    res.render('questionnaire', { dt });

    console.log({ dt });
    console.log(dt[0].apps);

  });
});


router.post('/save-responses', function(req, res, next) {
  //console.log("--------", req.body);
  const responses = req.body.responses;
  responses.forEach((response) => {
    const userId = response.userId;
    const campAgn = response.campAgn;
    const questionId = response.questionId;
    const questionType = response.questionType;
    const cmdbId = response.applicationId;
    const responseValue = response.response;
    const note = response.note;
    const query = 'INSERT INTO user_responses (user_id, question_id, question_type, cmdb_id, response, notes, campagn) VALUES (?, ?, ?, ?, ?, ?, ?)';
    const params = [userId, questionId, questionType, cmdbId, responseValue, note, campAgn];

    req.db.query(query, params, (error, result) => {
      if (error) throw error;
  //     console.log(`Risposta salvata per cmdbId: ${cmdbId}`);
    });
  });

  res.send('Risposte salvate con successo');
});


module.exports = router;
