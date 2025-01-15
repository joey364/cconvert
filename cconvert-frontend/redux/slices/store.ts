import { configureStore } from "@reduxjs/toolkit";
import { cconvertApi } from "../../api/cconvert-api";

const initialAuthState = {
  token: null
}

const authReducer = (state = initialAuthState, action: any) => {
  switch (action.type) {
    case 'auth/setToken':
      return { ...state, token: action.payload };
    case 'auth/logout':
      return { ...state, token: null };
    default:
      return state;
  }
};

const initialSupportedCurrencyState = {
  currencies: null
}

const currencyReducer = (state = initialSupportedCurrencyState, action: any) => {
  switch (action.type) {
    case 'currencies/setSupportedCurrencies':
      return { ...state, currencies: action.payload }
    default:
      return state
  }
}

export const store = configureStore({
  reducer: {
    auth: authReducer,
    currencies: currencyReducer,
    [cconvertApi.reducerPath]: cconvertApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(cconvertApi.middleware)
})

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;