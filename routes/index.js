var express = require('express');
var app = express();
var router = express.Router();
var jsforce = require('jsforce');
const https = require('https');
const querystring = require('querystring');
var request = require('request');



router.param('id', function (req, res, next, id) {
  	req.conn = new jsforce.Connection();
		req.conn.login('lndemo@interaktiv.sg', 'interaktiv.8lFREIiiU4lNjHhOdA7VLvNsW', function(err, res) {
	  	if (err) { return console.error(err); }
  		req.conn.query('SELECT Id, Name, Email FROM Lead Where Id = \'' + id + "'", function(err, res) {
	    	if (err) { return console.error(err); }
	    	req.lead = res;
	    	req.session.visitor = req.lead.records[0].id;
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
	
  res.render('invest', {name : req.lead});
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
	console.log(req.session);
  res.render('about');
});


router.post('/lead', function(req, res1, next){
	req.conn = new jsforce.Connection();
	req.conn.login('lndemo@interaktiv.sg', 'interaktiv.8lFREIiiU4lNjHhOdA7VLvNsW', function(err, res) {
		var lead = {
			LastName : req.body.name,
			Email: req.body.email,
			Description : 'From Chat Activity',
			Company : 'Unknown'
		};
		req.conn.sobject('lead').create(lead, function(err, ret){
			console.log(err);
			res1.send({success: true, data:ret});
			console.log(ret);
		});
		
	});
	
});

router.post('/archivechat/', function(req, res1, next){
	req.conn = new jsforce.Connection();
	req.conn.login('lndemo@interaktiv.sg', 'interaktiv.8lFREIiiU4lNjHhOdA7VLvNsW', function(err, res) {
		
		var options = {
		  url: 'https://api.livechatinc.com/chats?visitor_id=7155511.'+ req.body.visitor_id,
		  headers: {
		    'User-Agent': 'node-request',
		    'Content-Type': 'application/x-www-form-urlencoded',
	      'X-API-Version':2
		  },
		  'auth': {
		    'user': 'eko@interaktiv.sg',
		    'pass': 'ef33d8b34ee742d4c5c081b56d6803b3',
		    'sendImmediately': false
		  },
		  form : {
				licence_id : '7155511',
			}
		};
		
		var note = {
			Body : '',
			Title : 'Chat Archive at ' + (new Date()),
			ParentId : req.body.visitor_id
		};
		function callback(error, response, body) {
		  if (!error && response.statusCode == 200) {
		    var info = JSON.parse(body);
		    for(i in info.chats[0].messages){
		    	note.Body += info.chats[0].messages[i].author_name + ":" + info.chats[0].messages[i].text + " ~" 
		    	+ info.chats[0].messages[i].date +  " \n";
		    }
		    
				req.conn.sobject("Note").create(note, function(err, ret){
		  			console.log(err);
		  			console.log(ret);
		  	});
		  	res1.send({success:true});
		  }
		}
		request.get(options, callback); 	
	});
});


module.exports = router;
