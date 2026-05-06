<div align="center">
  <h1>MetaCal 🔥</h1>
  <p><strong>Smart nutrition tracking built for African users.</strong></p>
  <p>Log meals, scan food with AI, and hit your calorie goals — with a database that actually knows what Jollof Rice and Eba are.</p>
Show Image
Show Image
Show Image
Show Image
Show Image
</div>

Overview
Most calorie tracking apps are built for Western diets. MetaCal is built for everyone else.
It includes a local African food database covering staples like Eba, Fufu, Pounded Yam, Amala, Jollof Rice, and more — making calorie tracking accurate and actually usable for Nigerian and African users.
The app combines manual food logging with AI-assisted image recognition powered by the OpenAI API. Point your camera at a meal and MetaCal detects the foods, estimates portions, and logs the macros automatically.

Screenshots

Screenshots from development build. APK release in progress.

OnboardingHome DashboardFood LogAI ScanShow ImageShow ImageShow ImageShow Image

Features

AI Food Detection — Snap a photo of your meal and the app identifies foods, estimates portions, and calculates macros using the OpenAI API
African Food Database — Built-in database of popular Nigerian and African foods with calorie and macro data
Personalized Calorie Targets — Calculates daily calorie requirements based on your goal (lose weight, gain muscle, maintain)
Macro Tracking — Tracks protein, carbs, and fats against daily targets
Weekly & Monthly Insights — Visual charts showing calorie intake and nutrition breakdown over time
Manual Food Logging — Search and log any food by name with quantity control


Tech Stack
LayerTechnologyMobile FrameworkReact Native + ExpoLanguageJavaScriptBackend / AuthFirebase (Firestore + Auth)AI IntegrationOpenAI API (food detection)ChartsReact Native chart library

Getting Started
Prerequisites

Node.js 18+
Expo CLI (npm install -g expo-cli)
Expo Go app on your phone (iOS or Android)
Firebase project with Firestore and Auth enabled
OpenAI API key

Installation
bash# Clone the repo
git clone https://github.com/daves-impact/MetaCal.git
cd MetaCal

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Add your Firebase config and OpenAI API key to .env

# Start the dev server
npx expo start
Scan the QR code with Expo Go on your phone to run the app.

Project Status

In active development. The app runs fully on Expo Go. APK build is currently in progress.


Author
Built by Dave — frontend developer and product builder.
