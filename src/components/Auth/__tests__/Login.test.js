// src/components/Auth/__tests__/Login.test.js
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import store from "../../../store";
import Login from "../Login";
import { signInWithEmailAndPassword } from "firebase/auth";
import { toast } from "react-toastify";

// Mock toast to prevent actual notifications during tests
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe("Login Component", () => {
  beforeEach(() => {
    signInWithEmailAndPassword.mockClear();
    toast.success.mockClear();
    toast.error.mockClear();
  });

  test("renders login form", () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getByText(/Login/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Login/i })).toBeInTheDocument();
  });

  test("shows validation errors", async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      </Provider>
    );

    fireEvent.click(screen.getByRole("button", { name: /Login/i }));

    expect(await screen.findAllByText(/is required/i)).toHaveLength(2);
  });

  test("successful login", async () => {
    signInWithEmailAndPassword.mockResolvedValue({
      user: { uid: '12345', email: 'test@example.com' },
    });

    render(
      <Provider store={store}>
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      </Provider>
    );

    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByRole("button", { name: /Login/i }));

    await waitFor(() => {
      expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
        expect.any(Object), // auth object
        'test@example.com',
        'password123'
      );
      expect(toast.success).toHaveBeenCalledWith("Logged in successfully!");
    });
  });

  test("failed login", async () => {
    signInWithEmailAndPassword.mockRejectedValue(new Error('Invalid credentials'));

    render(
      <Provider store={store}>
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      </Provider>
    );

    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: 'wrong@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: 'wrongpassword' },
    });

    fireEvent.click(screen.getByRole("button", { name: /Login/i }));

    await waitFor(() => {
      expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
        expect.any(Object), // auth object
        'wrong@example.com',
        'wrongpassword'
      );
      expect(toast.error).toHaveBeenCalledWith('Invalid credentials');
    });
  });
});
