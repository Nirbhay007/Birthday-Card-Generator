# 🎮 Birthday Quest & Secret Gift Game — Multi-Agent Coordination Ledger

**Project**: Interactive Personalized Birthday Game with Hidden Message & Secret Gift Box  
**Repository**: `/Users/nirbhaysingh/dev/AI/birthday-generator`  
**Agents**: 
- **Agent 1 (Antigravity in Terminal 1)**: Lead Architect, Core Game Engine, Stages (Memory Match, Star Catcher, Vault Lock, Grand Reveal), Audio Synthesizer, Game Creator Studio & Routes.
- **Agent 2 (OpenCode in Terminal 2)**: Companion Features (Keepsake Certificate Generator, Game E2E Test Suite, Additional Soundpacks & Themes, Razorpay Game Order Integration verification).

---

## 🌟 Product Vision
An ultra-premium, interactive birthday game that gift-givers can personalize for their loved ones.
Instead of sending a boring static greeting, the recipient receives a secret playable quest:
1. **The Royal Wax-Sealed Invitation**: "A secret quest crafted with love by [Sender] for [Recipient]."
2. **Stage 1: Memory Constellation**: 3D flip card memory game matching photos of the recipient with sweet memory notes.
3. **Stage 2: Star & Wish Catcher Arcade**: High-fps canvas arcade game collecting birthday stars, combos, and personalized wishes.
4. **Stage 3: The Secret Vault & Combination Lock**: Tactile 3D rotating dial combination lock cracking a secret clue/date.
5. **Stage 4: The Grand Reveal & Mystery Gift**:
   - Vault clanks open with golden particle explosion and fanfare.
   - Wax-sealed letter unfolds with sender's handwritten emotional letter.
   - 3D gift box with untie-able ribbon.
   - **Interactive Scratch-to-Reveal Card**: Recipients physically scratch away silver/gold foil with finger/mouse to reveal their secret gift (custom experience voucher, cash/coupon code, special surprise).
   - Downloadable VIP Keepsake Certificate.

---

## 📂 Architecture & File Contracts

### 1. Game Components (`src/components/game/`)
- `BirthdayQuestGame.js`: Master orchestrator managing game state (`'intro' | 'memory' | 'arcade' | 'vault' | 'reveal'`), score, sound, and transitions.
- `MemoryMatchStage.js`: 3D card flipping game using Framer Motion and custom photo pairs.
- `StarCatcherStage.js`: HTML5 Canvas star catcher with particle physics and combo animations.
- `VaultLockStage.js`: 3D mechanical rotary lock dial with Web Audio clicks and secret code validation.
- `GrandRevealStage.js`: Unfolding parchment letter + 3D gift box + Canvas scratch-to-reveal voucher.
- `gameAudio.js`: Zero-dependency Web Audio API procedural sound synthesizer (chimes, clicks, victory fanfares, error buzzers, confetti pops).
- `GameCreatorStudio.js`: 4-step wizard for creators to configure recipient name, photos, trivia, secret vault code, heartfelt message, and gift voucher.

### 2. Routes (`src/app/game/`)
- `/game/create`: The creator studio to build and preview the game.
- `/game/[id]`: The live playable game route for the recipient.
- `/game/play`: Direct preview mode (client-side state or query param decoded).
- `/api/game`: API route to save and fetch personalized game configurations.

### 3. Integration Points
- `src/components/site/SiteNav.js`: "🎮 Birthday Game" navigation link.
- `src/components/BirthdayExperience.js`: "Play [Name]'s Birthday Quest" special card inside the standard birthday experience.
- `src/components/CreateForm.js`: Option to attach or create a Birthday Game.

---

## 🛠️ Division of Work

### Antigravity (Terminal 1 — In Progress):
1. ✅ Write `COORDINATION.md` (this file) & sync across directories.
2. 🔨 Implement `gameAudio.js` Web Audio API sound synthesizer.
3. 🔨 Implement `MemoryMatchStage.js` (3D flip cards + photo pairs).
4. 🔨 Implement `StarCatcherStage.js` (Canvas arcade game).
5. 🔨 Implement `VaultLockStage.js` (Mechanical combination dial lock).
6. 🔨 Implement `GrandRevealStage.js` (Unfolding letter + 3D gift box + Canvas scratch-to-reveal card).
7. 🔨 Implement `BirthdayQuestGame.js` (Master stage controller + progress bar + audio controls).
8. 🔨 Implement `GameCreatorStudio.js` (Wizard with live preview & VIP checkout).
9. 🔨 Setup API routes `/api/game` & `/api/game/[id]`.
10. 🔨 Mount routes `/game/create`, `/game/[id]`, `/game/play`, and link from navigation.

### OpenCode (Terminal 2 — Ready to execute):
1. 🎯 **Task OC-1**: Create `src/components/game/KeepsakeCertificate.js` — a luxury, golden-bordered downloadable digital certificate ("Official World's Greatest Human") that renders on canvas with recipient name, custom award title, sender signature, and one-click "Download as Image" button.
2. 🎯 **Task OC-2**: Add `e2e/game.spec.js` Playwright test suite to verify:
   - Game loads smoothly with default & custom data
   - Stages progress correctly: Intro -> Memory -> Arcade -> Vault -> Reveal
   - Scratch card canvas interacts properly on mouse/touch
3. 🎯 **Task OC-3**: Verify Razorpay payment integration for VIP Game Pass (₹99 / $4.99) using existing `src/lib/payments.js` and `PremiumOrder` model.

---

## 🚀 Status Board
- `COORDINATION.md`: ACTIVE
- Core Game Engine: BUILDING
- Stage 1 (Memory): PENDING
- Stage 2 (Arcade): PENDING
- Stage 3 (Vault): PENDING
- Stage 4 (Reveal + Scratch Card): PENDING
- Creator Studio: PENDING
- Certificate & E2E: ASSIGNED TO OPENCODE
