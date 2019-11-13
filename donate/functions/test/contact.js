const faker = require('faker');
const assert = require('assert');
const crypto = require('crypto');
const { describe, before, after } = require('mocha');
const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../');
// Configure chai
chai.use(chaiHttp);
chai.should();
faker.locale = 'id_ID';


describe('Test Contact us page endpoint', () => {
    const postedData = {
        name: faker.name.findName(),
        subject: faker.lorem.words(),
        email: faker.internet.email(),
        message: faker.lorem.sentences(),
    };

    const userAgent = 'Mozilla/5.0 (Linux; Android 7.0; SM-G610M Build/NRD90M) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.87 Mobile Safari/537.36';
    
    it('Should get webtoken', async () => {
        const sha1 = crypto.createHash('sha1');
        const response = await chai.request(app)
            .get('/contact/jwt')
            .set({
                'user-agent': userAgent,
            })
            .query({ fingerPrint: sha1.update(postedData.email).digest('hex') })
            .send();
        response.should.have.status(200);
        response.body.should.have.property('accessToken');
        response.body.should.have.property('expiredAt');
        response.body.expiredAt.should.be.a('number');
    });

    it('Sending contact us page request', async () => {
        const sha1 = crypto.createHash('sha1');
        const jwt = await chai.request(app)
            .get('/contact/jwt')
            .set({
                'user-agent': userAgent,
            })
            .query({ fingerPrint: sha1.update(postedData.email).digest('hex') })
            .send();
        const res = await chai.request(app)
            .post('/contact/create')
            .set({
                'user-agent': userAgent,
                token: jwt.body.accessToken,
            })
            .send(postedData);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('message');
        res.body.message.should.equal('CONTACT_US_CREATED');
    }).timeout(10000);

    it('should reject contact us without valid token', async () => {
        const res = await chai.request(app)
            .post('/contact/create')
            .set({
                'user-agent': userAgent,
            })
            .send(postedData);
        res.should.have.status(400);
        res.body.should.have.property('message');
        res.body.message.should.equal('INVALID_TOKEN');
    });
});
