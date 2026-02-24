import { Ionicons } from "@expo/vector-icons";
import { doc, setDoc } from "firebase/firestore";
import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import Svg, { Circle } from "react-native-svg";
import { db } from "../config/firebase";
import { AuthContext } from "../context/AuthContext";
import { MealsContext } from "../context/MealsContext";
import { UserContext } from "../context/UserContext";
import { COLORS } from "../theme/colors";

import { Text } from "../components/MetaText";
const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const SWIPE_ACTION_WIDTH = Dimensions.get("window").width - 32;
const MACRO_PROGRESS_WIDTH = 86;
const MACRO_COLORS = {
  protein: "#4F7BFF",
  carbs: "#F59E0B",
  fat: "#7B8A8E",
};

const formatMacro = (value) => {
  const safe = Number(value ?? 0);
  if (!Number.isFinite(safe)) return "0.00";
  return safe.toFixed(2);
};

const formatDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getWeekDays = (date) => {
  return Array.from({ length: 7 }, (_, index) => {
    const dayDate = new Date(date);
    dayDate.setDate(date.getDate() - (6 - index));
    return {
      label: DAY_LABELS[dayDate.getDay()],
      dateKey: formatDateKey(dayDate),
    };
  });
};

const getPreviousDateKey = (dateKey) => {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() - 1);
  return formatDateKey(date);
};

export default function HomeScreen({ navigation }) {
  const { meals, removeMeal } = useContext(MealsContext);
  const { user, setUser } = useContext(UserContext);
  const { authUser } = useContext(AuthContext);
  const today = new Date();
  const todayKey = formatDateKey(today);
  const [selectedDateKey, setSelectedDateKey] = useState(todayKey);
  const [showCongrats, setShowCongrats] = useState(false);
  const [lastCongratsDateKey, setLastCongratsDateKey] = useState(null);

  const weekDays = getWeekDays(today);

  const mealsForDay = meals.filter((meal) => {
    const mealDateKey = meal?.dateKey ?? todayKey;
    return mealDateKey === selectedDateKey;
  });

  const totals = mealsForDay.reduce(
    (acc, meal) => ({
      calories: acc.calories + (meal?.calories ?? 0),
      protein: acc.protein + (meal?.protein ?? 0),
      carbs: acc.carbs + (meal?.carbs ?? 0),
      fat: acc.fat + (meal?.fat ?? 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );

  const totalCalories = Math.round(totals.calories);
  const totalProtein = totals.protein;
  const totalCarbs = totals.carbs;
  const totalFat = totals.fat;
  const calorieTarget = user?.targets?.calories;
  const proteinGoal = user?.targets?.protein ?? null;
  const carbsGoal = user?.targets?.carbs ?? null;
  const fatGoal = user?.targets?.fat ?? null;
  const goalMet = calorieTarget && totalCalories >= calorieTarget;
  const ringSize = 164;
  const ringStroke = 12;
  const ringRadius = (ringSize - ringStroke) / 2;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringProgress = calorieTarget
    ? Math.min(1, totalCalories / calorieTarget)
    : 0;
  const targetRingOffset = ringCircumference * (1 - ringProgress);
  const animatedRingOffset = useRef(
    new Animated.Value(ringCircumference),
  ).current;
  const proteinProgressAnim = useRef(new Animated.Value(0)).current;
  const carbsProgressAnim = useRef(new Animated.Value(0)).current;
  const fatProgressAnim = useRef(new Animated.Value(0)).current;
  const fabScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(animatedRingOffset, {
      toValue: targetRingOffset,
      duration: 620,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();
  }, [animatedRingOffset, targetRingOffset]);

  useEffect(() => {
    const animations = [
      { anim: proteinProgressAnim, value: proteinGoal ? totalProtein / proteinGoal : 0 },
      { anim: carbsProgressAnim, value: carbsGoal ? totalCarbs / carbsGoal : 0 },
      { anim: fatProgressAnim, value: fatGoal ? totalFat / fatGoal : 0 },
    ];
    Animated.parallel(
      animations.map(({ anim, value }) =>
        Animated.timing(anim, {
          toValue: Math.max(0, Math.min(1, value || 0)),
          duration: 420,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }),
      ),
    ).start();
  }, [
    proteinProgressAnim,
    carbsProgressAnim,
    fatProgressAnim,
    totalProtein,
    totalCarbs,
    totalFat,
    proteinGoal,
    carbsGoal,
    fatGoal,
  ]);

  useEffect(() => {
    const isTodaySelected = selectedDateKey === todayKey;
    if (!isTodaySelected) return;
    if (goalMet && lastCongratsDateKey !== todayKey) {
      setShowCongrats(true);
      setLastCongratsDateKey(todayKey);
    }
  }, [goalMet, selectedDateKey, todayKey, lastCongratsDateKey]);

  const streakInfo = useMemo(() => {
    const mealDays = new Set(meals.map((meal) => meal?.dateKey ?? todayKey));
    const yesterdayKey = getPreviousDateKey(todayKey);
    const hasToday = mealDays.has(todayKey);
    const hasYesterday = mealDays.has(yesterdayKey);

    if (!hasToday && !hasYesterday) {
      return { count: 0, lastDateKey: null };
    }

    let streak = 0;
    let cursor = hasToday ? todayKey : yesterdayKey;
    while (mealDays.has(cursor)) {
      streak += 1;
      cursor = getPreviousDateKey(cursor);
    }
    return { count: streak, lastDateKey: hasToday ? todayKey : yesterdayKey };
  }, [meals, todayKey]);

  const streakCount = streakInfo.count;

  useEffect(() => {
    if (!authUser?.uid) return;
    const prevCount = user?.streakCount ?? null;
    const prevDate = user?.streakLastDateKey ?? null;
    if (prevCount === streakCount && prevDate === streakInfo.lastDateKey) return;
    const payload = {
      streakCount,
      streakLastDateKey: streakInfo.lastDateKey,
      streakUpdatedAt: Date.now(),
    };
    setDoc(doc(db, "users", authUser.uid), payload, { merge: true });
    setUser((prev) => ({ ...prev, ...payload }));
  }, [
    authUser,
    setUser,
    streakCount,
    streakInfo.lastDateKey,
    user?.streakCount,
    user?.streakLastDateKey,
  ]);

  const openMealDetails = (meal) => {
    navigation.navigate("FoodDetails", { food: meal });
  };

  const handleFabPressIn = () => {
    Animated.spring(fabScale, {
      toValue: 0.94,
      speed: 28,
      bounciness: 4,
      useNativeDriver: true,
    }).start();
  };

  const handleFabPressOut = () => {
    Animated.spring(fabScale, {
      toValue: 1,
      speed: 20,
      bounciness: 7,
      useNativeDriver: true,
    }).start();
  };

  const renderRightActions = (progress, dragX) => {
    const contentOpacity = progress.interpolate({
      inputRange: [0, 0.2, 1],
      outputRange: [0, 0.7, 1],
      extrapolate: "clamp",
    });
    const iconTranslateX = dragX.interpolate({
      inputRange: [-180, 0],
      outputRange: [0, 24],
      extrapolate: "clamp",
    });
    return (
      <Animated.View style={styles.deleteActionTrack}>
        <Animated.View
          style={[styles.deleteActionContent, { opacity: contentOpacity }]}
        >
          <Animated.View
            style={{ transform: [{ translateX: iconTranslateX }] }}
          >
            <Ionicons name="trash-outline" size={20} color="#fff" />
          </Animated.View>
          <Text style={styles.deleteText}>Delete</Text>
        </Animated.View>
      </Animated.View>
    );
  };

  return (
    <View style={styles.screen}>
      {showCongrats && (
        <View style={styles.congratsOverlay}>
          <View style={styles.congratsCard}>
            <View style={styles.congratsIcon}>
              <Ionicons name="checkmark" size={26} color="#fff" />
            </View>
            <Text style={styles.congratsTitle}>Goal achieved!</Text>
            <Text style={styles.congratsBody}>
              You hit your daily calorie target. Nice work!
            </Text>
            <TouchableOpacity
              style={styles.congratsButton}
              onPress={() => setShowCongrats(false)}
            >
              <Text style={styles.congratsButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>MetaCal</Text>
          <View style={styles.fireBadge}>
            <Ionicons name="flame" size={18} color={COLORS.primary} />
            <Text style={styles.fireText}>{streakCount}</Text>
          </View>
        </View>

        {/* Weekly Calendar */}
        <View style={styles.weekRow}>
          {weekDays.map((day) => {
            const isSelected = day.dateKey === selectedDateKey;
            return (
              <TouchableOpacity
                key={day.dateKey}
                style={[styles.dayItem, isSelected && styles.activeDay]}
                onPress={() => setSelectedDateKey(day.dateKey)}
              >
                <Text
                  style={[styles.dayText, isSelected && styles.activeDayText]}
                >
                  {day.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Calories Section */}
        <View style={styles.calorieCard}>
          <View style={styles.calorieRingWrap}>
            <Svg width={ringSize} height={ringSize}>
              <Circle
                cx={ringSize / 2}
                cy={ringSize / 2}
                r={ringRadius}
                stroke="#E8EDF3"
                strokeWidth={ringStroke}
                fill="none"
              />
              <AnimatedCircle
                cx={ringSize / 2}
                cy={ringSize / 2}
                r={ringRadius}
                stroke={COLORS.primary}
                strokeWidth={ringStroke}
                fill="none"
                strokeLinecap="round"
                strokeDasharray={ringCircumference}
                strokeDashoffset={animatedRingOffset}
                rotation="-90"
                origin={`${ringSize / 2},${ringSize / 2}`}
              />
            </Svg>
            {/* Inner disc helps the ring read cleaner on light backgrounds. */}
            <View style={styles.calorieRingInnerDisc} />
            <View style={styles.calorieRingContent}>
              {user?.targets?.calories ? (
                <>
                  <Text style={styles.calorieValue}>
                    {Math.max(0, user.targets.calories - totalCalories)}
                  </Text>
                  <Text style={styles.calorieLabel}>Calories remaining</Text>
                  <Text style={styles.targetText}>
                    Target: {user.targets.calories} kcal
                  </Text>
                </>
              ) : (
                <>
                  <Text style={styles.calorieValue}>{totalCalories}</Text>
                  <Text style={styles.calorieLabel}>Calories logged</Text>
                </>
              )}
            </View>
          </View>
        </View>

        {/* Macros Section */}
        <View style={styles.macrosRow}>
          {[
            {
              icon: "barbell-outline",
              label: "Protein",
              value: totalProtein,
              goal: proteinGoal,
              color: MACRO_COLORS.protein,
              progressAnim: proteinProgressAnim,
            },
            {
              icon: "leaf-outline",
              label: "Carbs",
              value: totalCarbs,
              goal: carbsGoal,
              color: MACRO_COLORS.carbs,
              progressAnim: carbsProgressAnim,
            },
            {
              icon: "pizza-outline",
              label: "Fats",
              value: totalFat,
              goal: fatGoal,
              color: MACRO_COLORS.fat,
              progressAnim: fatProgressAnim,
            },
          ].map((m, i) => (
            <View key={i} style={styles.macroCard}>
              <Ionicons name={m.icon} size={25} color={m.color} />
              <View style={styles.macroValueRow}>
                <Text style={[styles.macroValue, { color: m.color }]}>
                  {formatMacro(m.value)}g
                </Text>
                {m.goal ? (
                  <Text style={styles.macroGoalText}>
                    / {formatMacro(m.goal)}g
                  </Text>
                ) : null}
              </View>
              <Text style={styles.macroLabel}>{m.label}</Text>
              {m.goal ? (
                <View style={styles.macroProgressTrack}>
                  {/* Scale animation keeps the progress fill smooth and lightweight. */}
                  <Animated.View
                    style={[
                      styles.macroProgressFill,
                      {
                        width: m.progressAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, MACRO_PROGRESS_WIDTH],
                        }),
                        backgroundColor: m.color,
                      },
                    ]}
                  />
                </View>
              ) : null}
            </View>
          ))}
        </View>

        {/* Recently Uploaded */}
        <Text style={styles.recentTitle}>Recently uploaded</Text>
        {mealsForDay.length === 0 ? (
          <View style={styles.placeholderCard}>
            <Text style={styles.placeholderText}>
              Tap + to add your first meal of the day
            </Text>
          </View>
        ) : (
          <View style={styles.mealsList}>
            {mealsForDay.map((meal) => (
              <Swipeable
                key={meal.id}
                renderRightActions={(progress, dragX) =>
                  renderRightActions(progress, dragX)
                }
                overshootRight={false}
                friction={1.1}
                rightThreshold={92}
                onSwipeableRightOpen={() => removeMeal(meal.id)}
              >
                <View style={styles.mealCard}>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => openMealDetails(meal)}
                  >
                    <View style={styles.mealHeader}>
                      <View style={styles.mealNameRow}>
                        <Text style={styles.mealName}>{meal.name}</Text>
                        {meal.dataConfidence === "proxy" ? (
                          <View style={styles.estimatedBadge}>
                            <Text style={styles.estimatedBadgeText}>
                              Estimated
                            </Text>
                          </View>
                        ) : null}
                      </View>
                      <View style={styles.timePill}>
                        <Text style={styles.timeText}>{meal.timeLabel}</Text>
                      </View>
                    </View>

                    <View style={styles.mealCaloriesRow}>
                      <Ionicons name="flame" size={16} color="#FF7A00" />
                      <Text style={styles.mealCaloriesText}>
                        {Math.round(meal.calories ?? 0)} calories
                      </Text>
                    </View>

                    <View style={styles.macroRow}>
                      <View style={styles.macroItem}>
                        <Ionicons
                          name="barbell-outline"
                          size={14}
                          color={MACRO_COLORS.protein}
                        />
                        <Text style={styles.macroText}>
                          {formatMacro(meal.protein)}g
                        </Text>
                      </View>
                      <View style={styles.macroItem}>
                        <Ionicons
                          name="leaf-outline"
                          size={14}
                          color={MACRO_COLORS.carbs}
                        />
                        <Text style={styles.macroText}>
                          {formatMacro(meal.carbs)}g
                        </Text>
                      </View>
                      <View style={styles.macroItem}>
                        <Ionicons
                          name="pizza-outline"
                          size={14}
                          color={MACRO_COLORS.fat}
                        />
                        <Text style={styles.macroText}>
                          {formatMacro(meal.fat)}g
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                </View>
              </Swipeable>
            ))}
          </View>
        )}
      </ScrollView>
      <Animated.View style={[styles.addButtonWrap, { transform: [{ scale: fabScale }] }]}>
        <TouchableOpacity
          style={styles.addButton}
          onPressIn={handleFabPressIn}
          onPressOut={handleFabPressOut}
          onPress={() => navigation.navigate("LogFood")}
          activeOpacity={0.95}
        >
          <View style={styles.addButtonGradientOverlay} />
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 128,
  },
  header: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
    position: "relative",
  },
  logo: {
    fontSize: 30,
    fontWeight: "800",
    letterSpacing: 0.4,
    color: "#111",
    textAlign: "center",
  },
  fireBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EDF8EE",
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 999,
    position: "absolute",
    right: 0,
    shadowColor: "#0F172A",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  fireText: { marginLeft: 4, fontWeight: "600", color: COLORS.primaryDark },
  weekRow: {
    marginTop: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  dayItem: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: "#F2F4F7",
    borderWidth: 1,
    borderColor: "#EBEEF2",
    alignItems: "center",
  },
  activeDay: {
    backgroundColor: "#EAF8E8",
    borderColor: "#D4EFCF",
    shadowColor: "#16A34A",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  dayText: { fontWeight: "600", color: "#8A94A6" },
  activeDayText: { color: "#146A32", fontWeight: "700" },
  calorieCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 20,
    marginTop: 24,
    shadowColor: "#0F172A",
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
    alignItems: "center",
  },
  calorieRingWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  calorieRingInnerDisc: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F1F5F9",
    shadowColor: "#0F172A",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  calorieRingContent: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  calorieValue: {
    fontSize: 36,
    fontWeight: "700",
    color: "#0F172A",
    textAlign: "center",
  },
  calorieLabel: { color: "#94A3B8", textAlign: "center" },
  targetText: {
    marginTop: 8,
    fontSize: 12,
    color: "#94A3B8",
    textAlign: "center",
  },
  macrosRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
    gap: 12,
  },
  macroCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 16,
    alignItems: "center",
    shadowColor: "#0F172A",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  macroValueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "center",
    marginTop: 8,
    gap: 2,
  },
  macroValue: {
    fontWeight: "700",
    fontSize: 14,
    textAlign: "center",
  },
  macroGoalText: {
    color: "#6B7280",
    fontSize: 10,
    fontWeight: "600",
  },
  macroLabel: { color: "#777", fontSize: 12, marginTop: 2 },
  macroProgressTrack: {
    width: MACRO_PROGRESS_WIDTH,
    height: 6,
    borderRadius: 999,
    backgroundColor: "#E9EDF3",
    marginTop: 10,
    overflow: "hidden",
    alignSelf: "center",
  },
  macroProgressFill: {
    height: "100%",
    borderRadius: 999,
  },
  recentTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 32,
    textAlign: "center",
    alignSelf: "center",
    color: "#111827",
  },
  placeholderCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 18,
    padding: 20,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#EAEFF5",
  },
  placeholderText: { color: "#94A3B8" },
  mealsList: {
    marginTop: 12,
  },
  mealCard: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: "#EAEFF5",
    borderRadius: 18,
    padding: 20,
    marginBottom: 14,
    shadowColor: "#0F172A",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  mealHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  mealName: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
    textAlign: "left",
  },
  mealNameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 8,
    flex: 1,
    paddingRight: 10,
  },
  estimatedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  estimatedBadgeText: {
    fontSize: 9,
    color: "#64748B",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  timePill: {
    backgroundColor: "#EAF8E8",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  timeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#166534",
  },
  mealCaloriesRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },
  mealCaloriesText: {
    marginLeft: 6,
    fontSize: 14,
    color: "#334155",
    fontWeight: "600",
    textAlign: "left",
  },
  macroRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 14,
  },
  macroItem: {
    flexDirection: "row",
    alignItems: "center",
    minWidth: 72,
  },
  macroText: {
    fontSize: 12,
    color: "#475569",
    fontWeight: "600",
    marginLeft: 6,
  },
  deleteActionTrack: {
    width: SWIPE_ACTION_WIDTH,
    backgroundColor: "#EF4444",
    justifyContent: "center",
    alignItems: "flex-end",
    marginBottom: 12,
    borderRadius: 18,
    overflow: "hidden",
  },
  deleteActionContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    width: "100%",
    height: "100%",
  },
  deleteText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
  },
  congratsOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 20,
    padding: 24,
  },
  congratsCard: {
    width: "100%",
    maxWidth: 320,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  congratsIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  congratsTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 6,
    color: "#111",
  },
  congratsBody: {
    fontSize: 13,
    textAlign: "center",
    color: "#6B7280",
    marginBottom: 16,
  },
  congratsButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  congratsButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  addButtonWrap: {
    position: "absolute",
    bottom: 24,
    right: 16,
    zIndex: 10,
  },
  addButton: {
    backgroundColor: "#4EA53A",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    shadowColor: "#166534",
    shadowOpacity: 0.28,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },
  addButtonGradientOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "52%",
    backgroundColor: "rgba(255,255,255,0.14)",
  },
});
