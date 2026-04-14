import React, { useEffect, useReducer, useState } from "react";
import useGlobalStore from "../../hooks/useGlobalStore";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import ToastHot, { toast } from "react-hot-toast";
import DialogTitle from "@mui/material/DialogTitle";
import { RiCloseLargeFill } from "react-icons/ri";
import Reducer from "../../services/Reducer";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import Validator from "../../utils/Validation";
import { AddNoteFromAdmission, AddNoteFromLead, CreateMilestoneData, GetLeadNoteList, GetNoteList, GetStatusListNots } from "../../actions/mainAction";
import { Avatar } from "@mui/material";
import moment from "moment";
import { ChangeStatusStaf } from "../../actions/authAction";

const initState = {
  title: "",
  lastworkingDate: "",
  followUpDate: "",
  loading: false,
  validate: false,
};
const generalState = {
  titleErrBlank: false,
  descriptionErrBlank: false,
  amountErrBlank: false,
};
const ChangeStatusModal = ({ statusData, calbackfunc }) => {
  const [state, dispatch] = useReducer(Reducer, initState);
  const [stateForErr, dispatchForErr] = useReducer(Reducer, generalState);
  const { TOGGLE_CHANGE_STATUS_MODAL, toggleForModal } = useGlobalStore();

  const handleClose = () => toggleForModal("TOGGLE_CHANGE_STATUS_MODAL"); //dispatch({ type: 'TOGGLE_CHANGE_STATUS_MODAL' });
  const handleNotClose = () => console.log("Not Close Modal");

  const getData = (e) => {
    if (e.target.name === "title") {
      if (!Validator.text(e.target.value)) {
        dispatchForErr({
          type: "VALIDATECHECK",
          payload: { name: "titleErrBlank", value: true },
        });
      } else {
        dispatchForErr({
          type: "VALIDATECHECK",
          payload: { name: "titleErrBlank", value: false },
        });
      }
    }
    dispatch({ type: "ONCHANGE", payload: e });
  };
  const getEditor = (e) => {
    if (!Validator.text(e)) {
      dispatchForErr({
        type: "VALIDATECHECK",
        payload: { name: "descriptionErrBlank", value: true },
      });
    } else {
      dispatchForErr({
        type: "VALIDATECHECK",
        payload: { name: "descriptionErrBlank", value: false },
      });
    }

    dispatch({ type: "SETDATA", payload: { name: "description", value: e } });
  };

  const getValidation = () => {
    return new Promise((resolve, reject) => {
      if (Validator.text(state.title)) {
        resolve(true);
      } else {
        if (!Validator.text(state.title)) {
          dispatchForErr({
            type: "VALIDATECHECK",
            payload: { name: "titleErrBlank", value: true },
          });
        }
        resolve(false);
      }
    });
  };
  const addUpdateMember = async (e) => {
    e.preventDefault();
    let validationStatus = await getValidation();
    if (validationStatus) {
      let response = "";
      let payload = "";
      if (state.editId) {
        payload = {
          lead_note_id: state.editId ? state.editId : undefined,
          lead_id: statusData?.id ?? "",
          note_id: state.title,
          note: state.description,
          follow_up_date: state.followUpDate,
        };
        dispatch({ type: "LOAD", payload: true });

        response = ""; //await UpdateUserAccount(payload);
      } else {
        payload = {
          "user_id": statusData?.id ?? "",
          releasing_date: state.followUpDate,
          last_working_date: state.lastworkingDate,
          status: state.title
        };
        dispatch({ type: "LOAD", payload: true });
        response = await ChangeStatusStaf(payload);
      }
      if (response?.status === 200) {
        if (response.data.status === 200 && response.data.data !== null) {
          dispatch({ type: "LOAD", payload: false });
          if (state.editId) {
            ToastHot.success("Note successfully edited.");
          } else {
            ToastHot.success("Note added successfully.");
          }
          handleClose()

          dispatch({ type: "RESET", payload: initState });
          calbackfunc && calbackfunc(); //From Payment List
        } else {
          dispatch({ type: "LOAD", payload: false });
        }
      } else {
        dispatch({ type: "LOAD", payload: false });
      }
    }
  };

  return (
    <>
      <Dialog
        open={TOGGLE_CHANGE_STATUS_MODAL}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        className="theme-modal-s1"
      >
        <div className="theme-modal-header">
          <DialogTitle id="alert-dialog-title" className="dialog-title">
            Milestone
          </DialogTitle>
          <button className="close" onClick={() => handleClose()}>
            <RiCloseLargeFill />
          </button>
        </div>
        <DialogContent className="theme-modal-body">
          <div className="row">
            <div className="col-12 col-md-12">
              <div className="form-group">
                <label>Title</label>
                <select
                  className="form-control"
                  name="title"
                  value={state.title}
                  onChange={getData}
                >
                  <option value={""}>Select...</option>
                  <option value={"Active"}>Active</option>
                  <option value={"Inactive"}>Inactive</option>
                  <option value={"Releasing"}>Releasing</option>
                  <option value={"Released"}>Released</option>
                </select>
                {stateForErr.titleErrBlank && (
                  <p className="error-msg">Title is required.</p>
                )}
              </div>
            </div>
            {
              state.title == "Releasing" && (
                <div className="col-xs-12">
                  <div className="mb-3">
                    <label>Releasing Date</label>
                    <input
                      type="date"
                      className="form-control"
                      name="followUpDate"
                      value={state.followUpDate}
                      // min={moment().format("YYYY-MM-DD")}
                      onChange={getData}
                    />
                  </div>
                  {stateForErr.followUpDateErrBlank && (
                    <p className="error-msg">Releasing Date is required.</p>
                  )}
                </div>
              )
            }
            {
              state.title == "Released" && (
                <div className="col-xs-12">
                  <div className="mb-3">
                    <label>Last Working Date</label>
                    <input
                      type="date"
                      className="form-control"
                      name="lastworkingDate"
                      value={state.lastworkingDate}
                      // min={moment().format("YYYY-MM-DD")}
                      onChange={getData}
                    />
                  </div>
                  {stateForErr.lastworkingDateErrBlank && (
                    <p className="error-msg">Last working Date is required.</p>
                  )}
                </div>
              )
            }
            {/* <div className="col-12 col-md-12">
              <div className="form-group">
                <label>Description</label>
                <ReactQuill value={state.description} onChange={getEditor} />
                {stateForErr.descriptionErrBlank && (
                  <p className="error-msg">Description is required.</p>
                )}
              </div>
            </div> */}
          </div>
          <div className="theme-modal-footer">
            {/* <button
              className="themeBtnOutline"
              onClick={() => handleClose()}
            >
              Close
            </button> */}
            <button
              className="themeBtn"
              onClick={addUpdateMember}
              disabled={state.loading}
            >
              Submit
            </button>
          </div>



        </DialogContent>
      </Dialog>
    </>
  );
};

export default ChangeStatusModal;
