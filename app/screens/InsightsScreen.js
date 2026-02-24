import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Circle, Line } from "react-native-svg";
import { COLORS } from "../theme/colors";
import { MealsContext } from "../context/MealsContext";
import { UserContext } from "../context/UserContext";
import { bmiCategory, computeBmi } from "../utils/health";
import { useAppAlert } from "../context/AlertContext";

import { Text, TextInput } from "../components/MetaText";
const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const WEEK_TABS = ["Weekly", "Monthly"];
const BMI_SEGMENTS = [
  { min: 14, max: 16, color: "#3B82F6" },
  { min: 16, max: 17, color: "#60A5FA" },
  { min: 17, max: 18.5, color: "#93C5FD" },
  { min: 18.5, max: 25, color: COLORS.primary },
  { min: 25, max: 30, color: "#F59E0B" },
  { min: 30, max: 35, color: "#F97316" },
  { min: 35, max: 40, color: "#EF4444" },
  { min: 40, max: 45, color: "#B91C1C" },
];

const formatDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatDateLabel = (date) => {
  const month = MONTHS[date.getMonth()];
  const day = date.getDate();
  return `${month} ${day}`;
};

const formatMonthLabel = (date) => {
  const month = MONTHS[date.getMonth()];
  return `${month} ${date.getFullYear()}`;
};

const formatMonthKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};

const getWeekDates = (offsetDays) => {
  const endDate = new Date();
  endDate.setDate(endDate.getDate() - offsetDays);
  const startDate = new Date(endDate);
  startDate.setDate(endDate.getDate() - 6);
  const days = Array.from({ length: 7 }, (_, index) => {
    const dayDate = new Date(startDate);
    dayDate.setDate(startDate.getDate() + index);
    return dayDate;
  });
  return { startDate, endDate, days };
};

const getMonthDates = (offsetMonths) => {
  const endMonth = new Date();
  endMonth.setDate(1);
  endMonth.setMonth(endMonth.getMonth() - offsetMonths);
  const startMonth = new Date(endMonth);
  startMonth.setMonth(endMonth.getMonth() - 11);

  const months = Array.from({ length: 12 }, (_, index) => {
    const monthDate = new Date(startMonth);
    monthDate.setMonth(startMonth.getMonth() + index);
    return monthDate;
  });

  const startDate = new Date(startMonth.getFullYear(), startMonth.getMonth(), 1);
  const endDate = new Date(endMonth.getFullYear(), endMonth.getMonth() + 1, 0);

  return { startDate, endDate, months };
};

export default function InsightsScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState("Weekly");
  const [weekOffset, setWeekOffset] = useState(0);
  const [monthOffset, setMonthOffset] = useState(0);
  const [menuVisible, setMenuVisible] = useState(false);
  const { meals } = React.useContext(MealsContext);
  const { user } = React.useContext(UserContext);
  const { showAlert } = useAppAlert();

  const isMonthly = activeTab === "Monthly";
  const { startDate, endDate, days, months } = useMemo(
    () => (isMonthly ? getMonthDates(monthOffset) : getWeekDates(weekOffset)),
    [isMonthly, monthOffset, weekOffset],
  );

  const weekLabel = isMonthly
    ? `${formatMonthLabel(startDate)} - ${formatMonthLabel(endDate)}`
    : `${formatDateLabel(startDate)} - ${formatDateLabel(endDate)}, ${endDate.getFullYear()}`;

  const periodDates = isMonthly ? months : days;
  const periodKeys = useMemo(
    () =>
      periodDates.map((date) =>
        isMonthly ? formatMonthKey(date) : formatDateKey(date),
      ),
    [periodDates, isMonthly],
  );
  const dayLabels = periodDates.map((date) =>
    isMonthly ? MONTHS[date.getMonth()] : `${date.getDate()}`,
  );
  const currentDayIndex =
    isMonthly
      ? monthOffset === 0
        ? periodDates.length - 1
        : -1
      : weekOffset === 0
        ? periodDates.length - 1
        : -1;

  const mealsByDate = useMemo(() => {
    return meals.reduce((acc, meal) => {
      const key = meal?.dateKey;
      if (!key) return acc;
      if (!acc[key]) {
        acc[key] = { calories: 0, protein: 0, carbs: 0, fat: 0 };
      }
      acc[key].calories += meal?.calories ?? 0;
      acc[key].protein += meal?.protein ?? 0;
      acc[key].carbs += meal?.carbs ?? 0;
      acc[key].fat += meal?.fat ?? 0;
      return acc;
    }, {});
  }, [meals]);

  const mealsByMonth = useMemo(() => {
    return meals.reduce((acc, meal) => {
      const key = meal?.dateKey;
      if (!key) return acc;
      const [year, month] = key.split("-").map(Number);
      const monthKey = `${year}-${String(month).padStart(2, "0")}`;
      if (!acc[monthKey]) {
        acc[monthKey] = { calories: 0, protein: 0, carbs: 0, fat: 0 };
      }
      acc[monthKey].calories += meal?.calories ?? 0;
      acc[monthKey].protein += meal?.protein ?? 0;
      acc[monthKey].carbs += meal?.carbs ?? 0;
      acc[monthKey].fat += meal?.fat ?? 0;
      return acc;
    }, {});
  }, [meals]);

  const calorieData = periodKeys.map((key) =>
    Math.round(
      (isMonthly ? mealsByMonth[key]?.calories : mealsByDate[key]?.calories) ??
        0,
    ),
  );

  const nutritionData = periodKeys.map((key) => {
    const totals = isMonthly
      ? mealsByMonth[key] || { protein: 0, carbs: 0, fat: 0 }
      : mealsByDate[key] || { protein: 0, carbs: 0, fat: 0 };
    const sum = totals.protein + totals.carbs + totals.fat;
    if (!sum) return { carbs: 0, protein: 0, fat: 0 };
    return {
      carbs: Math.round((totals.carbs / sum) * 100),
      protein: Math.round((totals.protein / sum) * 100),
      fat: Math.round((totals.fat / sum) * 100),
    };
  });

  const weightHistory = user?.weightHistory || [];
  const weightEntries = useMemo(
    () =>
      weightHistory
        .filter((entry) => entry?.dateKey && entry?.weight != null)
        .map((entry) => {
          const [year, month, day] = entry.dateKey.split("-").map(Number);
          return {
            dateKey: entry.dateKey,
            weight: Number(entry.weight),
            ts: new Date(year, month - 1, day).getTime(),
          };
        })
        .sort((a, b) => a.ts - b.ts),
    [weightHistory],
  );
  const getLatestWeight = (timestamp) => {
    let latest = null;
    for (const entry of weightEntries) {
      if (entry.ts <= timestamp) {
        latest = entry.weight;
      } else {
        break;
      }
    }
    return latest;
  };
  const weightDataRaw = periodDates.map((date) => {
    const targetDate = isMonthly
      ? new Date(date.getFullYear(), date.getMonth() + 1, 0)
      : date;
    return getLatestWeight(targetDate.getTime());
  });
  const firstPeriodDate = periodDates[0];
  const firstPeriodTimestamp = firstPeriodDate
    ? new Date(
        firstPeriodDate.getFullYear(),
        firstPeriodDate.getMonth(),
        firstPeriodDate.getDate() - 1,
      ).getTime()
    : Date.now();
  const seedWeight = getLatestWeight(firstPeriodTimestamp);
  const weightData = useMemo(() => {
    const filled = [];
    let last = seedWeight ?? null;
    weightDataRaw.forEach((value) => {
      if (value != null) {
        last = value;
      }
      filled.push(last);
    });
    return filled;
  }, [weightDataRaw, seedWeight]);

  const bmiValue =
    user?.bmi ?? computeBmi(user?.currentWeight, user?.height);
  const bmiInfo = bmiCategory(bmiValue);
  const bmiMin = 14;
  const bmiMax = 45;
  const bmiClamped = Math.min(
    bmiMax,
    Math.max(bmiMin, bmiValue ?? bmiMin),
  );
  const bmiStart = 0;
  const bmiTotalAngle = 360;
  const bmiSvgSize = 240;
  const bmiCenter = bmiSvgSize / 2;
  const bmiRingRadius = 92;
  const bmiRingWidth = 16;
  const bmiInnerRadius = 72;
  const bmiNeedleLength = bmiRingRadius - 14;
  const bmiRingCircumference = 2 * Math.PI * bmiRingRadius;
  const bmiGapLength = 6;
  const bmiGapAngle = (bmiGapLength / bmiRingCircumference) * bmiTotalAngle;
  const bmiSegmentAngle =
    (bmiTotalAngle - bmiGapAngle * BMI_SEGMENTS.length) /
    BMI_SEGMENTS.length;
  const bmiSegmentLength =
    (bmiSegmentAngle / bmiTotalAngle) * bmiRingCircumference;
  const bmiSegments = useMemo(() => {
    let offset = 0;
    return BMI_SEGMENTS.map((segment) => {
      const dasharray = `${bmiSegmentLength} ${
        bmiRingCircumference - bmiSegmentLength
      }`;
      const dashoffset = -offset;
      offset += bmiSegmentLength + bmiGapLength;
      return { ...segment, dasharray, dashoffset };
    });
  }, [bmiRingCircumference, bmiSegmentLength, bmiGapLength]);
  const bmiAngle = useMemo(() => {
    let angle = bmiStart;
    const value = bmiClamped ?? bmiMin;
    for (const segment of BMI_SEGMENTS) {
      const segmentRange = segment.max - segment.min;
      if (value <= segment.min) {
        return angle;
      }
      if (value >= segment.max) {
        angle += bmiSegmentAngle + bmiGapAngle;
        continue;
      }
      const fraction = (value - segment.min) / segmentRange;
      return angle + fraction * bmiSegmentAngle;
    }
    return bmiStart + bmiTotalAngle;
  }, [
    bmiClamped,
    bmiMin,
    bmiStart,
    bmiSegmentAngle,
    bmiGapAngle,
  ]);

  const calorieTarget = user?.targets?.calories || 0;
  const calorieMaxRaw = Math.max(calorieTarget, ...calorieData, 1);
  const calorieMax = Math.ceil(calorieMaxRaw / 500) * 500;

  const weightValues = weightData.filter((val) => val > 0);
  const weightMin = weightValues.length
    ? Math.min(...weightValues) - 2
    : 0;
  const weightMax = weightValues.length
    ? Math.max(...weightValues) + 2
    : 100;

  const calorieYAxis = useMemo(() => {
    const step = calorieMax / 6;
    return Array.from({ length: 6 }, (_, i) =>
      Math.round(calorieMax - step * i),
    );
  }, [calorieMax]);

  const weightYAxis = useMemo(() => {
    const step = (weightMax - weightMin) / 4;
    return Array.from({ length: 5 }, (_, i) =>
      Math.round(weightMax - step * i),
    );
  }, [weightMax, weightMin]);

  const handlePrevWeek = () => {
    if (isMonthly) {
      setMonthOffset((prev) => prev + 12);
      return;
    }
    setWeekOffset((prev) => prev + 7);
  };
  const handleNextWeek = () => {
    if (isMonthly) {
      setMonthOffset((prev) => Math.max(0, prev - 12));
      return;
    }
    setWeekOffset((prev) => Math.max(0, prev - 7));
  };
  const handleResetFilters = () => {
    setActiveTab("Weekly");
    setWeekOffset(0);
    setMonthOffset(0);
    setMenuVisible(false);
  };
  const handleEditGoals = () => {
    setMenuVisible(false);
    const parent = navigation?.getParent?.();
    if (parent?.navigate) {
      parent.navigate("PersonalDetails");
      return;
    }
    navigation?.navigate?.("PersonalDetails");
  };
  const handleExport = () => {
    setMenuVisible(false);
    showAlert("Export", "Exporting data will be available soon.");
  };

  return (
    <>
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Ionicons name="flame" size={18} color={COLORS.primary} />
        </View>
        <Text style={styles.headerTitle}>Insights</Text>
        <TouchableOpacity
          style={styles.headerIcon}
          onPress={() => setMenuVisible(true)}
        >
          <Ionicons name="ellipsis-vertical" size={18} color="#111827" />
        </TouchableOpacity>
      </View>

      <View style={styles.tabs}>
        {WEEK_TABS.map((tab) => {
          const isActive = tab === activeTab;
          return (
            <TouchableOpacity
              key={tab}
              style={[styles.tabItem, isActive && styles.tabItemActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                {tab}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.weekRow}>
        <TouchableOpacity
          style={styles.weekNavButton}
          onPress={handlePrevWeek}
        >
          <Ionicons name="chevron-back" size={18} color="#6B7280" />
        </TouchableOpacity>
        <Text style={styles.weekLabel}>{weekLabel}</Text>
        <TouchableOpacity
          style={[
            styles.weekNavButton,
            (isMonthly ? monthOffset === 0 : weekOffset === 0) &&
              styles.weekNavDisabled,
          ]}
          onPress={handleNextWeek}
          disabled={isMonthly ? monthOffset === 0 : weekOffset === 0}
        >
          <Ionicons name="chevron-forward" size={18} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Calorie (kcal)</Text>
        </View>

        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: COLORS.primary }]} />
            <Text style={styles.legendText}>Selected</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={styles.legendLine} />
            <Text style={styles.legendText}>Calorie Intake Goal</Text>
          </View>
        </View>

        <View style={styles.chartRow}>
          <View style={styles.yAxis}>
            {calorieYAxis.map((label) => (
              <Text key={label} style={styles.yAxisLabel}>
                {label}
              </Text>
            ))}
          </View>
          <View style={styles.bars}>
            {calorieTarget ? (
              <View
                style={[
                  styles.goalLine,
                  {
                    bottom: Math.min(
                      150,
                      Math.max(0, (calorieTarget / calorieMax) * 150),
                    ),
                  },
                ]}
              />
            ) : null}
            {calorieData.map((value, index) => {
              const height = Math.max(12, (value / calorieMax) * 150);
              const isSelected = index === currentDayIndex;
              return (
                <View key={`${value}-${index}`} style={styles.barItem}>
                  {isSelected ? (
                    <View style={styles.valueBubble}>
                      <Text style={styles.valueBubbleText}>{value}</Text>
                    </View>
                  ) : null}
                  <View
                    style={[
                      styles.bar,
                      { height },
                      isSelected && styles.barSelected,
                      currentDayIndex >= 0 && !isSelected && styles.barDimmed,
                    ]}
                  />
                  <Text style={styles.barLabel}>{dayLabels[index]}</Text>
                </View>
              );
            })}
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Nutrition (%)</Text>
          <View style={styles.legendPills}>
            <View style={styles.legendPill}>
              <View style={[styles.legendDot, { backgroundColor: "#F97316" }]} />
              <Text style={styles.legendText}>Carbs</Text>
            </View>
            <View style={styles.legendPill}>
              <View style={[styles.legendDot, { backgroundColor: "#3B82F6" }]} />
              <Text style={styles.legendText}>Protein</Text>
            </View>
            <View style={styles.legendPill}>
              <View style={[styles.legendDot, { backgroundColor: "#94A3B8" }]} />
              <Text style={styles.legendText}>Fat</Text>
            </View>
          </View>
        </View>

        <View style={styles.stackBars}>
          {nutritionData.map((item, index) => {
            const carbsHeight = (item.carbs / 100) * 120;
            const proteinHeight = (item.protein / 100) * 120;
            const fatHeight = (item.fat / 100) * 120;
            const isSelected = index === currentDayIndex;
            return (
              <View
                key={`stack-${index}`}
                style={[
                  styles.stackItem,
                  currentDayIndex >= 0 && !isSelected && styles.stackDimmed,
                ]}
              >
                <View style={[styles.stackBar, isSelected && styles.stackActive]}>
                  <View
                    style={[
                      styles.stackSegment,
                      { height: fatHeight, backgroundColor: "#94A3B8" },
                    ]}
                  />
                  <View
                    style={[
                      styles.stackSegment,
                      { height: proteinHeight, backgroundColor: "#3B82F6" },
                    ]}
                  />
                  <View
                    style={[
                      styles.stackSegment,
                      { height: carbsHeight, backgroundColor: "#F97316" },
                    ]}
                  />
                </View>
                <Text style={styles.barLabel}>{dayLabels[index]}</Text>
              </View>
            );
          })}
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Weight (kg)</Text>
        </View>

        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: "#FB923C" }]} />
            <Text style={styles.legendText}>Selected</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendLine, { borderColor: "#FDBA74" }]} />
            <Text style={styles.legendText}>Weight Goal</Text>
          </View>
        </View>

        <View style={styles.chartRow}>
          <View style={styles.yAxis}>
            {weightYAxis.map((label) => (
              <Text key={label} style={styles.yAxisLabel}>
                {label}
              </Text>
            ))}
          </View>
          <View style={styles.bars}>
            {user?.targetWeight ? (
              <View
                style={[
                  styles.goalLine,
                  styles.goalLineOrange,
                  {
                    bottom: Math.min(
                      150,
                      Math.max(
                        0,
                        ((Number(user.targetWeight) - weightMin) /
                          (weightMax - weightMin)) *
                          150,
                      ),
                    ),
                  },
                ]}
              />
            ) : null}
            {weightData.map((value, index) => {
              const safeValue = value ?? weightMin;
              const height =
                ((safeValue - weightMin) / (weightMax - weightMin || 1)) * 150;
              const isSelected = index === currentDayIndex;
              return (
                <View key={`${value}-${index}`} style={styles.barItem}>
                  {isSelected ? (
                    <View style={[styles.valueBubble, styles.valueBubbleOrange]}>
                      <Text style={styles.valueBubbleText}>
                        {value == null ? "--" : value}
                      </Text>
                    </View>
                  ) : null}
                  <View
                    style={[
                      styles.bar,
                      { height, backgroundColor: "#FDBA74" },
                      isSelected && styles.barSelectedOrange,
                      currentDayIndex >= 0 && !isSelected && styles.barDimmed,
                    ]}
                  />
                  <Text style={styles.barLabel}>{dayLabels[index]}</Text>
                </View>
              );
            })}
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>BMI (kg/m2)</Text>
          <View style={[styles.badge, { backgroundColor: `${bmiInfo.color}22` }]}>
            <Text style={[styles.badgeText, { color: bmiInfo.color }]}>
              {bmiInfo.label}
            </Text>
          </View>
        </View>

        <View style={styles.bmiGauge}>
          <Svg width={bmiSvgSize} height={bmiSvgSize}>
            <Circle
              cx={bmiCenter}
              cy={bmiCenter}
              r={bmiRingRadius}
              stroke="#111827"
              strokeWidth={bmiRingWidth}
            />
            <Circle
              cx={bmiCenter}
              cy={bmiCenter}
              r={bmiRingRadius}
              stroke="#111827"
              strokeWidth={bmiRingWidth}
            />
            {bmiSegments.map((segment) => (
              <Circle
                key={`${segment.min}-${segment.max}`}
                cx={bmiCenter}
                cy={bmiCenter}
                r={bmiRingRadius}
                stroke={segment.color}
                strokeWidth={bmiRingWidth}
                strokeDasharray={segment.dasharray}
                strokeDashoffset={segment.dashoffset}
                strokeLinecap="round"
                rotation="-90"
                origin={`${bmiCenter},${bmiCenter}`}
              />
            ))}
            <Circle cx={bmiCenter} cy={bmiCenter} r={bmiInnerRadius} fill="#FFFFFF" />
            <Line
              x1={bmiCenter}
              y1={bmiCenter}
              x2={bmiCenter}
              y2={bmiCenter - bmiNeedleLength}
              stroke={bmiInfo.color}
              strokeWidth="4"
              strokeLinecap="round"
              rotation={bmiAngle}
              origin={`${bmiCenter},${bmiCenter}`}
            />
            <Circle cx={bmiCenter} cy={bmiCenter} r="8" fill={bmiInfo.color} />
          </Svg>
          <View style={styles.bmiValue}>
            <Text style={styles.bmiNumber}>
              {bmiValue != null ? bmiValue : "—"}
            </Text>
            <Text style={styles.bmiLabel}>BMI (kg/m2)</Text>
          </View>
        </View>

        <View style={styles.bmiLegend}>
          {[
            { label: "Very severely underweight", value: "BMI < 16.0", color: "#3B82F6" },
            { label: "Severely underweight", value: "BMI 16.0 - 16.9", color: "#60A5FA" },
            { label: "Underweight", value: "BMI 17.0 - 18.4", color: "#93C5FD" },
            { label: "Normal", value: "BMI 18.5 - 24.9", color: COLORS.primary },
            { label: "Overweight", value: "BMI 25.0 - 29.9", color: "#F59E0B" },
            { label: "Obese Class I", value: "BMI 30.0 - 34.9", color: "#F97316" },
            { label: "Obese Class II", value: "BMI 35.0 - 39.9", color: "#EF4444" },
            { label: "Obese Class III", value: "BMI >= 40.0", color: "#B91C1C" },
          ].map((item) => (
            <View key={item.label} style={styles.bmiLegendRow}>
              <View style={[styles.legendDot, { backgroundColor: item.color }]} />
              <Text style={styles.bmiLegendLabel}>{item.label}</Text>
              <Text style={styles.bmiLegendValue}>{item.value}</Text>
            </View>
          ))}
        </View>
      </View>
      </ScrollView>
      <Modal
        transparent
        visible={menuVisible}
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable
          style={styles.menuOverlay}
          onPress={() => setMenuVisible(false)}
        >
          <Pressable style={styles.menuCard} onPress={() => {}}>
            <TouchableOpacity style={styles.menuItem} onPress={handleEditGoals}>
              <Ionicons name="settings-outline" size={18} color="#111827" />
              <Text style={styles.menuText}>Edit goals</Text>
            </TouchableOpacity>
            <View style={styles.menuDivider} />
            <TouchableOpacity style={styles.menuItem} onPress={handleExport}>
              <Ionicons name="download-outline" size={18} color="#111827" />
              <Text style={styles.menuText}>Export data (CSV/PDF)</Text>
            </TouchableOpacity>
            <View style={styles.menuDivider} />
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleResetFilters}
            >
              <Ionicons name="refresh-outline" size={18} color="#111827" />
              <Text style={styles.menuText}>Reset to current week</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 16,
    paddingBottom: 120,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
  },
  tabs: {
    flexDirection: "row",
    backgroundColor: "#EAF4E7",
    borderRadius: 12,
    padding: 4,
    marginBottom: 14,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
    borderRadius: 10,
  },
  tabItemActive: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: 12,
    color: COLORS.muted,
    fontWeight: "600",
  },
  tabTextActive: {
    color: "#FFFFFF",
  },
  weekRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  weekNavButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  weekNavDisabled: {
    opacity: 0.4,
  },
  weekLabel: {
    fontSize: 13,
    color: COLORS.text,
    fontWeight: "600",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.text,
  },
  toggleGroup: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
    padding: 2,
  },
  toggleIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  toggleIconActive: {
    backgroundColor: "#FFFFFF",
  },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  legendLine: {
    width: 20,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: COLORS.primary,
    marginRight: 6,
  },
  legendText: {
    fontSize: 11,
    color: "#6B7280",
    fontWeight: "500",
  },
  chartRow: {
    flexDirection: "row",
  },
  yAxis: {
    width: 40,
    justifyContent: "space-between",
    paddingBottom: 12,
  },
  yAxisLabel: {
    fontSize: 10,
    color: "#9CA3AF",
  },
  bars: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 170,
    paddingHorizontal: 6,
    position: "relative",
  },
  barItem: {
    alignItems: "center",
    justifyContent: "flex-end",
  },
  bar: {
    width: 18,
    borderRadius: 9,
    backgroundColor: "#DFF2D8",
  },
  goalLine: {
    position: "absolute",
    left: 0,
    right: 0,
    borderTopWidth: 1.5,
    borderStyle: "dashed",
    borderColor: COLORS.primary,
  },
  goalLineOrange: {
    borderColor: "#FDBA74",
  },
  barSelected: {
    backgroundColor: COLORS.primary,
  },
  barSelectedOrange: {
    backgroundColor: "#FB923C",
  },
  barDimmed: {
    opacity: 0.35,
  },
  barLabel: {
    fontSize: 10,
    color: "#9CA3AF",
    marginTop: 6,
  },
  valueBubble: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 6,
  },
  valueBubbleOrange: {
    backgroundColor: "#FB923C",
  },
  valueBubbleText: {
    fontSize: 10,
    color: "#111827",
    fontWeight: "700",
  },
  legendPills: {
    flexDirection: "row",
    alignItems: "center",
  },
  legendPill: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 10,
  },
  stackBars: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: 6,
  },
  stackItem: {
    alignItems: "center",
  },
  stackDimmed: {
    opacity: 0.35,
  },
  stackBar: {
    width: 18,
    height: 120,
    borderRadius: 9,
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  stackActive: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  stackSegment: {
    width: "100%",
  },
  badge: {
    backgroundColor: COLORS.primarySoft,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 10,
    color: COLORS.primaryDark,
    fontWeight: "700",
  },
  bmiGauge: {
    alignItems: "center",
    justifyContent: "center",
  },
  bmiValue: {
    position: "absolute",
    alignItems: "center",
    width: "100%",
    top: 126,
  },
  bmiNumber: {
    fontSize: 26,
    fontWeight: "800",
    color: "#111827",
  },
  bmiLabel: {
    fontSize: 11,
    color: "#6B7280",
  },
  bmiLegend: {
    marginTop: 16,
  },
  bmiLegendRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  bmiLegendLabel: {
    flex: 1,
    fontSize: 11,
    color: "#374151",
    marginLeft: 6,
  },
  bmiLegendValue: {
    fontSize: 10,
    color: "#9CA3AF",
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.25)",
    justifyContent: "flex-start",
    alignItems: "flex-end",
    paddingTop: 70,
    paddingRight: 20,
  },
  menuCard: {
    width: 220,
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  menuText: {
    marginLeft: 10,
    fontSize: 13,
    color: "#111827",
    fontWeight: "600",
  },
  menuDivider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginHorizontal: 10,
  },
});
