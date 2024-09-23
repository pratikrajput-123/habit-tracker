// src/components/Habits/AddHabit.js
import React from "react";
import { useForm, Controller } from "react-hook-form";
import { useSelector, useDispatch } from "react-redux";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase";
import { addHabit } from "../../store/slices/habitSlice";
import { TextField, Button, Box, Typography } from "@mui/material";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { toast } from "react-toastify";

const AddHabit = () => {
  const { control, register, handleSubmit, reset, formState: { errors } } = useForm();
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const onSubmit = async (data) => {
    try {
      const docRef = await addDoc(collection(db, "habits"), {
        name: data.name,
        description: data.description || "",
        userId: user.uid,
        createdAt: serverTimestamp(),
        streak: 0,
        history: [],
        date: data.date.toISOString(), // Store date and time as ISO string
      });
      dispatch(addHabit({ id: docRef.id, ...data }));
      toast.success("Habit added successfully!");
      reset();
    } catch (error) {
      toast.error("Failed to add habit: " + error.message);
    }
  };

  return (
    <Box mb={4}>
      <Typography variant="h6" gutterBottom>
        Add New Habit
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
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Controller
            name="date"
            control={control}
            defaultValue={new Date()}
            rules={{ required: "Date and time are required" }}
            render={({ field }) => (
              <DateTimePicker
                label="Select Date & Time"
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    margin="normal"
                    error={!!errors.date}
                    helperText={errors.date ? errors.date.message : ""}
                  />
                )}
                {...field}
              />
            )}
          />
        </LocalizationProvider>
        <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
          Add Habit
        </Button>
      </form>
    </Box>
  );
};

export default AddHabit;
