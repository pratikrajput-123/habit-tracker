// src/components/Habits/EditHabit.js
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useSelector, useDispatch } from "react-redux";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { updateHabit } from "../../store/slices/habitSlice";
import { TextField, Button, Box, Typography } from "@mui/material";
import { toast } from "react-toastify";

const EditHabit = ({ habit, onClose }) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      name: habit.name,
      description: habit.description,
    },
  });
  const dispatch = useDispatch();

  useEffect(() => {
    reset({
      name: habit.name,
      description: habit.description,
    });
  }, [habit, reset]);

  const onSubmit = async (data) => {
    try {
      const habitRef = doc(db, "habits", habit.id);
      await updateDoc(habitRef, data);
      dispatch(updateHabit({ id: habit.id, ...data }));
      toast.success("Habit updated successfully!");
      onClose();
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <Box mb={4}>
      <Typography variant="h6" gutterBottom>
        Edit Habit
      </Typography>
      <form onSubmit={handleSubmit(onSubmit)}>
        <TextField
          label="Habit Name"
          fullWidth
          margin="normal"
          {...register("name", { required: "Habit name is required" })}
          error={!!errors.name}
          helperText={errors.name?.message}
        />
        <TextField
          label="Description"
          fullWidth
          margin="normal"
          {...register("description")}
        />
        <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
          Update Habit
        </Button>
      </form>
    </Box>
  );
};

export default EditHabit;
