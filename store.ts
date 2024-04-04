import { configureStore } from '@reduxjs/toolkit';
import accountReducer from './AccountReducer';

const store = configureStore({
    reducer: {
        // Define a top-level state field named `counter`, handled by `counterReducer`
        account: accountReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
