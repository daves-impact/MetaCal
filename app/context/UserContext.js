import { createContext, useState } from "react";

export const UserContext = createContext();

const INITIAL_USER = {
  name: "",
  gender: "",
  age: "",
  height: "",
  currentWeight: "",
  targetWeight: "",
  goal: "",
  activityLevel: null,
  targets: null,
  bmi: null,
  weightHistory: [],
  profileComplete: false,
  streakCount: 0,
  streakLastDateKey: null,
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(INITIAL_USER);

  return (
    <UserContext.Provider value={{ user, setUser, initialUser: INITIAL_USER }}>
      {children}
    </UserContext.Provider>
  );
};
