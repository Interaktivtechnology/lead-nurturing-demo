const faker = require('faker');
const assert = require('assert');
const { describe, before, after } = require('mocha');
const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app');

// Configure chai
chai.use(chaiHttp);
chai.should();
faker.locale = 'id_ID';

describe('Test Application Page', () => {
    before(() => {

    });

    const randomNumber = faker.random.number({ min: 100, max: 999 });

    const postedData = {
        name: `test${randomNumber}`,
        email: `test${randomNumber}@gmail.com`,
        mobilePhone: '+6285213230818',
        country: 'Singapore',
        homePhone: '+6285213230818',
        officePhone: '+6285213230818',
        gender: 'Male',
        certification: {
            BCLS_AED_Certification__c: true,
            BCLS_AED_Instructor_Certification__c: true,
            CPR_AED_Certification__c: false,
            CPR_AED_Instructor_Certification__c: false,
        },
        occupation: 'Student',
        schoolName: 'School ABC',
        birthdate: '1988-10-12',
        nationality: 'Singapore',
        race: 'Other',
        school: '0019000001ehpOl',
    };

    it('Should create new contact and application', async () => {
        const result = await chai.request(app)
            .post('/application/create')
            .set({
                'Content-Type': 'application/json',
            })
            .send(postedData);

        result.should.have.status(200);
        result.body.should.have.property('result');
        result.body.should.have.property('message');
        result.body.message.should.equal('APPLICATION_CREATED');
    }).timeout(15000);

    after(() => {

    });
});
