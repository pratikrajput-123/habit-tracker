// src/components/Dashboard.js
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db, auth } from "../firebase";
import { setHabits } from "../store/slices/habitSlice";
import { signOut } from "firebase/auth";
import { Button, Container, Typography, Box, Grid } from "@mui/material";
import HabitList from "./Habits/HabitList";
import AddHabit from "./Habits/AddHabit";
import Analytics from "./Analytics";
import CalendarSection from "./CalendarSection"; 
import { toast } from "react-toastify";

const Dashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "habits"), where("userId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const habitsData = [];
      snapshot.forEach((doc) => {
        habitsData.push({ id: doc.id, ...doc.data() });
      });
      console.log("Fetched Habits from Firestore:", habitsData); // Add logging
      dispatch(setHabits(habitsData));
    }, (error) => {
      toast.error(error.message);
    });
  
    return () => unsubscribe();
  }, [user, dispatch]);

  
  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success("Logged out successfully!");
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
    <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
      <Typography variant="h4">Habit Tracker</Typography>
      <Button variant="contained" color="secondary" onClick={handleLogout}>
        Logout
      </Button>
    </Box>
    <Grid container spacing={4}>
      <Grid item xs={12} md={6}>
        <AddHabit />
        <HabitList />
      </Grid>
      <Grid item xs={12} md={6}>
        <Analytics />
        <CalendarSection /> {/* Add the CalendarSection */}
      </Grid>
    </Grid>
  </Container>
  );
};

export default Dashboard;
