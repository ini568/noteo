Noteo mobile build quick guide

Prerequisites
- Android Studio (for Android) and/or Xcode on macOS (for iOS)
- Node.js LTS

Configured in repo
- Capacitor config: `capacitor.config.ts` (appId `com.noteo.app`, appName `Noteo`)
- Client API base URL:
  - Default is resolved at runtime.
  - Override from the app UI: open Settings (⚙) on the Login screen or from the Notes screen and set "Server URL".
  - `.env` `VITE_API_URL` remains supported as a build-time default.
- NPM scripts (run in `client/`):
  - `mobile:build:android` / `mobile:build:ios`
  - `cap:add:android` / `cap:add:ios`
  - `cap:open:android` / `cap:open:ios`

Icons and splash
1) Save your 1024x1024 logo to `resources/icon.png`.
2) Optionally save a 2732x2732 splash image to `resources/splash.png` (center-safe area 1200x1200).
3) Install generator: `npm i -D @capacitor/assets` (in `client/`).
4) Generate: `npx cap assets` (in `client/`).

Android
1) From `client/`: `npm run mobile:build:android`
2) Add platform once: `npm run cap:add:android`
3) Open Android Studio: `npm run cap:open:android`
4) Allow HTTP for local API during dev: edit `android/app/src/main/AndroidManifest.xml` and set
   `<application ... android:usesCleartextTraffic="true">`
5) Run on emulator/device.

API URL tips (Android)
- Emulator: use `http://10.0.2.2:4000` (pre-filled default)
- Physical device: use your PC LAN IP, e.g. `http://192.168.x.x:4000`
- Or use `adb reverse tcp:4000 tcp:4000` and set `http://localhost:4000`

iOS (macOS)
1) From `client/`: `npm run mobile:build:ios`
2) Add platform once: `npm run cap:add:ios`
3) Open Xcode: `npm run cap:open:ios`
4) Allow HTTP for local API during dev: in `ios/App/App/Info.plist` add
   `NSAppTransportSecurity -> NSAllowsArbitraryLoads = YES` (dev only). Use HTTPS in production.
5) Run on simulator/device.

Re-sync after any web changes
`npm run build && npm run cap:sync` (in `client/`).
