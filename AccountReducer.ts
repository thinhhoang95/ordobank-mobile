import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from './store'

// Define a type for the slice state
interface AccountState {
  iban: string
}

const initialState = {
    iban: 'XX12345678901234567890'
} as AccountState

export const accountSlice = createSlice({
  name: 'account',
  initialState,
  reducers: {
    setIban: (state, action: PayloadAction<string>) => {
      state.iban = action.payload
    },
  },
})

export const { setIban } = accountSlice.actions

// Other code such as selectors can use the imported `RootState` type
export const selectIban = (state: RootState) => state.account.iban

export default accountSlice.reducer
