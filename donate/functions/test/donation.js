
const faker = require('faker');
const assert = require('assert');
const { describe, before, after } = require('mocha');
const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../');
const { responseFGKeyMCP } = require('../class/common');
// Configure chai
chai.use(chaiHttp);
chai.should();
faker.locale = 'id_ID';

describe('Test donation page URL', () => {
    let contactResponse = {};
    const postedData = {
        name: faker.name.findName(),
        idNumber: '',
        idType: 'Others',
        email: faker.internet.email(),
        address: faker.address.streetAddress(),
        country: 'Singapore',
        postalCode: faker.random.number({ min: 100000, max: 999999 }),
        acknowledgePublicity: faker.random.number() % 2 === 0,
        amount: faker.random.number({ min: 10, max: 100 }),
        frequentType: 'Recurring',
        frequentPeriod: 'monthly',
        phoneNumber: '+6285213230818',
        frequencyMax: 12,
        programmeEvent: 'a0v9D0000004gBq',
    };
    before(async () => {
        const result = await chai.request(app)
            .get('/donation/getContactId')
            .query({
                email: 'sikomo.eko@gmail.com',
            });
        contactResponse = result.body;
        return Promise.resolve();
    });

    it('Check cors enabled site', (done) => {
        chai.request(app)
            .get('/cors')
            .send({})
            .end((err, res) => {
                // console.info(res.body);
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('message');
                res.body.message.should.equal('CORS_ENABLED');
                done();
            });
    });
    it('Should check donation nric from salesforce', (done) => {
        chai.request(app)
            .get('/donation/getContactId')
            .query({
                email: 'sikomo.eko@gmail.com',
            })
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('contactId');
                if (res.body.contactId !== null) {
                    res.body.contactId.should.be.a('string');
                }
                done();
            });
    }).timeout(10000);
    
    it('Should create donation and make it as reference', async () => {
        if (contactResponse.contactId) {
            postedData.contactId = contactResponse.contactId;
            postedData.accountId = contactResponse.accountId;
        }
        const donationRes = await chai.request(app)
            .post('/donation/make')
            .set({
                'Content-Type': 'application/json',
            })
            .send(postedData);
        donationRes.should.have.status(200);
        donationRes.body.should.have.property('result');
        donationRes.body.should.have.property('message');
        donationRes.body.message.should.equal('TRANSACTION_CREATED');
        Promise.resolve();
    }).timeout(15000);

    it('Should create donation from new contact', async () => {
        delete postedData.contactId;
        delete postedData.accountId;
        const donationRes = await chai.request(app)
            .post('/donation/make')
            .set({
                'Content-Type': 'application/json',
            })
            .send(postedData);
        // console.info(donationRes.body);
        donationRes.should.have.status(200);
        donationRes.body.should.have.property('result');
        donationRes.body.should.have.property('message');
        donationRes.body.message.should.equal('TRANSACTION_CREATED');

        // Testing the response from MCP
        const { result } = donationRes.body;
        const transId = faker.random.number();
        const fgkey = responseFGKeyMCP(result.id, 'sgd', postedData.amount, '0000', transId);
        const mcpPostedData = {
            fgkey,
            cur: 'sgd',
            amt: postedData.amount,
            reference: result.id,
            resdt: new Date().getTime(),
            transid: transId,
            buyer: postedData.name,
            email: faker.internet.email(),
            resmsg: 'OK',
            tel: '',
            rescode: '0000',
        };
        const confirmationFromMCP = await chai.request(app)
            .post('/donation/confirm-payment')
            .set({
                'Content-Type': 'application/json',
            })
            .send(mcpPostedData);
        confirmationFromMCP.should.have.status(200);
        Promise.resolve();
    }).timeout(15000);

    it('Should confirm MCP Payment', async () => {
        const confirmationFromMCP = await chai.request(app)
            .post('/donation/confirm-payment')
            .set({
                'Content-Type': 'application/json',
            })
            .send(require('./mcpResponse.json'));
        confirmationFromMCP.should.have.status(200);
    }).timeout(10000);

    it('Should create recurring donation', async () => {
        const resultRecurring = await chai.request(app)
            .post('/donation/recurring-donation')
            .set({
                'Content-Type': 'application/json',
            })
            .send({ id: 'a0r9D0000009PyR' });
        console.info(resultRecurring.body);
        resultRecurring.should.have.status(200);
    }).timeout(10000);

    it('should retrieve active programmes', async () => {
        const result = await chai.request(app)
            .get('/donation/active-programmes')
            .send();
        result.should.have.status(200);
        result.body.records.should.be.an('array');
        if (result.body.records.length > 0) {
            result.body.records[0].should.have.property('Id');
            result.body.records[0].should.have.property('Ttile__c');
            result.body.records[0].should.have.property('Name');
        }
    }).timeout(10000);

    after(() => {

    });
});
