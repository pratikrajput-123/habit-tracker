// src/components/Analytics.js
import React from "react";
import { useSelector } from "react-redux";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Box, Typography } from "@mui/material";
import { format, parseISO } from "date-fns";

const Analytics = () => {
  const { habits } = useSelector((state) => state.habits);

  // Handle undefined habits
  if (!habits || habits.length === 0) {
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Habit Analytics
        </Typography>
        <Typography>No data to display.</Typography>
      </Box>
    );
  }

  // Prepare data for chart (e.g., total habits completed per day)
  const dateMap = {};

  habits.forEach(habit => {
    if (Array.isArray(habit.history)) {
      habit.history.forEach(date => {
        if (dateMap[date]) {
          dateMap[date] += 1;
        } else {
          dateMap[date] = 1;
        }
      });
    }
  });

  const data = Object.keys(dateMap).map(date => ({
    date: format(parseISO(date), "MMM dd"),
    habitsCompleted: dateMap[date],
  })).sort((a, b) => new Date(a.date) - new Date(b.date));

  if (data.length === 0) {
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Habit Analytics
        </Typography>
        <Typography>No data to display.</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Habit Analytics
      </Typography>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Line type="monotone" dataKey="habitsCompleted" stroke="#8884d8" activeDot={{ r: 8 }} />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default Analytics;
