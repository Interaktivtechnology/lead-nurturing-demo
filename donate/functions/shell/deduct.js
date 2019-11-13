const jsforce = require('jsforce');
const moment = require('moment');
const crypto = require('crypto');
const nodefetch = require('node-fetch');
const { plainRedisConnection } = require('../class/redis');
const { toUrlEncoded, responseFGKeyMCP } = require('../class/common');

const md5 = crypto.createHash('md5');
const mcpSecret = process.env[`MCP_SECRET_${process.env.NODE_ENV}`] || '3118010007';
const mcpId = process.env[`MCP_ID_${process.env.NODE_ENV}`] || '3118010007';
const MCP_WEBHOOK = process.env[`MCP_WEBHOOK_${process.env.NODE_ENV}`] || 'https://test.interaktiv.sg/api-step-asia/donation/confirm-payment';


const env = process.env.NODE_ENV || 'SANDBOX';

const sfLogin = {
    username: process.env[`STEPASIA_SF_${env}_USERNAME`],
    password: process.env[`STEPASIA_SF_${env}_PASSWORD_TOKEN`],
};

const conn = new jsforce.Connection({
    loginUrl: env !== 'SANDBOX' ? 'https://login.salesforce.com' : 'https://test.salesforce.com',
});

const { redisGet, redisSet, redisExpire } = plainRedisConnection();
const establishConnection = () => (
    new Promise(async (resolve, reject) => {
        let sfToken = await redisGet(`sfToken:${env}`);
        sfToken = JSON.parse(sfToken);
        if (sfToken) {
            return resolve(sfToken);
        }
        return conn.login(sfLogin.username, sfLogin.password, (err, result) => {
            try {
                if (err) {
                    throw err;
                } else {
                    const sfSession = {
                        env,
                        accessToken: conn.accessToken,
                        instanceUrl: conn.instanceUrl,
                        id: result.id,
                        orgId: result.organizationId,
                        issued_at: new Date().getTime(),
                    };
                    redisSet(`sfToken:${env}`, JSON.stringify(sfSession));
                    redisExpire(`sfToken:${env}`, 60 * 60);
                    return resolve(sfSession);
                }
            } catch (error) {
                return reject(error);
            }
        });
    })
);

const doDeduction = async (sfId, sfConn) => {
    try {
        const donation = await sfConn.sobject('Donation__c').retrieve(sfId);
        if (donation === null) {
            return { status: 400, message: 'DONATION_NOT_FOUND' }
        }
        const account = await sfConn.sobject('Account').retrieve(donation.Donor_Name__c);
        if (account.CardToken__c === null) {
            return { status: 400, message: 'NO_CARD_TOKEN' };
        }
        const beforeEncrypted = `${mcpSecret}?mid=${mcpId}&ref=${sfId}&cur=SGD&amt=${donation.Amount__c}`;
        const encrypted = md5.update(beforeEncrypted).digest('hex');
        const data = toUrlEncoded({
            mid: mcpId,
            txntype: 'SALE',
            reference: sfId,
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
        }).then(resp => resp.json());
        if (mcpResult.rescode.toString() !== '200' && mcpResult.rescode.toString() !== '0000') {
            return {
                status: 400, message: 'DONATION_NOT_UPDATED', mcpResult,
            };
        }
        // const fgkey = responseFGKeyMCP(req.body.id, 'sgd', donation.Amount__c, mcpResult.rescode, mcpResult.transid);
        await sfConn.sobject('Donation__c').update({
            Id: sfId,
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
        return { status: 200, message: 'DONATION_SENT', mcpResult };
    } catch (error) {
        return { status: 500, message: 'DONATION_NOT_UPDATED', errorMsg: error.message };
    }
};


(async () => {
    const sfToken = await establishConnection();
    const connFromToken = new jsforce.Connection({
        accessToken: sfToken.accessToken,
        serverUrl: sfToken.instanceUrl,
    });
    const query = `
        Select Id, Amount__c from Donation__c where Donation_Date__c = ${moment().format('YYYY-MM-DD')}
        AND Donation_Status__c = 'Received' AND Frequency_Type__c = 'Recurring'
    `;
    const result = await connFromToken.query(query);
    const requests = result.records.map(record => doDeduction(record.Id, connFromToken));
    const deductionResult = await Promise.all(requests);
})().then(() => {
    process.exit();
});
