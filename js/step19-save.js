// =============================================
// STEP 19 — SAVE / RESUME SYSTEM
// Fully self-contained. Works with whatever
// global state the game has established.
// =============================================

(function () {
    'use strict';

    const SAVE_KEY = 'cyberAttackSurvivalSave';

    // ─────────────────────────────────────────
    // REQUIRED FIELDS — must exist for a valid save
    // ─────────────────────────────────────────
    const REQUIRED_FIELDS = [
        'gameMode', 'health', 'budget', 'score',
        'securityLevel', 'threatsDetected', 'threatsMissed'
    ];

    // ─────────────────────────────────────────
    // PART 8 — SAVE INDICATOR
    // ─────────────────────────────────────────
    function flashSaveIndicator() {
        const el = document.getElementById('save-indicator');
        if (!el) return;
        el.style.opacity = '1';
        clearTimeout(el._hideTimer);
        el._hideTimer = setTimeout(() => { el.style.opacity = '0'; }, 2000);
    }

    // ─────────────────────────────────────────
    // PART 2 — SAVE FUNCTION
    // ─────────────────────────────────────────
    function saveGame() {
        try {
            if (typeof gameState === 'undefined' || !gameState) return;
            // Only save when a game mode has been selected
            if (!gameState.gameMode) return;

            const saveData = {
                // Core state
                gameMode:        gameState.gameMode,
                health:          gameState.health         !== undefined ? gameState.health         : 100,
                maxHealth:       gameState.maxHealth      !== undefined ? gameState.maxHealth      : 100,
                budget:          gameState.budget         !== undefined ? gameState.budget         : 50000,
                staff:           gameState.staff          !== undefined ? gameState.staff          : 2,
                firewallLevel:   gameState.firewallLevel  !== undefined ? gameState.firewallLevel  : 1,
                securityLevel:   gameState.securityLevel  !== undefined ? gameState.securityLevel  : 40,
                users:           gameState.users          !== undefined ? gameState.users          : 12,
                devices:         gameState.devices        !== undefined ? gameState.devices        : 8,
                score:           gameState.score          !== undefined ? gameState.score          : 0,
                threatsDetected: gameState.threatsDetected || 0,
                threatsMissed:   gameState.threatsMissed  || 0,
                backupEnabled:   gameState.backupEnabled  === true,
                isGameOver:      gameState.health <= 0,

                // Deep-copy nested objects safely
                employees:    safeClone(gameState.employees,   []),
                upgrades:     safeClone(gameState.upgrades,    { firewall: false, antivirus: false, training: false, backup: false }),
                attackChain:  safeClone(gameState.attackChain, { active: false, stage: null }),
                eventHistory: safeClone(gameState.eventHistory, []),

                // Security log — read from DOM and store as plain HTML array
                securityLog: getSecurityLogEntries(),

                timestamp: new Date().toISOString()
            };

            localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
            flashSaveIndicator();
        } catch (e) {
            // Fail silently — localStorage may be unavailable (private mode, quota, etc.)
            console.warn('[Step19] saveGame failed:', e);
        }
    }

    function safeClone(value, fallback) {
        try {
            return (value !== undefined && value !== null)
                ? JSON.parse(JSON.stringify(value))
                : fallback;
        } catch (_) {
            return fallback;
        }
    }

    // Read current log entries from the DOM as HTML strings
    function getSecurityLogEntries() {
        const logEl = document.getElementById('security-log');
        if (!logEl) return [];
        const entries = logEl.querySelectorAll('.log-entry');
        const result = [];
        entries.forEach(el => result.push(el.innerHTML));
        return result;
    }

    // ─────────────────────────────────────────
    // PART 6 — LOAD + VALIDATE SAVE
    // ─────────────────────────────────────────
    function loadSave() {
        try {
            const raw = localStorage.getItem(SAVE_KEY);
            if (!raw) return null;

            const parsed = JSON.parse(raw);
            if (!parsed || typeof parsed !== 'object') throw new Error('Not an object');

            // Validate all required fields
            for (const field of REQUIRED_FIELDS) {
                if (parsed[field] === undefined || parsed[field] === null) {
                    throw new Error('Missing required field: ' + field);
                }
            }

            // Sanity-check value ranges
            if (typeof parsed.health !== 'number' || parsed.health < 0 || parsed.health > 200) throw new Error('Invalid health');
            if (typeof parsed.score !== 'number' || parsed.score < 0) throw new Error('Invalid score');
            if (!['training', 'survival', 'hardcore'].includes(parsed.gameMode)) throw new Error('Unknown gameMode: ' + parsed.gameMode);

            return parsed;
        } catch (e) {
            console.warn('[Step19] Invalid save detected, removing:', e.message);
            try { localStorage.removeItem(SAVE_KEY); } catch (_) {}
            return null;
        }
    }

    // ─────────────────────────────────────────
    // PART 5 — RESTORE GAME STATE
    // ─────────────────────────────────────────
    function restoreGame(saved) {
        if (!saved || typeof gameState === 'undefined') return false;
        try {
            gameState.gameMode        = saved.gameMode;
            gameState.health          = saved.health;
            gameState.maxHealth       = saved.maxHealth      || 100;
            gameState.budget          = saved.budget;
            gameState.staff           = saved.staff          !== undefined ? saved.staff : 2;
            gameState.firewallLevel   = saved.firewallLevel  || 1;
            gameState.securityLevel   = saved.securityLevel;
            gameState.users           = saved.users          || 12;
            gameState.devices         = saved.devices        || 8;
            gameState.score           = saved.score;
            gameState.threatsDetected = saved.threatsDetected || 0;
            gameState.threatsMissed   = saved.threatsMissed  || 0;
            gameState.backupEnabled   = saved.backupEnabled  === true;

            if (Array.isArray(saved.employees) && saved.employees.length > 0) {
                gameState.employees = saved.employees;
            }
            if (saved.upgrades && typeof saved.upgrades === 'object') {
                gameState.upgrades = saved.upgrades;
            }
            if (saved.attackChain && typeof saved.attackChain === 'object') {
                gameState.attackChain = saved.attackChain;
            }
            if (Array.isArray(saved.eventHistory)) {
                gameState.eventHistory = saved.eventHistory;
            }

            return true;
        } catch (e) {
            console.warn('[Step19] restoreGame error:', e);
            return false;
        }
    }

    // Restore DOM to match the loaded state
    function restoreDom(saved) {
        try {
            callIfExists('updateDashboard');
            restoreSecurityLog(saved.securityLog);
            callIfExists('renderEmployees');
            restoreModeIndicator(saved.gameMode);
            callIfExists('updateEventHistory');
            callIfExists('updateUpgradeButtons');

            if (saved.isGameOver || saved.health <= 0) {
                showRestoredGameOver();
            }
        } catch (e) {
            console.warn('[Step19] restoreDom error:', e);
        }
    }

    function callIfExists(name) {
        if (typeof window[name] === 'function') {
            try { window[name](); } catch (e) { console.warn('[Step19] ' + name + '() error:', e); }
        }
    }

    function restoreSecurityLog(entries) {
        const logEl = document.getElementById('security-log');
        if (!logEl) return;
        if (!Array.isArray(entries) || entries.length === 0) return;
        logEl.innerHTML = entries
            .map(html => '<div class="log-entry">' + html + '</div>')
            .join('');
    }

    function restoreModeIndicator(mode) {
        const el = document.getElementById('mode-indicator');
        if (!el) return;
        const icons = { training: '🟢', survival: '🟡', hardcore: '🔴' };
        const names = { training: 'TRAINING', survival: 'SURVIVAL', hardcore: 'HARDCORE' };
        el.textContent = 'MODE: ' + (icons[mode] || '🟡') + ' ' + (names[mode] || 'SURVIVAL');
    }

    function showRestoredGameOver() {
        const display = document.getElementById('incident-display');
        if (display) {
            display.innerHTML = '<div style="background:rgba(239,68,68,0.1);padding:1.5rem;border:1px solid var(--danger);text-align:center;"><p class="alert-text" style="font-size:1.8rem;">💀 NETWORK COMPROMISED</p><p style="font-size:1.2rem;margin-top:0.5rem;color:var(--text-main);">GAME OVER</p><p style="margin-top:1rem;color:var(--text-muted);font-size:0.9rem;">This session ended. Start a New Game to play again.</p></div>';
        }
        const initialBtns = document.getElementById('initial-incident-btns');
        if (initialBtns) initialBtns.style.display = 'none';
        const actions = document.getElementById('incident-actions');
        if (actions) actions.innerHTML = '';
        const networkStatus = document.getElementById('network-status');
        if (networkStatus) {
            networkStatus.textContent = 'NETWORK COMPROMISED';
            networkStatus.className = 'alert-text';
        }
    }

    // ─────────────────────────────────────────
    // PART 7 — NEW GAME CONFIRMATION MODAL
    // ─────────────────────────────────────────
    function confirmNewGame(onConfirmed) {
        if (localStorage.getItem(SAVE_KEY)) {
            showNewGameModal(onConfirmed);
        } else {
            onConfirmed();
        }
    }

    function showNewGameModal(onConfirmed) {
        const existing = document.getElementById('s19-new-game-modal');
        if (existing && existing.parentNode) existing.parentNode.removeChild(existing);

        const modal = document.createElement('div');
        modal.id = 's19-new-game-modal';
        modal.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.85);display:flex;align-items:center;justify-content:center;';
        modal.innerHTML = '<div style="background:#0f172a;border:1px solid rgba(16,185,129,0.4);border-radius:8px;padding:2rem;max-width:420px;width:90%;text-align:center;font-family:var(--font-mono,monospace);"><p style="color:#f8fafc;font-size:1.1rem;margin-bottom:1.5rem;">Start a new game?<br><span style="color:#ef4444;font-size:0.95rem;">Your current saved progress will be deleted.</span></p><div style="display:flex;gap:1rem;justify-content:center;"><button id="s19-confirm-new" style="background:rgba(239,68,68,0.15);border:1px solid #ef4444;color:#ef4444;padding:0.8rem 1.5rem;cursor:pointer;border-radius:4px;font-size:1rem;font-family:inherit;">START NEW GAME</button><button id="s19-cancel-new" style="background:rgba(16,185,129,0.05);border:1px solid rgba(16,185,129,0.4);color:#10b981;padding:0.8rem 1.5rem;cursor:pointer;border-radius:4px;font-size:1rem;font-family:inherit;">CANCEL</button></div></div>';

        document.body.appendChild(modal);

        document.getElementById('s19-confirm-new').addEventListener('click', function () {
            if (modal.parentNode) modal.parentNode.removeChild(modal);
            localStorage.removeItem(SAVE_KEY);
            onConfirmed();
        });
        document.getElementById('s19-cancel-new').addEventListener('click', function () {
            if (modal.parentNode) modal.parentNode.removeChild(modal);
        });
    }

    // ─────────────────────────────────────────
    // PART 4 — LANDING SCREEN: RESUME / NEW GAME
    // ─────────────────────────────────────────
    function updateLandingScreen() {
        const landingMain = document.querySelector('#landing-screen .main-content');
        if (!landingMain) return;

        // Remove previously-injected buttons
        ['s19-resume-btn', 's19-new-game-btn'].forEach(function (id) {
            var old = document.getElementById(id);
            if (old && old.parentNode) old.parentNode.removeChild(old);
        });

        const hasSave = !!localStorage.getItem(SAVE_KEY);
        const startBtn = document.getElementById('start-game-btn');

        if (hasSave) {
            // Hide original START GAME — replaced by RESUME + NEW GAME
            if (startBtn) startBtn.style.display = 'none';

            // ▶ RESUME GAME
            const resumeBtn = document.createElement('button');
            resumeBtn.id = 's19-resume-btn';
            resumeBtn.className = 'cyber-button';
            resumeBtn.style.cssText = 'margin-top:0.8rem;font-size:1.1rem;display:block;width:100%;max-width:320px;margin-left:auto;margin-right:auto;';
            resumeBtn.textContent = '▶ RESUME GAME';
            resumeBtn.addEventListener('click', function () {
                const saved = loadSave();
                if (!saved) {
                    // Invalid save — reset UI
                    updateLandingScreen();
                    return;
                }
                if (!restoreGame(saved)) return;

                document.getElementById('landing-screen').style.display = 'none';
                const modeSel = document.getElementById('mode-selection-screen');
                if (modeSel) modeSel.style.display = 'none';
                document.getElementById('dashboard-screen').style.display = 'block';

                // DOM restore runs after the screen is visible
                setTimeout(function () { restoreDom(saved); }, 50);
            });
            landingMain.appendChild(resumeBtn);

            // NEW GAME (subdued)
            const newBtn = document.createElement('button');
            newBtn.id = 's19-new-game-btn';
            newBtn.className = 'cyber-button';
            newBtn.style.cssText = 'margin-top:0.5rem;font-size:0.95rem;display:block;width:100%;max-width:320px;margin-left:auto;margin-right:auto;background:transparent;border-color:rgba(100,116,139,0.5);color:var(--text-muted,#64748b);';
            newBtn.textContent = 'NEW GAME';
            newBtn.addEventListener('click', function () {
                confirmNewGame(function () {
                    document.getElementById('landing-screen').style.display = 'none';
                    const modeSel = document.getElementById('mode-selection-screen');
                    if (modeSel) modeSel.style.display = 'block';
                });
            });
            landingMain.appendChild(newBtn);

        } else {
            // No save — show original button
            if (startBtn) startBtn.style.display = '';
        }
    }

    // ─────────────────────────────────────────
    // PART 3 — AUTO-SAVE HOOKS via event delegation
    // ─────────────────────────────────────────
    function hookAutoSave() {
        // Mode selection → save after mode initializes (~600ms delay in game logic)
        document.querySelectorAll('.mode-card button[data-mode]').forEach(function (btn) {
            btn.addEventListener('click', function () { setTimeout(saveGame, 800); });
        });

        // Incident decisions (injected dynamically — use delegation)
        var incidentActions = document.getElementById('incident-actions');
        if (incidentActions) {
            incidentActions.addEventListener('click', function (e) {
                if (e.target && e.target.matches('.action-btn')) {
                    setTimeout(saveGame, 400);
                }
            });
        }

        // Upgrade purchase buttons
        document.querySelectorAll('.upgrade-btn').forEach(function (btn) {
            btn.addEventListener('click', function () { setTimeout(saveGame, 300); });
        });

        // Random event button
        var eventBtn = document.getElementById('generate-event-btn');
        if (eventBtn) {
            eventBtn.addEventListener('click', function () { setTimeout(saveGame, 500); });
        }

        // Employee training (injected dynamically — use delegation)
        var employeeList = document.getElementById('employee-list');
        if (employeeList) {
            employeeList.addEventListener('click', function (e) {
                var target = e.target && (e.target.tagName === 'BUTTON' ? e.target : e.target.closest('button'));
                if (target) setTimeout(saveGame, 400);
            });
        }

        // Random event actions (injected dynamically — use delegation)
        var eventDisplay = document.getElementById('current-event-display');
        if (eventDisplay) {
            eventDisplay.addEventListener('click', function (e) {
                var target = e.target && (e.target.tagName === 'BUTTON' ? e.target : e.target.closest('button'));
                if (target) setTimeout(saveGame, 400);
            });
        }

        // Simulate Incident button
        var simBtn = document.getElementById('simulate-incident-btn');
        if (simBtn) {
            simBtn.addEventListener('click', function () { setTimeout(saveGame, 300); });
        }
    }

    // Expose globally immediately
    window.saveGame = saveGame;
    window.loadSave = loadSave;
    window.restoreGame = restoreGame;

    // ─────────────────────────────────────────
    // INIT
    // ─────────────────────────────────────────
    function init() {
        updateLandingScreen();
        hookAutoSave();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () { setTimeout(init, 50); });
    } else {
        setTimeout(init, 50);
    }

})();