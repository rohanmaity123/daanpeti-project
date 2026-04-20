import React, { createContext, useReducer } from 'react';

const initialGlobalState = {

  customValue: "old value in global store",
  TOGGLE_TERM_CONDITION_MODAL: false,
  TOGGLE_ADD_NOTE_MODAL: false,
  TOGGLE_REFERRAL_MODAL: false,
  TOGGLE_ADD_LEAD_NOTE_MODAL: false,
  TOGGLE_ADD_UPDATE_CV_MODAL: false,
  TOGGLE_ADD_UPDATE_CERTIFICATE_MODAL: false,
  TOGGLE_ADD_MILESTONE_MODAL: false,
  TOGGLE_CHANGE_STATUS_MODAL: false,
  TOGGLE_LOGIN_ALERT_MODAL: false,
  TOGGLE_PICKUP_OTP_MODAL: false,
};

const reducer = (state, action) => {
  switch (action.type) {

    case 'ADDVALUE': {
      return {
        ...state,
        customValue: "demo value for global context"
      };
    }
    case 'MODAL_OFF': {
      console.log(action.payload)
      return {
        ...state,
        [action.payload]: false
      };
    }
    case 'TOGGLE_MODAL': {
      if (action.payload === 'TOGGLE_TERM_CONDITION_MODAL') {
        return {
          ...state,
          [action.payload]: !state.TOGGLE_TERM_CONDITION_MODAL,
        }
      } else if (action.payload === 'TOGGLE_ADD_NOTE_MODAL') {
        return {
          ...state,
          [action.payload]: !state.TOGGLE_ADD_NOTE_MODAL,
        }
      } else if (action.payload === 'TOGGLE_ADD_MILESTONE_MODAL') {
        return {
          ...state,
          [action.payload]: !state.TOGGLE_ADD_MILESTONE_MODAL,
        }
      } else if (action.payload === 'TOGGLE_ADD_LEAD_NOTE_MODAL') {
        return {
          ...state,
          [action.payload]: !state.TOGGLE_ADD_LEAD_NOTE_MODAL,
        }
      } else if (action.payload === 'TOGGLE_SCHEDULE_PAYMENT_MODAL') {
        return {
          ...state,
          [action.payload]: !state.TOGGLE_SCHEDULE_PAYMENT_MODAL,
        }
      }
      else if (action.payload === 'TOGGLE_PICKUP_OTP_MODAL') {
        return {
          ...state,
          [action.payload]: !state.TOGGLE_PICKUP_OTP_MODAL,
        }
      }
      else if (action.payload === 'TOGGLE_ADD_UPDATE_CV_MODAL') {
        return {
          ...state,
          [action.payload]: !state.TOGGLE_ADD_UPDATE_CV_MODAL,
        }
      } else if (action.payload === 'TOGGLE_ADD_UPDATE_CERTIFICATE_MODAL') {
        return {
          ...state,
          [action.payload]: !state.TOGGLE_ADD_UPDATE_CERTIFICATE_MODAL,
        }
      }
      else if (action.payload === 'TOGGLE_LOGIN_ALERT_MODAL') {
        return {
          ...state,
          [action.payload]: !state.TOGGLE_LOGIN_ALERT_MODAL,
        }
      }
      else if (action.payload === 'TOGGLE_CHANGE_STATUS_MODAL') {
        return {
          ...state,
          [action.payload]: !state.TOGGLE_CHANGE_STATUS_MODAL,
        }
      } else if (action.payload === 'TOGGLE_REFERRAL_MODAL') {
        return {
          ...state,
          [action.payload]: !state.TOGGLE_REFERRAL_MODAL,
        }
      }
      break;
    }
    default: {
      return { ...state };
    }
  }
};

const GlobalContext = createContext({
  ...initialGlobalState,
  addValMethod: () => { console.log('Add Value') },
  toggleForModal: () => { console.log('Modal') },
  offForModal: () => { console.log('Modal off') },

});
export const GlobalStoreProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialGlobalState);

  const addValMethod = (payload) => {
    dispatch({ type: 'ADDVALUE', payload: payload });
  };
  const toggleForModal = (payload) => {
    dispatch({ type: 'TOGGLE_MODAL', payload: payload });
  };
  const offForModal = (payload) => {
    dispatch({ type: 'MODAL_OFF', payload: payload });
  };

  return (
    <GlobalContext.Provider
      value={{
        ...state,
        addValMethod,
        toggleForModal,
        offForModal
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalContext;
