import { combineReducers } from 'redux';
import firebaseReducers from './firebaseReducers';
import basicInfo from './basicInfo';


const rootReducers = combineReducers({
    user: firebaseReducers,
    basicInfo,
});

export default rootReducers;
