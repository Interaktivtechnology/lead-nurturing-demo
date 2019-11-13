const express = require('express');
const { query, validationResult, body } = require('express-validator/check');
const JWT = require('../class/jwt');
const salesforce = require('../class/salesforce');

const routes = express.Router({ caseSensitive: false });
const jwt = new JWT();

routes.post('/create', [
    body('email').isEmail().withMessage('INVALID_MESSAGE'),
    body('name').isString().isLength({ min: 5 }).withMessage('NAME_REQUIRED'),
    body('subject').isString().isLength({ min: 5 }).withMessage('SUBJECT_REQUIRED'),
    body('message').isString().isLength({ min: 20 }).withMessage('MESSAGE_REQUIRED'),
],
(req, res, next) => {
    const { token, fingerprint } = req.headers;
    try {
        jwt.verify(token, fingerprint, req.headers['user-agent']);
        next();
    } catch (error) {
        res.status(400).json({ status: 400, message: 'INVALID_TOKEN' });
    }
},
salesforce.createSfObject,
async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ status: 400, message: errors.array() });
        return;
    }
    try {
        const {
            email, name, subject, message,
        } = req.body;
        const result = await req.sfConn.sobject('Case').create({
            SuppliedEmail: email,
            Description: message,
            Origin: 'web',
            Subject: subject,
            SuppliedName: name,
        });
        res.status(200).send({ status: 200, message: 'CONTACT_US_CREATED', result });
    } catch (error) {
        res.status(500).send({ status: 500, message: 'CREATE_CONTACT_US_FAILED', errorMessage: error.message });
    }
});

routes.get('/jwt', [
    query('fingerPrint').isAlphanumeric().isLength({ min: 40, max: 40 }),
],
(req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ status: 400, message: errors.array() });
        return;
    }
    const accessToken = jwt.sign(req.query.fingerPrint, req.headers['user-agent']);
    res.status(200).send({ status: 200, accessToken, expiredAt: new Date().getTime() + (12 * 60 * 60 * 1000) });
});

module.exports = routes;
