import md5 from 'crypto-js/md5';
import sweetalert from 'sweetalert2';
import moment from 'moment';
import { API_URL, MCP_WEBHOOK } from '../static/variable';


export async function submitDonation(formData) {
    const mcpMID = 3118010007;
    const currency = formData.currency || 'SGD';
    const mcpSecret = 3118010007;
    const donationData = {
        name: `${formData.firstName} ${formData.lastName}`,
        idNumber: formData.IDno,
        idType: formData.IDtype,
        email: formData.email,
        address: formData.address,
        country: 'Singapore',
        postalCode: formData.postalCode,
        acknowledgePublicity: formData.acknowledgedPublicly,
        amount: formData.amount,
        phoneNumber: formData.phoneNumber,
        frequentType: formData.recurring ? 'Recurring' : 'One-time',
        remarks: formData.remarks,
    };
    if (formData.accountId) {
        donationData.contactId = formData.contactId;
        donationData.accountId = formData.accountId;
    }
    if (formData.recurring) {
        donationData.frequentPeriod = formData.recurringType;
        donationData.frequencyMax = formData.recurringAmount;
    }
    if (formData.programmeEvent) {
        donationData.programmeEvent = formData.programmeEvent;
    }
    const response = await fetch(`${API_URL}donation/make`, {
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(donationData),
        method: 'POST',
    }).then(res => res.json());
    if (response.result) {
        const beforeEncrypted = `${mcpSecret}?mid=${mcpMID}&ref=${response.result.id}&cur=${currency}&amt=${formData.amount}`;
        const encrypted = md5(beforeEncrypted);
        const data = {
            mid: mcpMID,
            txntype: 'SALE',
            reference: response.result.id,
            cur: formData.currency,
            amt: formData.amount,
            shop: 'STEP Asia',
            buyer: `${formData.firstName} ${formData.lastName}`,
            tel: formData.phoneNumber,
            email: formData.email,
            product: 'STEP Asia Donation',
            lang: 'EN',
            statusurl: MCP_WEBHOOK,
            returnurl: `${document.location.origin}/thank-you?return=true`,
            fgkey: encrypted.toString(),
            tokenize: 'Y',
        };
        const form = document.createElement('form');
        document.body.appendChild(form);
        form.method = 'post';
        form.action = 'https://map.uat.mcpayment.net/payment/dopayment';

        for (const key of Object.keys(data)) {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            input.value = data[key];
            form.appendChild(input);
        }

        form.submit();
    } else {
        let errorMessage = '';
        if (typeof response.message === 'object') errorMessage = response.message.map(error => error.msg).join('<br />');
        else {
            errorMessage = response.message;
        }
        sweetalert.fire({
            text: errorMessage,
            type: 'error',
            title: 'Incomplete Request',
            imageUrl: require('../static/img/interaktiv-logo.png'),
            animation: true,
        });
    }
}

export default '';
