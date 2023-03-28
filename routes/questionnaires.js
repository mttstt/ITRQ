var express = require('express');
var router = express.Router();
const XLSX = require('xlsx');

function isAuthenticated(req, res, next) {
  if (req.session.isAuthenticated) {
    return next();
  } else {
    res.redirect('./');
  }
}

router.get('/', isAuthenticated, function(req, res, next) {
  // il Collaboratore impersonifica l'Utente Responsabile per accedere ai suoi questionari 
  var id;
  if (req.session.itrq?.rule == "Collaboratore") {id = req.session.itrq?.utenteResponsabile_id}
  else {id = req.session.itrq?.id }
  req.db.query(`
    SELECT username, users.id, questions_type.type_description, questions_type.id as questions_type_id FROM users
    LEFT JOIN applications ON (applications.user_id = users.id AND applications.status = 'Enable')
    LEFT JOIN questions_type ON (questions_type.id = applications.question_type)
    LEFT JOIN questionnaire ON applications.id = questionnaire.cmdb_id
    LEFT JOIN campagnes ON questionnaire.campagn_id = campagnes.id
    WHERE campagnes.current_campagn = true AND users.id = ?
    GROUP BY username, users.id, questions_type.type_description,questions_type.id
  `, [id, req.year_campagn], (error, results) => {
    if (error) throw error;
    // visualizzare il questionario
    //console.log({users: results});
    res.render('questionnaire/questionnaires', 
                { users: results,
                  layout: 'questionnaire/layout-questionnaire.hbs'
    });
  });
});


router.get('/questionnaire',isAuthenticated, function(req, res, next) {
  var user_id = req.query.user_id;
  req.session.itrq.questions_type_id = req.query.questions_type_id;
  // recuperare le domande e le risposte del questionario per l'utente corrente
  req.db.query(`
  SELECT DISTINCT questions.id, user_responses.id as responseId, questions.question_text, questions.area, questions.question_type, user_responses.response, user_responses.notes, questionnaire.cmdb_id, questionnaire.campagn_id, applications.name, applications.user_id, users.username as username, campagnes.year, DATE_FORMAT(campagnes.deadline,'%d-%m-%y') as deadline 
  FROM questions
  CROSS JOIN questionnaire
  LEFT JOIN user_responses ON (user_responses.campagn_id = questionnaire.campagn_id AND questions.id = user_responses.question_id and questionnaire.cmdb_id = user_responses.cmdb_id)
  LEFT JOIN applications ON (questionnaire.cmdb_id = applications.id AND applications.question_type = ?)
  LEFT JOIN users ON applications.user_id = users.id
  LEFT JOIN campagnes ON ( questionnaire.campagn_id = campagnes.id and questions.campagn_id = campagnes.id )
  WHERE campagnes.current_campagn = true
  AND questions.question_type = ?
  AND applications.user_id = ?
  ORDER by questions.id, name
  `, [req.session.itrq?.questions_type_id, req.session.itrq?.questions_type_id, user_id ], (error, data) => {

  if (error) throw error;
  //console.log("data",data);

  const dt = data.reduce((acc, item) => {
  const question = acc.find(
    (question) => question.question_id === item.id
  );
  if (!question) {
    acc.push({
      question_id: item.id,
      question_text: item.question_text,
      area: item.area,
      question_type: item.question_type,
      user_id: item.user_id,
      username: item.username,
      year: item.year,
      campagn_id: item.campagn_id,
      deadline: 'Deadline '+ item.deadline,
      apps: [
        {
          app_name: item.name,
          app_id: item.cmdb_id,
          response: item.response,
          note: item.notes,
          responseId: item.responseId,
        },
      ],
    });
  } else {
    question.apps.push({
      app_name: item.name,
      app_id: item.cmdb_id,
      response: item.response,
      note: item.notes,
      responseId: item.responseId,
    });
  }
  return acc;
}, []);

    // Ordina per question_id ( forse non serve: ho aggiunto order by nell sql)
    //transformedData.sort((a, b) => a.question_id - b.question_id);
    // trasforma in formato json
    //const jsonString  = JSON.stringify(transformedData);
    //const jsonObject = JSON.parse(jsonString);

    res.render('questionnaire/questionnaire', { dt,
                                                layout: 'questionnaire/layout-questionnaire.hbs'
    });
    //console.log({ dt });
   // console.log(dt[0].apps);
  });
});


router.post('/saveResponses',isAuthenticated, function(req, res, next) {
  //console.log("--------", req.body);
  const responses = req.body.responses;
  responses.forEach((response) => {
    const responseId = response.responseId
    const userId = response.userId;
    const questionId = response.questionId;
    const questionType = response.questionType;
    const cmdbId = response.applicationId;
    const campagnId = response.campagnId;
    const value = response.response;
    const note = response.note;
    const area = response.area;
    if (responseId > 0) {
      var query = 'UPDATE user_responses SET user_id=?, question_id=?, question_type=?, cmdb_id=?, response=?, notes=?, campagn_id=?, area=? WHERE Id=?';
      var params = [userId, questionId, questionType, cmdbId, value, note, campagnId, area, responseId ];
      req.db.query(query, params, (error, result) => {
        //console.log(result);
        if (error) throw error;
    //     console.log(`Risposta salvata per cmdbId: ${cmdbId}`);
      });
    } else {
      const query = 'INSERT INTO user_responses (user_id, question_id, question_type, cmdb_id, response, notes, campagn_id, area) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
      const params = [userId, questionId, questionType, cmdbId, value, note, campagnId, area];
      req.db.query(query, params, (error, result) => {
        //console.log(result);
        if (error) throw error;
    //     console.log(`Risposta salvata per cmdbId: ${cmdbId}`);
      });
    }
  });
  res.send('Risposte salvate con successo');
});



router.get('/downloadExcel',isAuthenticated, (req, res, next) => {
  req.db.query(`
  SELECT DISTINCT questions.id, user_responses.id as responseId, questions.question_text, questions.area, questions.question_type, user_responses.response, user_responses.notes, questionnaire.cmdb_id, questionnaire.campagn_id, applications.name, applications.user_id, users.username as username, campagnes.year, DATE_FORMAT(campagnes.deadline,'%d-%m-%y') as deadline 
  FROM questions
  CROSS JOIN questionnaire
  LEFT JOIN user_responses ON (user_responses.campagn_id = questionnaire.campagn_id AND questions.id = user_responses.question_id and questionnaire.cmdb_id = user_responses.cmdb_id)
  LEFT JOIN applications ON (questionnaire.cmdb_id = applications.id AND applications.question_type = ?)
  LEFT JOIN users ON applications.user_id = users.id
  LEFT JOIN campagnes ON ( questionnaire.campagn_id = campagnes.id and questions.campagn_id = campagnes.id )
  WHERE campagnes.current_campagn = true
  AND questions.question_type = ?
  AND applications.user_id = ?
  ORDER by questions.id, name
  `, [req.session.itrq?.questions_type_id, req.session.itrq?.questions_type_id, req.session.itrq?.id], (err, results,fields) => {
    if (err) throw err;
    const worksheet = XLSX.utils.json_to_sheet(results);
    //console.log(worksheet);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
    res.setHeader('Content-Disposition', 'attachment; filename=data.xlsx');
    res.type('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  });
});


module.exports = router;
