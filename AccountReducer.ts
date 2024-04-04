import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from './store'

// Define a type for the slice state
interface AccountState {
  iban: string
}

const initialState = {
    iban: 'IBAN',
    refreshAnyway: false
} as AccountState

interface AccountState {
  iban: string
  refreshAnyway: boolean
}

export const accountSlice = createSlice({
  name: 'account',
  initialState,
  reducers: {
    setIban: (state, action: PayloadAction<string>) => {
      state.iban = action.payload
    },
    setRefreshAnyway: (state, action: PayloadAction<boolean>) => {
      state.refreshAnyway = action.payload
    }
  },
})

export const { setIban, setRefreshAnyway } = accountSlice.actions

// Other code such as selectors can use the imported `RootState` type
export const selectIban = (state: RootState) => state.account.iban

export default accountSlice.reducer
