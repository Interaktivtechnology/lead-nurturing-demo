const DEFAULT_STATE = {
    accessToken: '',
    expiredAt: 0,
};


const fnList = {
    NEW_ACCESS_TOKEN: (state, payload) => ({
        ...state,
        accessToken: payload.accessToken,
        expiredAt: payload.expiredAt,
    }),
};

export default (state = DEFAULT_STATE, { type, payload }) => {
    const fn = fnList[type];
    if (typeof fn === 'function') {
        return fn(state, payload);
    }
    return state;
};
