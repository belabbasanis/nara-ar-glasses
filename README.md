# GlycoSnap - Pre-Diabetes Food Assistant AR HUD

GlycoSnap is an advanced Augmented Reality (AR) interface designed for smart glasses. It empowers users with pre-diabetes to make informed nutritional choices in real-time by analyzing food through computer vision and providing metabolic impact predictions.

## 🚀 Vision
Making food literacy invisible and instantaneous. By snapping a photo through AR glasses, users see exactly how a meal might impact their blood glucose levels before they take a bite.

## 🛠 Tech Stack
- **Frontend:** React 19 (ESM / Buildless setup)
- **Styling:** Tailwind CSS (Custom HUD high-contrast theme)
- **AI Engine:** Google Gemini 3 Flash (Computer Vision & Metabolic Modeling)
- **Data Source:** USDA FoodData Central API (Verified Nutritional Grounding)
- **Environment:** Import Maps for browser-native module loading

## ✨ Key Features
- **AR-Safe Workspace:** Optimized for 16:9 landscape displays with a 10% lens safe-zone.
- **Center Corridor Preservation:** Reserved ±15% central field-of-view to maintain real-world visibility.
- **Metabolic Impact Prediction:** Estimates `ΔGlucose` (potential rise in mg/dL) based on food composition.
- **Nutritional Grounding:** Cross-references AI vision results with the USDA database for accuracy.
- **Dynamic HUD:** Semantic lane-based layout (State, Context, Impact).

## 📥 Installation & Setup

### 1. Prerequisites
- A modern web browser (Chrome, Edge, or Safari).
- A local development server (e.g., Node.js with `npx serve` or Python's `http.server`).
- A **Google Gemini API Key** from [Google AI Studio](https://aistudio.google.com/).

### 2. Clone the Project
Simply download or clone this repository to your local machine.

### 3. Configure Environment Variables
The application requires an API key to communicate with the Gemini models.
- The app expects `process.env.API_KEY` to be available. 
- In most local environments, you can pass this during the serve command or ensure it's injected by your hosting provider (like Vercel).

### 4. Run Locally
Navigate to the project root and start a local server:

**Using Node.js:**
```bash
npx serve .
```

**Using Python:**
```bash
python -m http.server 8000
```

Open your browser to `http://localhost:3000` (or `8000`).

## 👓 AR HUD Usage
- **TOP LEFT:** Monitor your real-time system status and current glucose telemetry.
- **CENTER:** The clear corridor. Use the subtle reticle to aim at food or nutrition labels.
- **BOTTOM RIGHT:** Use the `TRIGGER_SCAN` button to initiate analysis.
- **SCAN RESULTS:** View predicted glucose impact, carbs, sugars, and fiber metrics on the right peripheral.

## ⚠️ Important Notes
- **Red Color Rule:** In this HUD, Red is strictly reserved for *current* physiological danger (measured glucose). Predicted food impacts use **Amber/Yellow** to differentiate hypothetical data from real-time medical status.
- **Camera Access:** This app requires camera permissions. Ensure you are browsing via `https` or `localhost` to allow the browser to access the device camera.

## 📄 License
This project is built for educational and hackathon purposes. It is not a substitute for professional medical advice. Always consult with a healthcare provider for diabetes management.