import md5 from 'crypto-js/md5';
import sweetalert from 'sweetalert2';
import moment from 'moment';
import { API_URL, MCP_WEBHOOK } from '../static/variable';


export async function submitApplication(formData) {
    const applicationData = {
        name: formData.name,
        email: formData.email,
        gender: formData.gender,
        language: formData.language,
        nationality: formData.nationality,
        race: formData.race,
        birthdate: `${formData.yearBirth}-${formData.monthBirth}-${formData.dateBirth}`,
        certification: {
            BCLS_AED_Certification__c: formData.bclsAed,
            BCLS_AED_Instructor_Certification__c: formData.bclsAedI,
            CPR_AED_Certification__c: formData.cprAed,
            CPR_AED_Instructor_Certification__c: formData.cprAedI,
            Standard_First_aid_Certification__c: formData.standardFirstAid,
        },
        occupation: formData.occupation,
        schoolName: formData.schoolName,
    };

    if (formData.mobilePhone) { applicationData.mobilePhone = formData.mobilePhone; }
    if (formData.homePhone) { applicationData.homePhone = formData.homePhone; }
    if (formData.officePhone) { applicationData.officePhone = formData.officePhone; }

    const response = await fetch(`${API_URL}application/create`, {
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(applicationData),
        method: 'POST',
    }).then(res => res.json());

    if (response.result) {
        sweetalert.fire({
            text: 'Application Created',
            type: 'success',
            title: 'Success',
            imageUrl: require('../static/img/interaktiv-logo.png'),
            animation: true,
        }).then(() => {
            location.reload();
        });
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
