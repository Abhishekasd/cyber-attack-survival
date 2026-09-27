# Cyber Attack Survival

A responsive, cybersecurity survival simulation game built with vanilla HTML5, CSS3, and JavaScript. Players take on the role of a Chief Information Security Officer (CISO) or IT Administrator tasked with defending an enterprise network against realistic cyber attacks, managing security resources, training employees, and maintaining corporate security posture.

---

## 1. Project Overview

**Cyber Attack Survival** simulates the high-stakes environment of a Security Operations Center (SOC). Players navigate incident response scenarios, balance tight budgets, upgrade infrastructure, and respond to unpredictable security events while keeping network health above zero.

- **Genre**: Strategy / Simulation / Cybersecurity Educational Game
- **Architecture**: Single Page Application (SPA), Pure Static Web App
- **Persistence**: Browser LocalStorage (`cyberAttackSurvivalSave`)
- **Dependencies**: Zero external JS frameworks or heavy libraries

---

## 2. Game Concept

The network starts with baseline statistics: Security Health (100%), Budget, Users, Devices, Security Level, and Staff. As security incidents occur—ranging from phishing emails to full-blown ransomware attacks—the player must evaluate threats and select optimal defensive decisions. Incorrect or negligent choices degrade health and security levels, while correct decisions neutralize threats, increase awareness, and award score points.

---

## 3. Features

- **Dynamic Incident Management**: Interactive terminal monitor for handling real-time cyber threats.
- **Resource Management & Upgrades**: Purchase enterprise defenses including Firewall Upgrades, Antivirus Solutions, Employee Security Training, and Automated Backup Systems.
- **Employee Awareness & Risk System**: Monitor employee awareness percentages and risk categories (LOW, MEDIUM, HIGH) with targeted individual training options.
- **Random Security Events**: Face unexpected organizational incidents (e.g., lost laptops, suspicious logins) with branching choices and consequences.
- **Visual Health & Threat Indicators**: Color-coded, responsive dashboard cards providing instant feedback on network health and active threat statuses.
- **Persistent Save & Resume System**: Progress auto-saves after key decisions and can be safely resumed across browser sessions.
- **Final Security Report & Recommendations**: Comprehensive end-of-game report detailing final score, performance rank (Elite Defender, Security Expert, etc.), star ratings, and tailored security recommendations.

---

## 4. Game Modes

Players can select from three balanced difficulty modes at game start:

| Game Mode | Starting Budget | Starting Security | Damage Multiplier | Staff | Initial Firewall |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **🟢 Training Mode** | ₹60,000 | 50% | 0.75× | 3 | Level 2 |
| **🟡 Survival Mode** | ₹50,000 | 40% | 1.00× | 2 | Level 1 |
| **🔴 Hardcore Mode** | ₹40,000 | 30% | 1.25× | 1 | Level 1 |

---

## 5. Cybersecurity Scenarios

1. **Phishing Attack**: Suspicious emails containing malicious link attachments.
2. **Malware Incident**: Executable files discovered on internal workstations.
3. **Weak Password Exposure**: Easily guessable credentials requiring password changes or account locks.
4. **Suspicious USB**: Found external media devices requiring scanning or formatting before network connection.
5. **Ransomware Outbreak**: Critical server encryption threats test backup readiness and containment speed.
6. **Attack Chain Progress**: Multi-stage attack progression where unmitigated entry-level threats escalate into data breaches.
7. **Random Security Events**: Unannounced operational security challenges (lost devices, unauthorized logins).

---

## 6. Scoring System

Final performance score is calculated dynamically based on defensive effectiveness:

$$\text{Final Score} = \max\Big(0,\ \text{Base Score} + \text{Health Bonus} + \text{Security Bonus} + (\text{Threats Neutralized} \times 100) - (\text{Threats Missed} \times 150)\Big)$$

- **Health Bonus**: Up to +500 points for maintaining high network health (≥90%).
- **Security Bonus**: Up to +500 points for high security level (≥80%).
- **Ranks**:
  - `5000+` : ⭐⭐⭐⭐⭐ ELITE DEFENDER
  - `3500–4999`: ⭐⭐⭐⭐ SECURITY EXPERT
  - `2000–3499`: ⭐⭐⭐ SKILLED DEFENDER
  - `1000–1999`: ⭐⭐ ROOKIE DEFENDER
  - `< 1000` : ⭐ NETWORK LIABILITY

---

## 7. Save/Resume System

- Game progress is automatically serialized to browser `localStorage` under the key `"cyberAttackSurvivalSave"`.
- On returning to the landing page, a `▶ RESUME GAME` option is presented if a valid save exists.
- Starting a `NEW GAME` prompts for confirmation to delete previous save data cleanly.
- Corrupted or invalid saves are safely handled and cleared without crashing the application.
- If the game ends in GAME OVER, resuming displays the final security report while locking active gameplay decisions.

---

## 8. Technology Used

- **HTML5**: Semantic document structure with accessible ARIA landmarks.
- **CSS3**: Custom CSS variables, Grid/Flexbox layouts, glassmorphism, responsive media queries, keyframe animations, and reduced-motion support.
- **Vanilla JavaScript (ES6+)**: Event-driven state architecture, DOM manipulation, JSON LocalStorage API, zero external framework overhead.
- **Google Fonts**: Rajdhani (Headings) and Share Tech Mono (Body / Terminal display).

---

## 9. Project Structure

```text
mini project gaurav/
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── app.js
│   ├── step17-final.js
│   └── step19-save.js
├── .gitignore
└── README.md
```

---

## 10. How to Run Locally

Because the project is built with pure static HTML, CSS, and JavaScript, no complex installation or Node.js environment is required.

1. **Clone or Download the Repository**:
   ```bash
   git clone https://github.com/your-username/cyber-attack-survival.git
   ```
2. **Open in VS Code or Any Editor**:
   Open the project folder (`mini project gaurav`) in your preferred code editor.
3. **Launch with Local Web Server**:
   - Install and launch the **Live Server** extension in VS Code, OR
   - Run a simple Python web server in the project directory:
     ```bash
     python -m http.server 8000
     ```
4. **Play the Game**:
   Open `http://localhost:8000` (or `http://127.0.0.1:5500` with Live Server) in your web browser.

---

## 11. Deployment

This static project is 100% ready for deployment on static hosting platforms:

- **Vercel**: Import the GitHub repository; Vercel automatically detects static HTML. No build command required.
- **GitHub Pages**: Enable GitHub Pages in repository settings pointing to the `main` branch root directory.
- **Netlify**: Drag and drop the project folder or connect the Git repository for automatic static deploys.

---

## 12. Future Improvements

- Sound effects and audio toggle for terminal alerts.
- Additional incident types (e.g., DDoS, Insider Threat, Zero-Day Exploits).
- Leaderboard integration using serverless database endpoints (e.g., Supabase or Firebase).
- Dark/Light cyber theme toggle.
