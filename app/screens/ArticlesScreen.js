import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { COLORS } from "../theme/colors";

import { Text } from "../components/MetaText";
const ARTICLE_SECTIONS = [
  {
    id: "nutrition",
    title: "Calorie & Nutrition",
    items: [
      {
        id: "macro-101",
        title: "Macronutrients 101",
        subtitle: "Carbs, Protein, & Fats",
        summary: "Learn how each macro fuels your body and how to balance them.",
        icon: "nutrition",
        accent: "#FDE68A",
      },
      {
        id: "calorie-basics",
        title: "Understanding Calories",
        subtitle: "Fuel your day wisely",
        summary: "Break down daily energy needs and build smarter portions.",
        icon: "flame",
        accent: "#BBF7D0",
      },
      {
        id: "nutrient-dense",
        title: "Nutrient-Dense Foods",
        subtitle: "What are they?",
        summary: "Discover foods that deliver more vitamins per bite.",
        icon: "leaf",
        accent: "#DCFCE7",
      },
      {
        id: "fiber-focus",
        title: "The Impact of Fiber",
        subtitle: "Why it matters",
        summary: "Support digestion, fullness, and stable energy levels.",
        icon: "sparkles",
        accent: "#E0E7FF",
      },
    ],
  },
  {
    id: "activity",
    title: "Physical Activity",
    items: [
      {
        id: "daily-steps",
        title: "Why Daily Steps Matter",
        subtitle: "Small walks, big gains",
        summary: "Boost metabolism, mood, and consistency with simple habits.",
        icon: "walk",
        accent: "#FEF3C7",
      },
      {
        id: "run-walk",
        title: "Walking vs Running",
        subtitle: "Which works for you?",
        summary: "Compare effort, impact, and calorie burn for your goals.",
        icon: "fitness",
        accent: "#E9D5FF",
      },
      {
        id: "boost-activity",
        title: "Boosting Activity Level",
        subtitle: "Simple daily tips",
        summary: "Practical ways to move more without extra workout time.",
        icon: "barbell",
        accent: "#FFE4E6",
      },
      {
        id: "workout-bites",
        title: "Workout Bites",
        subtitle: "Quick routines at work",
        summary: "Short exercises you can do in small breaks.",
        icon: "timer",
        accent: "#DBEAFE",
      },
    ],
  },
  {
    id: "weight",
    title: "Weight & BMI",
    items: [
      {
        id: "weight-loss",
        title: "Healthy Weight Loss Tips",
        subtitle: "Progress you can keep",
        summary: "Sustainable habits that keep you energized and consistent.",
        icon: "heart",
        accent: "#FCE7F3",
      },
      {
        id: "bmi-explained",
        title: "BMI: What It Means",
        subtitle: "Numbers made simple",
        summary: "Understand what BMI can and can’t tell you.",
        icon: "stats-chart",
        accent: "#E0F2FE",
      },
      {
        id: "scale-trends",
        title: "Scale Trends",
        subtitle: "Read your weekly data",
        summary: "Learn to spot real change vs. water weight swings.",
        icon: "trending-up",
        accent: "#D1FAE5",
      },
      {
        id: "body-comp",
        title: "Body Composition",
        subtitle: "Beyond the scale",
        summary: "Track muscle, fat, and measurements for a fuller picture.",
        icon: "body",
        accent: "#FEE2E2",
      },
    ],
  },
];

const DEFAULT_ARTICLE = {
  authorDate: "Published on Dec 12, 2024",
  sections: [
    {
      title: "Introduction",
      body:
        "Understanding nutrition basics helps you build a balanced routine that fits your lifestyle. When you know how foods work in the body, it becomes easier to plan meals, stay consistent, and reach your goals without extreme diets.",
    },
    {
      title: "Carbohydrates",
      body:
        "Carbs are the body’s preferred energy source, especially for the brain and high‑intensity activity. Choose complex options like oats, brown rice, beans, and vegetables to keep energy steady and improve fiber intake.",
    },
    {
      title: "Protein",
      body:
        "Protein helps repair muscle tissue and keeps you fuller for longer. Aim to include a source at every meal—lean meats, eggs, yogurt, tofu, or legumes—so intake is spread evenly across the day.",
    },
    {
      title: "Fats",
      body:
        "Healthy fats support hormone balance and help absorb vitamins A, D, E, and K. Focus on unsaturated fats from nuts, seeds, olive oil, and avocado while keeping added oils reasonable.",
    },
    {
      title: "Putting It Together",
      body:
        "A balanced plate usually includes a lean protein, a fiber‑rich carb, colorful vegetables, and a small amount of healthy fat. Use this simple structure to build meals that are satisfying and sustainable.",
    },
    {
      title: "Quick Tips",
      body:
        "Plan one meal ahead, keep high‑protein snacks available, and drink water regularly. Small habits make consistency easier than chasing perfection.",
    },
  ],
};

export default function ArticlesScreen({ navigation }) {
  const openArticle = (article) => {
    navigation.navigate("ArticleDetails", {
      article: { ...DEFAULT_ARTICLE, ...article },
    });
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={[styles.headerIcon, styles.headerIconLeft]}>
          <Ionicons name="flame" size={18} color={COLORS.primary} />
        </View>
        <Text style={styles.headerTitle}>Articles</Text>
        <TouchableOpacity style={[styles.headerIcon, styles.headerIconRight]}>
          <Ionicons name="search" size={18} color="#111827" />
        </TouchableOpacity>
      </View>

      {ARTICLE_SECTIONS.map((section) => (
        <View key={section.id} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <TouchableOpacity>
              <Text style={styles.sectionAction}>View All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.cardList}>
            {section.items.map((article) => (
              <TouchableOpacity
                key={article.id}
                style={styles.card}
                activeOpacity={0.85}
                onPress={() => openArticle(article)}
              >
                <View style={styles.cardTextWrap}>
                  <Text style={styles.cardTitle}>{article.title}</Text>
                  <Text style={styles.cardSubtitle}>{article.subtitle}</Text>
                  <Text style={styles.cardSummary}>{article.summary}</Text>
                </View>
                <View
                  style={[
                    styles.cardIcon,
                    { backgroundColor: article.accent },
                  ]}
                >
                  <Ionicons name={article.icon} size={20} color="#111827" />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    position: "relative",
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
  headerIconLeft: {
    position: "absolute",
    left: 0,
  },
  headerIconRight: {
    position: "absolute",
    right: 0,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.text,
    textAlign: "center",
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
    textAlign: "center",
  },
  sectionAction: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: "700",
  },
  cardList: {
    flexDirection: "column",
  },
  card: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardTextWrap: {
    flex: 1,
    minWidth: 0,
    paddingRight: 10,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 12,
    color: "#6B7280",
  },
  cardSummary: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 6,
    lineHeight: 16,
  },
  cardIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
  },
});


