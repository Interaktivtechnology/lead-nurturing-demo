const express = require('express');
const jsforce = require('jsforce');
const request = require('request');

const router = express.Router();

const { createSfObject } = require('../module/salesforce');

const trackVisitor = async (req, res, next) => {
    const { id } = req.params;
    req.lead = await req.sfConn.query(`SELECT Id, Name, Email FROM Lead Where Id = '${id}'`);
    req.session.visitor = req.lead.records[0].id;
    const analytic = {
        IP__c: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
        Lead__c: id,
        Timestamp__c: new Date(),
        URL__c: `${req.protocol}://${req.get('host')}${req.originalUrl}`,
        Score__c: 10,
    };
    req.sfConn.sobject('Analytics__c').create(analytic, (err, ret) => {
        if (err || !ret.success) console.log(err);
        else console.log(ret);
    });
    next();
};
/* GET home page. */
router.get('/', (req, res) => {
    const url = process.env.NODE_ENV === 'dev' ? `${req.protocol}://${req.get('host')}/thanks` : 'https://sfdemo.interaktiv.sg/thanks';
    res.render('index', { title: 'InterAktiv Salesforce Demo', name: req.lead, url });
});

router.get('/about', (req, res) => {
    res.render('about', { name: req.lead });
});
router.get('/about/:id', createSfObject, trackVisitor, (req, res) => {
    res.render('about', { name: req.lead });
});
router.get('/document/:id', createSfObject, trackVisitor, (req, res) => {
    res.render('about', { name: req.lead });
});
router.get('/invest/:id', createSfObject, trackVisitor, (req, res) => {
    res.render('invest', { name: req.lead });
});


router.get('/invest', (req, res) => {
    res.render('invest', { name: req.lead });
});


router.get('/faq', (req, res) => {
    res.render('faq', { name: req.lead });
});
router.get('/faq/:id', createSfObject, trackVisitor, (req, res) => {
    // console.log(req.sessionChat);
    res.render('faq', { name: req.lead, visitor_id: req.visitor_id });
});


router.get('/thanks/:id', createSfObject, trackVisitor, (req, res) => {
    // console.log(req.session);
    res.render('thanks', { name: req.lead });
});

router.get('/thanks/', (req, res) => {
    // console.log(req.session);
    res.render('thanks');
});


router.post('/lead', (req, res1 ) => {
    req.conn = new jsforce.Connection();
    req.conn.login('lndemo@interaktiv.sg', 'interaktiv.8lFREIiiU4lNjHhOdA7VLvNsW', (err, res) => {
        const lead = {
            LastName: req.body.name,
            Email: req.body.email,
            Description: 'From Chat Activity',
            Company: 'Unknown',
        };
        req.conn.sobject('lead').create(lead, (err, ret) => {            
            res1.send({ success: true, data: ret });
        });
    });
});

router.post('/archivechat/', (req, res1) => {
    req.conn = new jsforce.Connection();
    req.conn.login('lndemo@interaktiv.sg', 'interaktiv.8lFREIiiU4lNjHhOdA7VLvNsW', (err, res) => {
        const options = {
            url: `https://api.livechatinc.com/chats?visitor_id=7155511.${req.body.visitor_id}`,
            headers: {
                'User-Agent': 'node-request',
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-API-Version': 2,
            },
            auth: {
                user: 'eko@interaktiv.sg',
                pass: 'ef33d8b34ee742d4c5c081b56d6803b3',
                sendImmediately: false,
            },
            form: {
                licence_id: '7155511',
            },
        };

        const note = {
            Body: '',
            Title: `Chat Archive at ${new Date()}`,
            ParentId: req.body.visitor_id,
        };
        function callback(error, response, body) {
            if (!error && response.statusCode == 200) {
                const info = JSON.parse(body);
                for (i in info.chats[0].messages) {
                    note.Body += `${info.chats[0].messages[i].author_name}:${info.chats[0].messages[i].text} ~${
                    info.chats[0].messages[i].date} \n`;
                }
                req.conn.sobject('Note').create(note);
                res1.send({ success: true });
            }
        }
        request.get(options, callback);
    });
});


module.exports = router;
