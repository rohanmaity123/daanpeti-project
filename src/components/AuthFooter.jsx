import React, { useReducer } from 'react';
import { memo } from "react";
import Reducer from '../services/Reducer';
import useGlobalStore from "../hooks/useGlobalStore";

const initState = {
  termConditionAcceptModalType: '',
};


const AuthFooter = () => {
  const [state, dispatch] = useReducer(Reducer, initState);
  const { TOGGLE_TERM_CONDITION_MODAL, toggleForModal } = useGlobalStore();

  //TermAcceptModal
  const goToTermAcceptModal = (type) => {
    dispatch({ type: "SETDATA", payload: { "name": "termConditionAcceptModalType", "value": type } })
    toggleForModal('TOGGLE_TERM_CONDITION_MODAL')
  };

  return (
    <>
      <footer className="mainDashboard-footer">
        <p className='text-center'>© 2024 ALOCHHAYA MICRO CARE FOUNDATION. All Rights Reserved</p>
      </footer>
    </>
  );
};


export default memo(AuthFooter);
