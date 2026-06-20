# Haazir - Real-Life Mobile App Integration Guide (Expo)

This workspace contains a production-ready **React Native + Expo** mobile boilerplate inside the `/mobile-boilerplate` directory. It is pre-configured to run as a real-life native app on any **iPhone (iOS)** or **Android** phone.

Follow this developer guide to load the application on your physical mobile device in less than 5 minutes!

---

## 🛠️ Step 1: Install Expo Go on Your Personal Device

Rather than compiling custom binaries right away, you can run the live native app on your phone instantly using **Expo Go**:

1. **Android**: Open the **Google Play Store** and search for **"Expo Go"**. Install the app.
2. **iPhone (iOS)**: Open the **Apple App Store** and search for **"Expo Go"**. Install the app.

---

## 💻 Step 2: Download the Workspace & Run Locally

To boot up the native bundler on your local machine:

1. **Download the ZIP** of this workspace by clicking **Export or Settings** in Google AI Studio, then select **Export to ZIP** (or push to GitHub).
2. Extract the directory and open your terminal inside the **`mobile-boilerplate`** subdirectory:
   ```bash
   cd mobile-boilerplate
   ```
3. Install the mobile-native workspace dependencies:
   ```bash
   npm install
   ```
4. Start the native Expo dev server:
   ```bash
   npx expo start
   ```

---

## 📱 Step 3: Run on Your Device

Once the interactive terminal menu loads, you will see a large **QR Code** in your console:

### For Android Users:
1. Open the **Expo Go** app on your phone.
2. Tap **"Scan QR Code"** and scan the code displayed in your terminal.
3. The app will bundle instantly and run fully native on your Android phone!

### For iPhone (iOS) Users:
1. Open the default **Camera** app on your iPhone.
2. Scan the QR code displayed in your terminal.
3. Tap the pop-up link to open with **Expo Go**.
4. The native iOS environment will bundle the code and load the app!

---

## 📦 Step 4: Building the App for App Stores (Production APK/IPA)

When you are ready to publish **Haazir** to the **Google Play Store** or **Apple App Store**, you can compile the production app packages:

### Prerequisites:
1. Create a free account at [expo.dev](https://expo.dev).
2. Install EAS CLI globally on your machine:
   ```bash
   npm install -g eas-cli
   ```
3. Log in to your Expo account from the terminal:
   ```bash
   eas login
   ```

### To build the Android App (APK):
```bash
eas build --platform android --profile preview
```
*This command compiles a downloadable `.apk` file that you or your development team can install on any Android phone directly for testing.*

### To build for iOS & Google Play release:
```bash
# Build for Google Play Store submit
eas build --platform android

# Build for Apple App Store submit
eas build --platform ios
```

---

## 🏗️ Architecture Design: How Simulator Translates to Mobile Native

Inside `/mobile-boilerplate`, the web simulator logic has been streamlined into structured React Native components optimized for phone screens:

1. **`App.js`**: Core entry point mounting native navigators and context providers.
2. **`/src/navigation/AppNavigator.js`**: Replaces the desktop frames with a native tab manager containing deep stacks for **Customer Mode** and **Worker Mode**.
3. **`/src/context/BookingContext.js`**: Shared state dispatcher syncing live location coordinates, active requests, prices, and booking phases.
4. **`/src/screens`**:
   - **`customer/HomeScreen.js`**: Interactive categories view matching the global keyword search filters (`leak`, `fix`, `wire`) and direct quick-issue dispatch launchers.
   - **`worker/DashboardScreen.js`**: Active request stack tracker, live GPS marker dispatcher, and detailed weekly earnings visuals calculating cash payouts.
