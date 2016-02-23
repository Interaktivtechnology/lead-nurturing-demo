var express = require('express');
var app = express();
var router = express.Router();
var jsforce = require('jsforce');
const https = require('https');
const querystring = require('querystring');
router.param('id', function (req, res, next, id) {
  	req.conn = new jsforce.Connection();
	req.conn.login('lndemo@interaktiv.sg', 'interaktiv.8lFREIiiU4lNjHhOdA7VLvNsW', function(err, res) {
	  	if (err) { return console.error(err); }
  		req.conn.query('SELECT Id, Name, Email FROM Lead Where Id = \'' + id + "'", function(err, res) {
	    	if (err) { return console.error(err); }
	    	req.lead = res;
	    	analytic = {
	    		IP__c : req.ip,
	    		Lead__c : id,
	    		Timestamp__c : new Date(),
	    		URL__c : req.path.replace('/' + req.params.id, '')
	    	};
	    	req.conn.sobject("Analytics__c").create(analytic, function(err, ret){
	    		if(err || !ret.success)
	    			console.log(err);
	    		else
	    			console.log(ret);
	    	});
	    	

	    	var request = require('request');

				var options = {
				  url: 'https://api.livechatinc.com/visitors/'+ id +'/chat/start',
				  headers: {
				    'User-Agent': 'node-request',
				    'Content-Type': 'application/x-www-form-urlencoded',
			      'X-API-Version':2
				  },
				  form : {
						licence_id : '7155511',
						welcome_message : 'Hello ' + res.records[0].Name,
						name : res.records[0].Name,
						email : res.records[0].Email
					}
				};
				
				function callback(error, response, body) {
				  if (!error && response.statusCode == 200) {
				    var info = JSON.parse(body);
				    req.visitor_id = id;
				    req.sessionChat = info;

	    			next();
				  }
				}	
				request.post(options, callback); 

			
  		});
	});
});
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Funding Societies Salesforce Demo', name : req.lead });
});

router.get('/about/:id', function(req, res, next) {
  	res.render('about', {name : req.lead});
});
router.get('/document/:id', function(req, res, next) {
  	res.render('about', {name : req.lead});
});
router.get('/invest/:id', function(req, res, next) {
  	res.render('invest', {name : req.lead});
});


router.get('/invest', function(req, res, next) {
	
  
});



router.get('/faq', function(req, res, next) {
  	res.render('faq', {name : req.lead});
});
router.get('/faq/:id', function(req, res, next) {
	console.log(req.sessionChat);
  	res.render('faq', {name : req.lead, visitor_id : req.visitor_id, chat_session_id : req.sessionChat.secured_session_id});
});


router.get('/thanks/:id', function(req, res, next) {
	console.log(req.session);
  res.render('about', {name : req.lead});
});

router.get('/thanks/', function(req, res, next) {
  res.render('about');
});


router.post('/lead', function(req, res, next){
	res.send({success: true});
});



var getUser = function(LeadId, req, callback){
	
}

module.exports = router;
