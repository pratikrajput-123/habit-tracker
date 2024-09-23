// src/components/Habits/HabitList.js
import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { collection, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { deleteHabit, updateHabit } from "../../store/slices/habitSlice";
import { List, ListItem, ListItemText, IconButton, Checkbox, Typography, Box, Dialog, DialogTitle } from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import EditHabit from "./EditHabit";
import { toast } from "react-toastify";
import { format } from "date-fns";

const HabitList = () => {
  const { habits } = useSelector((state) => state.habits);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [open, setOpen] = React.useState(false);
  const [selectedHabit, setSelectedHabit] = React.useState(null);

  const handleToggle = async (habit) => {
    try {
      const habitRef = doc(db, "habits", habit.id);
      const today = format(new Date(), "yyyy-MM-dd");
      const updatedHistory = habit.history ? 
        (habit.history.includes(today) ? habit.history.filter(date => date !== today) : [...habit.history, today]) 
        : [today]; // Initialize as [today] if undefined
      const newStreak = updatedHistory.length;
      await updateDoc(habitRef, {
        history: updatedHistory,
        streak: newStreak,
      });
      dispatch(updateHabit({ ...habit, history: updatedHistory, streak: newStreak }));
      toast.success("Habit updated!");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this habit?")) return;
    try {
      await deleteDoc(doc(db, "habits", id));
      dispatch(deleteHabit(id));
      toast.success("Habit deleted!");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleEdit = (habit) => {
    setSelectedHabit(habit);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedHabit(null);
  };

  if (!habits || habits.length === 0) { // Handle undefined habits
    return <Typography>No habits added yet.</Typography>;
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Your Habits
      </Typography>
      <List>
        {habits.map((habit) => (
          <ListItem key={habit.id} secondaryAction={
            <>
              <IconButton edge="end" aria-label="edit" onClick={() => handleEdit(habit)}>
                <EditIcon />
              </IconButton>
              <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(habit.id)}>
                <DeleteIcon />
              </IconButton>
            </>
          }>
            <Checkbox
              edge="start"
              checked={habit.history ? habit.history.includes(format(new Date(), "yyyy-MM-dd")) : false}
              tabIndex={-1}
              disableRipple
              onChange={() => handleToggle(habit)}
            />
            <ListItemText
              primary={habit.name}
              secondary={`Streak: ${habit.streak}`}
            />
          </ListItem>
        ))}
      </List>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Edit Habit</DialogTitle>
        {selectedHabit && <EditHabit habit={selectedHabit} onClose={handleClose} />}
      </Dialog>
    </Box>
  );
};

export default HabitList;
