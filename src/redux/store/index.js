/* eslint-disable no-unused-vars */
import {
    useDispatch as useReduxDispatch,
    useSelector as useReduxSelector,
  } from "react-redux";
  import { configureStore } from "@reduxjs/toolkit";
  import rootReducer from "../root-reducer";
//   import { setupListeners } from '@reduxjs/toolkit/query';
  
  let devtool = false;
  
  /* @ts-ignore */
  if (process.env.NODE_ENV === 'development') {
    devtool = true;
  }
  
  export const store = configureStore({
    reducer: rootReducer,
    devTools: devtool,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware(),
  });
  
  export const useDispatch = () => useReduxDispatch();
  export const useSelector = useReduxSelector;
  
  // Setup listeners
//   setupListeners(store.dispatch);
  