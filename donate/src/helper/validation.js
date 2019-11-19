import validator from 'validator';

export default function validation(value, type) {
    let obj = { success: true };
    type.every((element) => {
        switch (element) {
        case 'required': {
            if (validator.isEmpty(value)) {
                obj = {
                    success: false,
                    text: 'This field is required',
                    state: 'error',
                };
            }
            break;
        }
        case 'email': {
            if (!validator.isEmail(value)) {
                obj = {
                    success: false,
                    text: 'Email not valid',
                    state: 'error',
                };
            }
            break;
        }
        case 'number': {
            if (!validator.isNumeric(value)) {
                obj = {
                    success: false,
                    text: 'Only number allowed',
                    state: 'error',
                };
            }
            break;
        }
        case 'noUnderZero': {
            if (value <= 0) {
                obj = {
                    success: false,
                    text: 'Cannot be zero or negative',
                    state: 'error',
                };
            }
            break;
        }
        case 'true': {
            if (!value) {
                obj = {
                    success: false,
                    text: 'This field is required',
                    state: 'error',
                };
            }
            break;
        }
        default: {
            break;
        }
        }

        if (!obj.success) return false;
        return true;
    });

    return obj;
}


export const isValidEmail = email => (
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        .test(email)
);


export function slugify(text) {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '');            // Trim - from end of text
}

export const validateNRIC = (str) => {
    if (!str) return false;
    if (str.length !== 9) return false;
    str = str.trim().toUpperCase();

    let i;
    let icArray = [];
    for (i = 0; i < 9; i++) {
        icArray[i] = str.charAt(i);
    }

    icArray[1] = parseInt(icArray[1], 10) * 2;
    icArray[2] = parseInt(icArray[2], 10) * 7;
    icArray[3] = parseInt(icArray[3], 10) * 6;
    icArray[4] = parseInt(icArray[4], 10) * 5;
    icArray[5] = parseInt(icArray[5], 10) * 4;
    icArray[6] = parseInt(icArray[6], 10) * 3;
    icArray[7] = parseInt(icArray[7], 10) * 2;

    let weight = 0;
    for (i = 1; i < 8; i++) {
        weight += icArray[i];
    }

    const offset = (icArray[0] == 'T' || icArray[0] == 'G') ? 4 : 0;
    const temp = (offset + weight) % 11;

    const st = ['J', 'Z', 'I', 'H', 'G', 'F', 'E', 'D', 'C', 'B', 'A'];
    const fg = ['X', 'W', 'U', 'T', 'R', 'Q', 'P', 'N', 'M', 'L', 'K'];

    let theAlpha;
    if (icArray[0] === 'S' || icArray[0] === 'T') { theAlpha = st[temp]; } else if (icArray[0] === 'F' || icArray[0] == 'G') { theAlpha = fg[temp]; }

    return (icArray[8] === theAlpha);
};
