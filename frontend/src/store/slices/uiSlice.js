import { createSlice } from "@reduxjs/toolkit";

const uiSlice = createSlice({
  name: "ui",
  initialState: {
    darkMode: false,
    sidebarOpen: false,
  },
  reducers: {
    // Toggle dark mode
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
    },

    // Set dark mode specifically
    setDarkMode: (state, action) => {
      state.darkMode = action.payload;
    },

    // Toggle sidebar visibility
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
  },
});

export const { toggleDarkMode, setDarkMode, toggleSidebar } = uiSlice.actions;
export default uiSlice.reducer;
