// src/store/index.js
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import habitReducer from "./slices/habitSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    habits: habitReducer,
  },
});

export default store;
