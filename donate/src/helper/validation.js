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