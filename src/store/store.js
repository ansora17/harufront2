import { configureStore } from "@reduxjs/toolkit";
import loginReducer from "../slices/loginSlice";
import mealReducer from "../slices/mealSlice";

const store = configureStore({
  reducer: {
    login: loginReducer, // clean naming
    meal: mealReducer,
  },
});

export default store;
