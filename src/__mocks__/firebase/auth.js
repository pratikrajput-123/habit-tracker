// src/__mocks__/firebase/auth.js
export const signInWithEmailAndPassword = jest.fn(() => Promise.resolve({
    user: {
      uid: '12345',
      email: 'test@example.com',
    },
  }));
  
  export const createUserWithEmailAndPassword = jest.fn(() => Promise.resolve({
    user: {
      uid: '12345',
      email: 'test@example.com',
    },
  }));
  
  // Add other Firebase Auth methods if needed
  