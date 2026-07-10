import {
    Action,
    Reducer,
    combineReducers,
    configureStore,
} from "@reduxjs/toolkit";
import * as Redux from "redux";
import logger from "redux-logger";
import {
    persistStore,
    persistReducer,
    FLUSH,
    REHYDRATE,
    PAUSE,
    PERSIST,
    PURGE,
    REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage";

import { LOGOUT } from "./actions/types";
import { ReduxSlices } from "../types/enums";
import authReducer, { initialAuthState } from "./reducers/auth.reducer";
import userReducer, { initialUserState } from "./reducers/user.reducer";

const middleware: Redux.Middleware[] = [];
if (import.meta.env.MODE === "development") middleware.push(logger);

const persistConfig = {
  key: "cms-root",
  storage,
  whitelist: [ReduxSlices.User, ReduxSlices.Auth],
};

const combinedReducer = combineReducers({
    [ReduxSlices.User]: userReducer,
    [ReduxSlices.Auth]: authReducer,
});

const rootReducer: Reducer = (state, action: Action) => {
    if (action.type === LOGOUT) {
        localStorage.removeItem("persist:root");
        return combinedReducer(
            {
                [ReduxSlices.User]: initialUserState,
                [ReduxSlices.Auth]: initialAuthState,
            },
            action
        );
    } else {
        return combinedReducer(state, action);
    }
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) => {
        return getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
        }).concat(middleware);
    },
    devTools: import.meta.env.MODE === "development",
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof combinedReducer>;

export type AppDispatch = typeof store.dispatch;

export const getAccessToken = (state: RootState): string | null => {
  if (state.auth.token) return state.auth.token;
  return null;
};