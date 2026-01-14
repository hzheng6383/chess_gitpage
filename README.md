
# 中國象棋 (AI)

一個基於 React 的高級中國象棋遊戲，具備智能 AI 對弈、悅耳音效及優質綠色棋盤。

## 功能特點
- **智能 AI**: 採用 Minimax 算法與 Alpha-Beta 剪枝，對手足夠聰明。
- **優質設計**: 深綠色棋盤設計，經典且保護眼睛。
- **流暢動畫**: 使用 Framer Motion 實現絲滑的移庫動畫。
- **原生音效**: 下棋、吃子、將軍均有對應音效。
- **跨平台**: 已集成 Capacitor，可輕鬆轉化為 Android 和 iOS 應用。

## 如何運行
1. 安裝依賴: `npm install`
2. 啟動開發服務器: `npm run dev`
3. 構建並同步到移動端: `npm run build:mobile`

## 打包為手機 App
- **Android**: 運行 `npm run cap:open:android` 即可在 Android Studio 中打開。
- **iOS**: 運行 `npm run cap:open:ios` 即可在 Xcode 中打開 (僅限 macOS)。
