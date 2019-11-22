const express = require('express');
const { validationResult, body } = require('express-validator/check');
const { redisConnection } = require('../module/redis');
const { getRecordTypes } = require('../module/common');

const router = express.Router();
const salesforce = require('../module/salesforce');
const { validateSfId } = require('../module/validator');

router.post('/create', [
    body('name').isString().withMessage('INVALID_NAME'),
    body('email').isEmail().withMessage('INVALID_EMAIL'),
    body('nationality').isIn(['Singapore']).withMessage('INVALID_COUNTRY'),
    body('mobilePhone').optional().custom(str => /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/i.test(str)).withMessage('INVALID_PHONE_NUMBBER'),
    body('homePhone').optional().custom(str => /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/i.test(str)).withMessage('INVALID_PHONE_NUMBBER'),
    body('officePhone').optional().custom(str => /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/i.test(str)).withMessage('INVALID_PHONE_NUMBBER'),
],
redisConnection,
salesforce.createSfObject,
getRecordTypes,
async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ status: 400, message: errors.array() });
    }
    try {
        const {
            homePhone, officePhone, email, gender, nationality, race, birthdate,
            certification, occupation, language, write, occupationType, schoolName, course,
            name, mobilePhone, school,
        } = req.body;

        const accountIndividualRecordType = req.recordTypes.filter(obj => obj.SobjectType === 'Account' && obj.Name === 'Individual Donors');
        const account = await req.sfConn.sobject('Account').create({
            Email__c: email,
            name,
            Phone: mobilePhone,
            RecordTypeId: accountIndividualRecordType[0] ? accountIndividualRecordType[0].Id : null,
        });

        await Promise.resolve(resolve => setTimeout(resolve, 100));
        const contactInfo = await req.sfConn.query(`Select Id, AccountId from Contact where AccountId = '${account.id}'`);
        const contactId = contactInfo.records.length > 0 ? contactInfo.records[0].Id : null;

        const applicationData = {
            Applicant_Contact__c: contactId,
            BCLS_AED_Certification__c: !!certification.BCLS_AED_Certification__c,
            BCLS_AED_Instructor_Certification__c: !!certification.BCLS_AED_Instructor_Certification__c,
            CPR_AED_Certification__c: !!certification.CPR_AED_Certification__c,
            CPR_AED_Instructor_Certification__c: !!certification.CPR_AED_Instructor_Certification__c,
            Standard_First_aid_Certification__c: !!certification.Standard_First_aid_Certification__c,
            Date_of_Birth__c: birthdate,
            Email__c: email,
            Occupation__c: occupation,
            Full_Name_as_per_NRIC__c: name,
            Gender__c: gender,
            Home_Tel__c: homePhone,
            Mobile_No__c: mobilePhone,
            Nationality__c: nationality,
            Office_No__c: officePhone,
            Organisation_School_Name__c: schoolName,
            Race__c: race,
        };

        const result = await req.sfConn.sobject('Application__c').create(applicationData);

        return res.status(200).send({
            status: 200,
            result,
            message: 'APPLICATION_CREATED',
        });
    } catch (error) {
        return res.status(500).send({
            status: 500,
            records: null,
            message: error.message,
        });
    }
});


router.get('/getParticipant',
    salesforce.createSfObject, async (req, res) => {
        try {
            let textQuery = 'Select Id, Name, Contact__r.Name';
            textQuery = `${textQuery} from Participant__c where Id = '${req.query.participantId}'`;

            const result = await req.sfConn.query(textQuery);

            return res.status(200).send({
                status: 200,
                result,
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

router.post('/confirmParticipant', salesforce.createSfObject, async (req, res) => {
    try {
        const result = await req.sfConn.sobject('Participant__c').update({
            Id: req.body.participantId,
            Status__c: req.body.confirmation,
        });

        return res.status(200).send({
            status: 200,
            records: result,
        });
    } catch (error) {
        return res.status(500).send({
            status: 500,
            records: null,
            message: error,
        });
    }
});

module.exports = router;
