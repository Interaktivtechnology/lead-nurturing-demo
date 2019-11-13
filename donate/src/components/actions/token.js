import sha1 from 'crypto-js/sha1';
import { API_URL } from '../../static/variable';


export const getToken = () => async (dispatch, getState) => {
    const { basicInfo } = getState();
    if (basicInfo.expiredAt > new Date().getTime()) return;
    const token = await fetch(`${API_URL}contact/jwt?fingerPrint=${sha1(navigator.userAgent)}`, {
        method: 'GET',
    }).then(res => res.json());
    if (token.status === 200) {
        dispatch({
            type: 'NEW_ACCESS_TOKEN',
            payload: token,
        });
    }
};

export default getToken;
