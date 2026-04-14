import { combineReducers } from 'redux'
import user from './slice/user';
const rootReducer = combineReducers({
  user,
})

export default rootReducer
