const express = require('express');
const moment = require('moment');
const crypto = require('crypto');
const nodefetch = require('node-fetch');
const { query, validationResult, body } = require('express-validator/check');
const { redisConnection } = require('../class/redis');
const { toUrlEncoded, responseFGKeyMCP, getRecordTypes } = require('../class/common');

const md5 = crypto.createHash('md5');
const router = express.Router();
const salesforce = require('../class/salesforce');
const { validateSgPostalCode, validateNRIC, validateSfId } = require('../class/validator');

const mcpSecret = process.env[`MCP_SECRET_${process.env.NODE_ENV}`] || '3118010007';
const mcpId = process.env[`MCP_ID_${process.env.NODE_ENV}`] || '3118010007';
const MCP_WEBHOOK = process.env[`MCP_WEBHOOK_${process.env.NODE_ENV}`] || 'https://test.interaktiv.sg/api-step-asia/donation/confirm-payment';

router.get('/getContactId',
    [
        query('email').isEmail().withMessage('INVALID_EMAIL'),
    ],
    redisConnection,
    salesforce.createSfObject, async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ status: 400, message: errors.array() });
        }
        try {
            let result = await req.redisGet(`cache:contactId:${req.query.email}`);
            if (result === null) {
                result = await req.sfConn.query(`
                    Select Id, Name, AccountId,
                        Account.BillingStreet,
                        Account.BillingCity,
                        Account.BillingCountry,
                        Account.BillingPostalCode,
                        Account.BillingState,
                        Account.Phone
                    from Contact where Account.Email__c = '${req.query.email}'
                `);
                if (result.records.length > 0) {
                    req.redisSet(`cache:contactId:${req.query.email}`, JSON.stringify(result));
                    req.redisExpire(`cache:contactId:${req.query.email}`, 3600 * 24);
                }
            } else {
                result = JSON.parse(result);
            }
            return res.status(200).send({
                status: 200,
                contactId: result.records.length > 0 ? result.records[0].Id : null,
                accountId: result.records.length > 0 ? result.records[0].AccountId : null,
                info: result.records[0] || null,
            });
        } catch (error) {
            console.info(error);
            return res.status(500).send({
                status: 500,
                records: null,
                message: error.message,
            });
        }
});

router.post('/make', [
    body('name').isString().withMessage('INVALID_NAME'),
    /* ** Not required
    body('idNumber').custom((str, { req }) => {
        if (req.query.idType === 'NRIC') {
            return validateNRIC(str);
        }
        return true;
    }).withMessage('INVALID_ID_NUMBER'),
    body('idType').isIn(['NRIC', 'FIN', 'OTHERS', 'UEN-Business', 'UEN-Local Company', 'ITR', 'ASGD', 'UEN-Others', 'other']).withMessage('INVALID_ID_TYPE'),
    */
    body('email').isEmail().withMessage('INVALID_EMAIL'),
    body('address').optional().isString().withMessage('INVALID_ADDRESS'),
    body('postalCode').optional().custom(str => validateSgPostalCode(str)).withMessage('INVALID_POSTAL_CODE'),
    body('country').isIn(['Singapore']).withMessage('INVALID_COUNTRY'),
    body('acknowledgePublicity').optional().isBoolean().withMessage('INVALID_ACKNOWLEDGE'),
    body('amount').isNumeric().withMessage('AMOUNT_MUST_BE_NUMERIC'),
    body('frequentType').optional().isIn(['One-time', 'Recurring']).withMessage('INVALID_RECURRING_TYPE'),
    body('frequentPeriod').optional().isIn(['monthly', 'yearly']).withMessage('INVALID_RECURRING_PERIOD'),
    body('reccuringAmount').optional().isNumeric().withMessage('INVALID_RECURRING_AMOUNT'),
    body('phoneNumber').optional().custom(str => /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/i.test(str)).withMessage('INVALID_PHONE_NUMBBER'),
    body('contactId').optional().custom(str => str === '' || validateSfId(str)).withMessage('INVALID_SALESFORCE_ID'),
    body('accountId').optional().custom(str => str === '' || validateSfId(str)).withMessage('INVALID_SALESFORCE_ID'),
    body('frequencyMax').optional().isNumeric().withMessage('INVALID_MAX_RECURRING'),
    body('programmeEvent').optional().custom(str => str === '' || validateSfId(str)).withMessage('INVALID_SALESFORCE_ID'),
],
redisConnection,
salesforce.createSfObject,
getRecordTypes,
async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ status: 400, message: errors.array() });
    }
    let { accountId, contactId } = req.body;
    try {
        if (contactId === null || accountId === undefined) {
            const {
                email, idType, idNumber, name, address, country, postalCode, phoneNumber,
            } = req.body;
            const accountIndividualRecordType = req.recordTypes.filter(obj => obj.SobjectType === 'Account' && obj.Name === 'Individual');
            accountId = await req.sfConn.sobject('Account').create({
                Email__c: email,
                ID_Type__c: idType,
                name,
                ID_No__c: idNumber,
                BillingStreet: address,
                BillingCity: country,
                BillingCountry: country,
                BillingPostalCode: postalCode,
                Phone: phoneNumber,
                RecordTypeId: accountIndividualRecordType[0] ? accountIndividualRecordType[0].Id : null,
            });
            accountId = accountId.id;
            await Promise.resolve(resolve => setTimeout(resolve, 100));
            const contactInfo = await req.sfConn.query(`Select Id, AccountId from Contact where AccountId = '${accountId}'`);
            contactId = contactInfo.records.length > 0 ? contactInfo.records[0].Id : null;
        }
        const {
            amount, acknowledgePublicity, frequentType, frequentPeriod, frequencyMax, programmeEvent,
        } = req.body;
        const donationData = {
            Amount__c: amount,
            Contact_Name__c: contactId,
            Donor_Name__c: accountId,
            Donation_Date__c: new Date(),
            Donation_Status__c: 'received',
            Payment_Method__c: 'Credit Card',
            Tax_Deductible__c: true,
            Tax_Credit_To_Name__c: contactId,
            Acknowledgement_Sent__c: acknowledgePublicity,
            Uploaded__c: true,
            Channel_of_Donation__c: 'StepAsia Website',
            Frequency_Type__c: frequentType,
            Frequency_Period__c: frequentPeriod,
            Frequency_Max__c: frequencyMax,
            Remarks__c: req.body.remarks || '',
            Programme_Event__c: programmeEvent,
            Sequence__c: frequentType === 'Recurring' ? 1 : null,
        };
        /* if (accountId) {
            donationData.npe03__Organization__c = accountId;
        } */
        const donationResult = await req.sfConn.sobject('Donation__c').create(donationData);

        return res.status(200).send({
            status: 200,
            result: donationResult,
            message: 'TRANSACTION_CREATED',
        });
    } catch (error) {
        console.info(error);
        return res.status(500).send({
            status: 500,
            records: null,
            message: error.message,
        });
    }
});


router.post('/confirm-payment', salesforce.createSfObject, async (req, res) => {
    const { body } = req;
    // SfConnection update
    const fgkey = responseFGKeyMCP(body.reference, body.cur, body.amt, body.rescode, body.transid);
    if (fgkey !== body.fgkey) {
        console.info('Failed to update sf, FG Key is not correct', fgkey, body.fgkey);
        return res.status(400).send({ body, errorMsg: 'fgkey is not correct' });
    }
    try {
        const response = await req.sfConn.sobject('Donation__c').update({
            Id: body.reference,
            Amount__c: body.amt,
            Cleared_Date__c: new Date(body.resdt),
            Donation_Status__c: 'Cleared',
            Auth_Code__c: body.authcode,
            Card_Type__c: body.cardco,
            Credit_Card_No__c: body.cardno.replace(/X|x/g, '0'),
            Transaction_No__c: body.transid,
            Receipt_Serial_No__c: body.transid,
            Card_Holder_Name__c: body.buyer,
            // Remarks__c: JSON.stringify(body),
        });
        if (body.cardtoken) {
            const donation = await req.sfConn.sobject('Donation__c').retrieve(body.reference);
            await req.sfConn.sobject('Contact').update({
                Id: donation.Contact_Name__c,
                Card_Token__c: body.cardtoken,
                Card_Hash__c: body.card_hash,
            });
        }
        return res.status(200).send({ status: 200, message: 'PAYMENT_UPDATED', body, response });
    } catch (error) {
        return res.status(500).send({ status: 500, message: error.message });
    }
});

router.post('/recurring-donation', [
    body('id').isString().withMessage('INVALID_ID'),
],
salesforce.createSfObject, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ status: 400, message: errors.array() });
        return;
    }
    try {
        const donation = await req.sfConn.sobject('Donation__c').retrieve(req.body.id);
        if (donation === null) {
            res.status(400).send({ status: 400, message: 'DONATION_NOT_FOUND' });
            return;
        }
        const account = await req.sfConn.sobject('Account').retrieve(donation.Donor_Name__c);
        if (account.CardToken__c === null) {
            res.status(400).send({ status: 400, message: 'NO_CARD_TOKEN' });
            return;
        }
        const beforeEncrypted = `${mcpSecret}?mid=${mcpId}&ref=${req.body.id}&cur=SGD&amt=${donation.Amount__c}`;
        const encrypted = md5.update(beforeEncrypted).digest('hex');
        const data = toUrlEncoded({
            mid: mcpId,
            txntype: 'SALE',
            reference: req.body.id,
            cur: 'SGD',
            amt: donation.Amount__c,
            shop: 'STEP Asia',
            buyer: account.Name,
            tel: account.Phone,
            email: account.Email__c,
            product: 'STEP Asia Donation',
            lang: 'EN',
            statusurl: MCP_WEBHOOK,
            returnurl: MCP_WEBHOOK,
            fgkey: encrypted.toString(),
            cardtoken: account.CardToken__c,
        });
        const mcpResult = await nodefetch('https://map.uat.mcpayment.net/api/PaymentAPI/Purchase', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: data,
        }).then((resp) => {
            return resp.json();
        });
        if (mcpResult.rescode.toString() !== '200' && mcpResult.rescode.toString() !== '0000') {
            res.status(400).send({
                status: 400, message: 'DONATION_NOT_UPDATED', mcpResult,
            });
            return;
        }
        const fgkey = responseFGKeyMCP(req.body.id, 'sgd', donation.Amount__c, mcpResult.rescode, mcpResult.transid);
        await req.sfConn.sobject('Donation__c').update({
            Id: req.body.id,
            Amount__c: mcpResult.amt,
            Cleared_Date__c: new Date(mcpResult.resdt),
            Donation_Status__c: 'Cleared',
            Auth_Code__c: mcpResult.authcode,
            Card_Type__c: mcpResult.cardco,
            Credit_Card_No__c: mcpResult.cardno.replace(/X|x/g, '0'),
            Transaction_No__c: mcpResult.transid,
            Receipt_Serial_No__c: mcpResult.transid,
            Card_Holder_Name__c: mcpResult.buyer,
            // Remarks__c: JSON.stringify(body),
        });

        res.status(200).send({ status: 200, message: 'DONATION_SENT', mcpResult });

    } catch (error) {
        res.status(500).send({ status: 500, message: 'DONATION_NOT_UPDATED', errorMsg: error.message });
    }
});

router.get('/active-programmes', redisConnection, salesforce.createSfObject, async (req, res) => {
    try {
        let result = await req.redisGet('cache:active-programmes');
        result = JSON.parse(result);
        if (result === null) {
            result = await req.sfConn.query(`
                Select Id, Name, Ttile__c from Programme_Event__c where Published__c = true AND Status__c = 'Approved'
            `);
            result = result.records;
            req.redisSet('cache:active-programmes', JSON.stringify(result));
            req.redisExpire('cache:active-programmes', 30);
        }
        return res.status(200).send({ status: 200, records: result });
    } catch (error) {
        return res.status(500).send({ status: 500, message: error.message });
    }
});


module.exports = router;
