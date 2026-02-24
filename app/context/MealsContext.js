import { createContext, useContext, useEffect, useState } from "react";
import { collection, deleteDoc, doc, onSnapshot, orderBy, query, setDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import { AuthContext } from "./AuthContext";

export const MealsContext = createContext({
  meals: [],
  addMeal: () => {},
  removeMeal: () => {},
});

const initialMeals = [];

export const MealsProvider = ({ children }) => {
  const [meals, setMeals] = useState(initialMeals);
  const { authUser } = useContext(AuthContext);

  useEffect(() => {
    if (!authUser?.uid) {
      setMeals(initialMeals);
      return;
    }
    const mealsRef = collection(db, "users", authUser.uid, "meals");
    const q = query(mealsRef, orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const nextMeals = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      setMeals(nextMeals);
    });
    return () => unsubscribe();
  }, [authUser]);

  const addMeal = (meal) => {
    const withMeta = {
      ...meal,
      createdAt: meal.createdAt || Date.now(),
    };
    if (authUser?.uid) {
      const ref = doc(db, "users", authUser.uid, "meals", withMeta.id);
      setDoc(ref, withMeta);
    } else {
      setMeals((prev) => [withMeta, ...prev]);
    }
  };

  const removeMeal = (mealId) => {
    if (authUser?.uid) {
      const ref = doc(db, "users", authUser.uid, "meals", mealId);
      deleteDoc(ref);
    }
    setMeals((prev) => prev.filter((meal) => meal.id !== mealId));
  };

  return (
    <MealsContext.Provider value={{ meals, addMeal, removeMeal }}>
      {children}
    </MealsContext.Provider>
  );
};
