// STEP 17: Game Modes Implementation - Final Version
// Extends the existing app.js with complete game mode functionality

// Merge all STEP 17 logic into the existing app.js
function addSTEP17Logic() {
    // PART 2 — GAME STATE: Ensure gameMode property exists
    if (!gameState.gameMode) {
        gameState.gameMode = 'survival';
    }

    // PART 2 — GAME STATE: Ensure modeConfigs exists (may already exist)
    if (!modeConfigs) {
        // Define modeConfigs if not already defined
        const modeConfigs = {
            training: {
                health: 100,
                maxHealth: 100,
                budget: 60000,
                staff: 3,
                firewallLevel: 2,
                securityLevel: 50,
                icon: '🟢',
                name: 'TRAINING',
                color: '#10b981'
            },
            survival: {
                health: 100,
                maxHealth: 100,
                budget: 50000,
                staff: 2,
                firewallLevel: 1,
                securityLevel: 40,
                icon: '🟡',
                name: 'SURVIVAL',
                color: '#f59e0b'
            },
            hardcore: {
                health: 100,
                maxHealth: 100,
                budget: 40000,
                staff: 1,
                firewallLevel: 1,
                securityLevel: 30,
                icon: '🔴',
                name: 'HARDCORE',
                color: '#ef4444'
            }
        };
    }

    // PART 4 — DIFFICULTY MULTIPLIER: Enhanced getDifficultyMultiplier
    function getDifficultyMultiplier() {
        switch (gameState.gameMode) {
            case 'training':
                return 0.75;
            case 'survival':
                return 1.00;
            case 'hardcore':
                return 1.25;
            default:
                return 1.00;
        }
    }

    // PART 6 — APPLY DAMAGE HELPER: Enhanced applyDamage
    function applyDamage(amount, reason) {
        const multiplier = getDifficultyMultiplier();
        const adjustedDamage = Math.round(amount * multiplier);

        // PART 11 — HEALTH LIMITS: Clamp health between 0 and 100
        gameState.health = Math.max(0, Math.min(100, gameState.health - adjustedDamage));

        updateDashboard();
        if (reason) {
            addLog(`[DAMAGE] ${reason} dealt ${adjustedDamage} damage (${amount} × ${multiplier})`);
        }
        return adjustedDamage;
    }

    // PART 3 — INITIAL GAME SETTINGS: Enhanced initializeGameMode
    function initializeGameMode(mode) {
        const config = modeConfigs[mode];
        if (!config) return;

        // Reset game state to mode defaults
        gameState.gameMode = mode;
        gameState.health = config.health;
        gameState.maxHealth = config.maxHealth;
        gameState.budget = config.budget;
        gameState.staff = config.staff;
        gameState.firewallLevel = config.firewallLevel;
        gameState.securityLevel = config.securityLevel;
        gameState.users = 12;
        gameState.devices = 8;
        gameState.score = 0;
        gameState.threatsDetected = 0;
        gameState.threatsMissed = 0;

        // Reset upgrades
        gameState.upgrades.firewall = false;
        gameState.upgrades.antivirus = false;
        gameState.upgrades.training = false;
        gameState.upgrades.backup = false;
        gameState.backupEnabled = false;

        // Reset attack chain
        gameState.attackChain.active = false;
        gameState.attackChain.stage = null;

        // Reset employees to initial values
        gameState.employees = [
            { name: 'Rahul Sharma', awareness: 90 },
            { name: 'Amit Verma', awareness: 45 },
            { name: 'Priya Singh', awareness: 20 }
        ];

        // Reset event history
        gameState.eventHistory = [];

        // PART 7 — UPDATE MODE INDICATOR
        updateModeIndicator();
    }

    // PART 7 — UPDATE MODE INDICATOR: Enhanced updateModeIndicator
    function updateModeIndicator() {
        const modeIndicator = document.getElementById('mode-indicator');
        if (modeIndicator) {
            const config = modeConfigs[gameState.gameMode];
            if (config) {
                modeIndicator.innerHTML = `MODE: ${config.icon} ${config.name}`;
                modeIndicator.style.color = config.color;
            }
        }
    }

    // PART 1 — START GAME -> MODE SELECTION: Enhanced flow
    if (startGameBtn) {
        startGameBtn.addEventListener('click', (event) => {
            event.preventDefault();
            console.log('🎮 START GAME clicked - showing mode selection screen');

            // Visual feedback on button click
            const originalText = startGameBtn.innerText;
            startGameBtn.innerText = 'INITIALIZING...';
            startGameBtn.style.pointerEvents = 'none';

            setTimeout(() => {
                // Transition to mode selection screen
                landingScreen.style.display = 'none';
                modeSelectionScreen.style.display = 'block';

                // Reset button for later
                startGameBtn.innerText = originalText;
                startGameBtn.style.pointerEvents = 'auto';
            }, 600);
        });
    }

    // PART 1 — MODE SELECTION BUTTONS: Enhanced mode selection
    const modeButtons = document.querySelectorAll('.mode-card button');
    modeButtons.forEach(btn => {
        btn.addEventListener('click', (event) => {
            const selectedMode = event.target.dataset.mode;
            console.log(`🎮 Mode selected: ${selectedMode.toUpperCase()}`);

            // Visual feedback
            event.target.innerText = 'LOADING...';
            event.target.style.pointerEvents = 'none';

            setTimeout(() => {
                // Initialize game with selected mode
                initializeGameMode(selectedMode);

                // Transition to dashboard
                modeSelectionScreen.style.display = 'none';
                dashboardScreen.style.display = 'block';

                // Update dashboard with mode settings
                updateDashboard();
                renderEmployees();

                // Reset button
                event.target.innerText = 'SELECT MODE';
                event.target.style.pointerEvents = 'auto';
            }, 600);
        });
    });

    // PART 8 — MODE INFORMATION: Display mode information on selection screen
    const modeInfos = document.querySelectorAll('.mode-card .mode-info');
    if (modeInfos.length === 0) {
        // Add mode information if not already present
        const modeCards = document.querySelectorAll('.mode-card');
        modeCards.forEach(card => {
            const button = card.querySelector('button');
            if (button) {
                const dataMode = button.dataset.mode;
                const config = modeConfigs[dataMode];
                if (config) {
                    const infoDiv = document.createElement('div');
                    infoDiv.className = 'mode-info';
                    infoDiv.style.cssText = 'text-align: left; margin-bottom: 1.5rem; font-size: 0.9rem; color: var(--text-muted);';
                    infoDiv.innerHTML = `
                        <p>• Starting Budget: ₹${config.budget.toLocaleString()}</p>
                        <p>• Starting Security: ${config.securityLevel}%</p>
                        <p>• Damage: ${(config.damageMultiplier * 100).toFixed(0)}%</p>
                    `;
                    button.insertBefore(infoDiv, button.firstChild);
                }
            }
        });
    }

    // PART 9 — GAME OVER: Enhanced game over screen
    if (gameState.health <= 0) {
        const config = modeConfigs[gameState.gameMode];
        const gameOverElement = document.createElement('div');
        gameOverElement.innerHTML = `
            <div style="background: rgba(239, 68, 68, 0.1); padding: 2rem; border: 2px solid var(--danger); text-align: center; margin-top: 2rem;">
                <p class="alert-text" style="font-size: 2rem;">💀 NETWORK COMPROMISED</p>
                <p style="font-size: 1.5rem; margin-top: 0.5rem; color: var(--text-main);">GAME OVER</p>
                <p style="font-size: 1.2rem; margin-top: 1rem; color: ${config ? config.color : '#f59e0b'};">MODE: ${config ? config.icon + ' ' + config.name : 'SURVIVAL'}</p>
                <p style="font-size: 1.2rem; color: var(--text-muted);">FINAL SCORE: ${gameState.score}</p>
            </div>
        `;
        incidentDisplay.innerHTML = '';
        incidentDisplay.appendChild(gameOverElement);
        addLog('[SYSTEM] Network Compromised. Game Over.');
    }

    return {
        getDifficultyMultiplier,
        applyDamage,
        initializeGameMode,
        updateModeIndicator
    };
}

// Initialize STEP 17 when the app loads
if (typeof gameState !== 'undefined') {
    const step17 = addSTEP17Logic();
    console.log('🎮 STEP 17: Game Modes implemented successfully!');
}