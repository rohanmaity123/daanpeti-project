import React from 'react';
import { Modal } from 'react-bootstrap';
import useGlobalStore from "../../hooks/useGlobalStore";


const TermConditionModal = (props) => {

  const { TOGGLE_TERM_CONDITION_MODAL, toggleForModal } = useGlobalStore();

  const handleClose = () => toggleForModal('TOGGLE_TERM_CONDITION_MODAL')//dispatch({ type: 'TOGGLE_TERM_CONDITION_MODAL' });
  const handleNotClose = () => console.log("Not Close Modal")


  return (
    <div>
      <Modal show={TOGGLE_TERM_CONDITION_MODAL} onHide={handleNotClose}
        aria-labelledby="contained-modal-title-vcenter"
        centered scrollable className="customModal1 termsCondition__modal"
      >
        <Modal.Header>
          <h5 className="modal-title">{props && props.type && props.type === 'term' ? "Terms of Use" :  "Privacy"}</h5>
          <button type="button" className="customModal1-close" onClick={handleClose}>
            <img src="/images/modaclosebtn.svg" alt="" />
          </button>
        </Modal.Header> 
        <Modal.Body>
        Hi

        </Modal.Body>
        {/* <Modal.Footer>
          <button type="button" className="themeBtnBlue" onClick={handleClose}>Read It</button>
        </Modal.Footer> */}
      </Modal>
    </div>
  );
}

export default TermConditionModal;