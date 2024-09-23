// src/components/CalendarSection.js
import React, { useState, useEffect } from "react";
import { Calendar } from "react-big-calendar";
import { Box, Typography, Dialog, DialogActions, DialogContent, DialogTitle, Button, TextField, Snackbar, Alert } from "@mui/material";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useSelector, useDispatch } from "react-redux";
import { setHabits, addHabit } from "../store/slices/habitSlice";
import { onSnapshot, collection, query, where, addDoc, serverTimestamp } from "firebase/firestore";

import { db } from "../firebase";
import { format, parseISO, startOfWeek, getDay } from "date-fns";
import { dateFnsLocalizer } from "react-big-calendar";

const locales = {
  "en-US": require("date-fns/locale/en-US"),
};

const localizer = dateFnsLocalizer({
  format: (date, formatString) => format(date, formatString),
  parse: (dateString) => parseISO(dateString),
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay: getDay,
  locales,
});

const CalendarSection = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [events, setEvents] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [habitTitle, setHabitTitle] = useState("");
  const [habitDescription, setHabitDescription] = useState("");
  const [selectedSlot, setSelectedSlot] = useState(null);
  
  // Snackbar state
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success"); // 'success' or 'error'

  console.log("Authenticated User:", user);

  useEffect(() => {
    if (!user) {
      console.log("No authenticated user. Exiting useEffect.");
      return;
    }

    console.log("Fetching habits for user:", user.uid);
    
    const q = query(collection(db, "habits"), where("userId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log("Snapshot received with", snapshot.size, "documents.");
      
      const habitsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      
      console.log("Habits Data:", habitsData);
      
      // Dispatch the actual habits data to Redux
      dispatch(setHabits(habitsData));
      
      // Map habits to calendar events
      const eventsData = habitsData.map((habit) => {
        const habitDate = habit.date ? parseISO(habit.date) : new Date();
        return {
          id: habit.id,
          title: habit.name,
          start: habitDate,
          end: new Date(habitDate.getTime() + 60 * 60 * 1000), // 1-hour duration
          allDay: false,
        };
      });
      
      console.log("Events Data:", eventsData);
      
      setEvents(eventsData);
    }, (error) => {
      console.error("Error fetching habits for calendar:", error);
      setSnackbarMessage("Failed to fetch habits.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    });

    return () => unsubscribe();
  }, [user, dispatch]);

  const handleSelectSlot = (slotInfo) => {
    console.log("handleSelectSlot called with:", slotInfo);
    if (slotInfo.start && slotInfo.end) {
      setSelectedSlot(slotInfo.start); // Store only the start date
      setModalOpen(true);
    } else {
      console.warn("Invalid slot selection:", slotInfo);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setHabitTitle("");
    setHabitDescription("");
    setSelectedSlot(null);
  };

  const handleAddHabit = async () => {
    console.log("handleAddHabit called");
    console.log("Habit Title:", habitTitle);
    console.log("Habit Description:", habitDescription);
    console.log("Selected Date:", selectedSlot);
    console.log("User ID:", user ? user.uid : "No user");

    
    // Check for validations
    if (!habitTitle || !selectedSlot || !user) {
      setSnackbarMessage("Please provide a title and select a date.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      console.warn("Validation failed: Missing habitTitle, selectedSlot, or user.");
      return;
    }
  
    const newHabit = {
      name: habitTitle,
      description: habitDescription || "", // Handle optional description
      userId: user.uid,
      date: selectedSlot.toISOString(), // Save date in ISO format
      streak: 0,
      history: [],
      createdAt: serverTimestamp(), // Added timestamp for habit creation
    };
  
    try {
      // Add the habit to Firestore
      console.log("Adding habit:", newHabit);
      const docRef = await addDoc(collection(db, "habits"), newHabit);
      console.log("Habit added successfully with ID:", docRef.id);
      // Dispatch habit to Redux store
      dispatch(addHabit({ id: docRef.id, ...newHabit }));
  
      // Feedback for success
      setSnackbarMessage("Habit added successfully!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
  
      // Close the modal and reset state
      handleCloseModal();
    } catch (error) {
      console.error("Error adding habit:", error);
      setSnackbarMessage("Failed to add habit. Please try again.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };
  

  return (
    <Box sx={{ height: { xs: "600px", md: "700px" }, mt: 4 }}>
      <Typography variant="h6" gutterBottom>
        Habit Calendar
      </Typography>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: "100%" }}
        selectable
        onSelectEvent={(event) => alert(event.title)}
        onSelectSlot={handleSelectSlot}
      />

      {/* Add Habit Modal */}
      <Dialog open={modalOpen} onClose={handleCloseModal}>
        <DialogTitle>Add Habit</DialogTitle>
        <DialogContent>
          <Typography variant="subtitle1" gutterBottom>
            Selected Date: {selectedSlot ? selectedSlot.toLocaleString() : ""}
          </Typography>
          <TextField
            label="Habit Title"
            variant="outlined"
            fullWidth
            margin="normal"
            value={habitTitle}
            onChange={(e) => setHabitTitle(e.target.value)}
          />
          <TextField
            label="Description"
            variant="outlined"
            fullWidth
            margin="normal"
            value={habitDescription}
            onChange={(e) => setHabitDescription(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Cancel</Button>
          <Button variant="contained" color="primary" onClick={handleAddHabit}>
            Add Habit
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for User Feedback */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CalendarSection;
