// soundSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../app/appStore';

interface SoundState {
  soundEnabled: boolean;
}

const initialState: SoundState = {
  soundEnabled: true,
};

const soundSlice = createSlice({
  name: 'sound',
  initialState,
  reducers: {
    toggleSound(state) {
      state.soundEnabled = !state.soundEnabled;
    },
  },
});

export const { toggleSound } = soundSlice.actions;
export const selectSoundEnabled = (state: RootState) => state.sound.soundEnabled;
export default soundSlice.reducer;
