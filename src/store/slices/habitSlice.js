// src/store/slices/habitSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  habits: [], // Array of habit objects
  loading: false,
  error: null,
};

const habitSlice = createSlice({
  name: "habits",
  initialState,
  reducers: {
    setHabits(state, action) {
      state.habits = action.payload;
    },
    addHabit(state, action) {
      state.habits.push(action.payload);
    },
    updateHabit(state, action) {
      const index = state.habits.findIndex(habit => habit.id === action.payload.id);
      if (index !== -1) {
        state.habits[index] = action.payload;
      }
    },
    deleteHabit(state, action) {
      state.habits = state.habits.filter(habit => habit.id !== action.payload);
    },
    setLoading(state, action) {
      state.loading = action.payload;
    },
    setError(state, action) {
      state.error = action.payload;
    },
    clearError(state) {
      state.error = null;
    },
  },
});

export const { setHabits, addHabit, updateHabit, deleteHabit, setLoading, setError, clearError } = habitSlice.actions;
export default habitSlice.reducer;
