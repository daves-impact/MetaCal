# CHAPTER FOUR  
## IMPLEMENTATION  

### 4.0 Introduction  
This chapter presents the implementation of MetaCal, a mobile calorie and nutrition tracking application developed with React Native using the Expo framework. It explains how the designed interfaces were translated into working screens and how core system logic was connected to backend services.

The chapter also describes the technologies used to implement the system, including React Native, Expo, React Navigation, Firebase Authentication, Firebase Firestore, and Context API for state management. In addition, screenshots are provided to demonstrate the implemented interfaces and user flow from onboarding to food logging.

---

### 4.1 Design  

The visual and interaction design of MetaCal follows a minimal, modern, and health-focused style. The interface emphasizes readability, quick access to key actions, and reduced cognitive load for users who need to log meals frequently. A primary green color theme is used consistently to reinforce the wellness context of the application and provide visual continuity across screens.

Navigation was implemented using a hybrid structure: Stack Navigator for linear flows such as onboarding and authentication, and Bottom Tab Navigator for primary in-app modules (Home, Insights, Articles, and Account). This structure supports both guided first-time setup and efficient daily use.

The user experience principles applied in the implementation include simplicity, clarity, and speed of interaction. Input steps are divided into manageable screens, labels are explicit, and important feedback is visible through progress indicators, summaries, and action prompts. The food logging process is intentionally streamlined to reduce friction in repeated daily use.

#### 4.1.1 Welcome Screens

![Figure 4.1: Welcome Screen 1](images/welcome1.png)

Welcome Screen 1 introduces users to MetaCal and sets the context for the application. It presents a concise value proposition and establishes the health-focused visual identity of the system.

From an onboarding perspective, this screen serves as the first orientation point, helping users understand the app's purpose before account creation or login.

![Figure 4.2: Welcome Screen 2](images/welcome2.png)

Welcome Screen 2 continues the onboarding narrative by presenting additional product benefits and expected outcomes of consistent usage. The content is structured to maintain user attention while avoiding information overload.

Its design supports progressive disclosure, where information is introduced step-by-step rather than all at once, improving comprehension and completion rate.

![Figure 4.3: Welcome Screen 3](images/welcome3.png)

Welcome Screen 3 acts as a transition from product introduction to account actions. It prepares users to proceed to authentication by clarifying the next step in the flow.

This final onboarding preview screen exists to reduce abrupt transitions and improve continuity between informational and transactional steps.

---

#### 4.1.2 Authentication Screens

![Figure 4.4: Sign Up Screen](images/signup.png)

The Sign Up screen collects user credentials required for account creation. Input validation is applied to ensure data quality before submission.

At implementation level, this screen integrates with Firebase Authentication for secure account registration and supports a verifiable identity flow required before full application access.

![Figure 4.5: Login Screen](images/login.png)

The Login screen allows returning users to access their profiles and persisted data. The interface is intentionally simple to reduce login friction and improve task completion.

Backend integration uses Firebase Authentication sign-in methods, with error handling for common cases such as invalid credentials and unverified email states.

![Figure 4.6: Forgot Password Screen](images/forgotpassword.png)

The Forgot Password screen supports account recovery by initiating a password reset process through the registered email address.

This screen is necessary for reliability and user retention, as it enables recovery without requiring administrative intervention and is integrated with Firebase password reset functionality.

---

#### 4.1.3 Onboarding Screens

![Figure 4.7: Name Screen](images/name.png)

The Name screen captures the user identity label used for personalization inside the application, especially in profile and settings views. The interaction is intentionally lightweight, requiring minimal effort to continue.

![Figure 4.8: Gender Screen](images/gender.png)

The Gender screen captures a core biological parameter needed for calorie estimation. The screen uses direct option selection to reduce input ambiguity and improve consistency.

![Figure 4.9: Height Screen](images/height.png)

The Height screen records the user's body measurement as an input variable for nutritional target computation. Numeric entry controls are used to keep the data structured and machine-processable.

![Figure 4.10: Current Weight Screen](images/currentweight.png)

The Current Weight screen stores baseline body weight for both target calculations and longitudinal tracking in insights. This value becomes part of the user's stored health profile.

![Figure 4.11: Target Weight Screen](images/targetweight.png)

The Target Weight screen defines the intended body weight outcome. This parameter directly influences the recommendation logic by identifying whether the user is targeting loss, maintenance, or gain.

![Figure 4.12: Goal Selection Screen](images/goalselection.png)

The Goal Selection screen captures explicit intention (for example, weight loss, maintenance, or gain). It complements the numerical weight targets and helps enforce clear recommendation rules.

![Figure 4.13: Personalization Loading Screen](images/personalization.png)

The Personalization screen displays a processing state while user inputs are consolidated and mapped into computed targets. The loading feedback communicates progress and prevents duplicate submission behavior.

![Figure 4.14: Calorie Plan Result Screen](images/calorieplan.png)

The Calorie Plan Result screen presents computed daily calories and macronutrient targets generated from collected onboarding inputs. It acts as a confirmation checkpoint before the user enters the main application.

Collectively, these onboarding screens form the data acquisition pipeline for personalized nutrition planning. The captured parameters are persisted in Firestore and used in later modules, including Home and Insights.

---

#### 4.1.4 Main Application Screens (From Home Onward)

![Figure 4.15: Home Screen](images/home.png)

The Home screen functions as the operational dashboard of MetaCal. It presents daily calorie progress, macro summaries, streak feedback, and recently logged meals in a single view. The screen is designed for quick daily checks and low-friction meal management.

From a usability perspective, this screen is the core execution point of the application after onboarding. Users can add meals, inspect nutrition totals, and remove entries through swipe gestures without navigating through multiple pages.

![Figure 4.16: Log Food Screen](images/logfood.png)

The Log Food screen provides searchable food selection and direct access to camera-based meal scanning. It supports local food datasets with serving labels and confidence tags, enabling both manual and assisted food entry methods.

This screen exists to reduce entry time and improve consistency in meal logging, especially for frequent users who need repeated daily interaction.

![Figure 4.17: Meal Details Screen](images/fooddetails.png)

The Meal Details screen allows users to review nutrition values, adjust serving size, and set serving count before adding a meal entry. It includes per-serving scaling and macro recalculation logic that updates values in real time.

Its implementation supports precise control over logged intake and improves data quality for both progress tracking and insight generation.

![Figure 4.18: Scan Food Screen](images/scan.png)

The Scan screen provides camera and gallery-based image analysis to detect meals and estimate nutritional content. Detected items are presented for review before being committed to the user log.

This screen was implemented to complement manual logging, improving convenience while preserving user confirmation before persistence.

![Figure 4.19: Insights Screen](images/insights.png)

The Insights screen visualizes historical trends for calories, macronutrients, weight, and BMI. It supports date-range navigation and chart-based interpretation of user progress over time.

The purpose of this screen is analytic feedback: it transforms daily records into understandable patterns that help users assess adherence to targets and outcomes.

![Figure 4.20: Articles Screen](images/articles.png)

The Articles screen provides educational nutrition content integrated into the application workflow. It broadens user support beyond logging by offering guidance for healthier dietary decisions.

This screen contributes to behavior reinforcement by linking tracked data with practical lifestyle recommendations.

![Figure 4.21: Account/Settings Screen](images/account.png)

The Account screen centralizes user configuration, including profile details, nutrition goals, reminders, and authentication actions such as logout and account deletion.

It provides administrative control over personalization variables that influence calculations in Home and Insights, ensuring that the system remains adaptive to user updates.

---

### 4.2 Implementation  

MetaCal implementation combines client-side mobile interfaces with cloud-backed identity and data persistence. Firebase Authentication manages account lifecycle events (registration, login, verification, reset, logout), while Firestore stores user profiles, targets, and meal log records. This architecture supports real-time updates and persistent cross-session usage.

#### Firebase Authentication Integration
Authentication flows were implemented using Firebase Auth methods for sign up and sign in. Error handling and state gating were added to control route access based on verification and profile completion.

```javascript
// Simplified auth flow
const credential = await signInWithEmailAndPassword(auth, email, password);
await credential.user.reload();
const verified = credential.user.emailVerified;
```

#### Food Data Structure and Macronutrients per Portion
Food records are structured with identifiers, labels, serving metadata, and nutrition values. Each meal entry stores calories and macros required for daily totals and insights.

```javascript
const food = {
  id: "ng-jollof-rice",
  name: "Jollof Rice",
  servingLabel: "1 cup (200g)",
  servingGrams: 200,
  calories: 286,
  protein: 6.6,
  carbs: 33.4,
  fat: 12.0,
};
```

#### Meal Logging Logic
When a user logs a meal, the app creates a meal record with timestamp metadata and nutrition values, then persists it to the user meal collection.

```javascript
const meal = {
  id: Date.now().toString(),
  name: foodName,
  dateKey: "2026-02-23",
  timeLabel: "08:15 AM",
  calories: totalCalories,
  protein: totalProtein,
  carbs: totalCarbs,
  fat: totalFat,
};
addMeal(meal);
```

#### Portion Calculation (Per 100g Scaling Formula)
Nutrition scaling is implemented by converting known values to the selected serving mass using proportional transformation.

```javascript
const calories = (grams / 100) * kcalPer100g;
const protein = (grams / 100) * proteinPer100g;
const carbs = (grams / 100) * carbsPer100g;
const fat = (grams / 100) * fatPer100g;
```

#### Recommendation Logic (Rule-Based)
The recommendation logic is rule-based and depends on profile inputs such as gender, age, height, current weight, target weight, and activity level. Daily calorie and macro targets are computed from these rules and saved to the user profile.

```javascript
// Conceptual rule-based target computation
const tdee = bmr * activityFactor;
const calories = Math.round(tdee + goalAdjustment);
const protein = Math.round((calories * proteinRatio) / 4);
const carbs = Math.round((calories * carbRatio) / 4);
const fat = Math.round((calories * fatRatio) / 9);
```

#### Context API for State Management
Global state is managed through Context API modules such as AuthContext, UserContext, MealsContext, and AlertContext. This approach centralizes shared state and reduces prop drilling across screens.

```javascript
const { authUser } = useContext(AuthContext);
const { user, setUser } = useContext(UserContext);
const { meals, addMeal, removeMeal } = useContext(MealsContext);
```

#### Navigation Flow
Navigation is implemented with conditional flow control. Unauthenticated users enter onboarding/auth stacks, while authenticated and completed users are routed to the main tab layout.

```javascript
const showOnboarding = !authUser || !authUser.emailVerified;
const initialRoute = showOnboarding ? "Login" : "MainTabs";
```

In summary, the implementation of MetaCal operationalizes the interface design into a functioning mobile system with secure authentication, personalized target computation, structured food data handling, and practical daily logging workflows. The implemented screens and backend-integrated logic satisfy the chapter objective of demonstrating a complete, usable system.
