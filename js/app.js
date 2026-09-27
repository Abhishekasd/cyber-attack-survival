// Sound Synthesizer Engine (Web Audio API - Zero External Files)
window.soundEngine = {
    muted: false,
    ctx: null,
    getCtx: function() {
        if (!this.ctx && typeof AudioContext !== 'undefined') {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) this.ctx = new AudioCtx();
        }
        return this.ctx;
    },
    playTone: function(freq, type, duration, vol) {
        if (this.muted) return;
        try {
            const ctx = this.getCtx();
            if (!ctx) return;
            if (ctx.state === 'suspended') ctx.resume();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = type || 'sine';
            osc.frequency.setValueAtTime(freq, ctx.currentTime);
            gain.gain.setValueAtTime(vol || 0.08, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + duration);
        } catch (_) {}
    },
    playClick: function() { this.playTone(800, 'sine', 0.05, 0.04); },
    playSuccess: function() {
        this.playTone(523.25, 'triangle', 0.1, 0.08);
        setTimeout(() => this.playTone(659.25, 'triangle', 0.15, 0.08), 80);
    },
    playAlarm: function() {
        this.playTone(320, 'sawtooth', 0.12, 0.06);
        setTimeout(() => this.playTone(240, 'sawtooth', 0.18, 0.06), 100);
    },
    playDamage: function() {
        this.playTone(140, 'square', 0.2, 0.08);
    },
    playUpgrade: function() {
        this.playTone(440, 'sine', 0.08, 0.06);
        setTimeout(() => this.playTone(880, 'sine', 0.15, 0.06), 70);
    }
};

// Global Game State
window.gameState = {
    gameMode: 'survival',
    health: 100,
    maxHealth: 100,
    budget: 50000,
    staff: 2,
    firewallLevel: 1,
    securityLevel: 40,
    users: 12,
    devices: 8,
    score: 0,
    threatsDetected: 0,
    threatsMissed: 0,
    backupEnabled: false,
    employees: [
        { name: 'Rahul Sharma', awareness: 90 },
        { name: 'Amit Verma', awareness: 45 },
        { name: 'Priya Singh', awareness: 20 }
    ],
    upgrades: {
        firewall: false,
        antivirus: false,
        training: false,
        backup: false
    },
    attackChain: {
        active: false,
        stage: null,
        stages: ['PHISHING', 'CREDENTIAL THEFT', 'ACCOUNT COMPROMISE', 'DATA BREACH']
    },
    eventHistory: []
};

// Global Mode Configurations
window.modeConfigs = {
    training: {
        health: 100,
        maxHealth: 100,
        budget: 60000,
        staff: 3,
        firewallLevel: 2,
        securityLevel: 50,
        icon: '🟢',
        name: 'TRAINING',
        color: '#10b981',
        damageMultiplier: 0.75
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
        color: '#f59e0b',
        damageMultiplier: 1.00
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
        color: '#ef4444',
        damageMultiplier: 1.25
    }
};

var gameState = window.gameState;
var modeConfigs = window.modeConfigs;

// Log function
window.addLog = function addLog(message) {
    const securityLog = document.getElementById('security-log');
    if (!securityLog) return;
    const time = new Date().toLocaleTimeString('en-US', { hour12: false });
    const logHtml = `<div class="log-entry"><span class="log-time">[${time}]</span> ${message}</div>`;
    securityLog.insertAdjacentHTML('afterbegin', logHtml);
};

// Update Threat Level UI
window.updateThreatLevel = function updateThreatLevel(threatName, level) {
    const threats = document.querySelectorAll('.threat-list li');
    threats.forEach(li => {
        if (li.firstElementChild && li.firstElementChild.textContent.trim().toLowerCase() === threatName.toLowerCase()) {
            li.lastElementChild.textContent = level;
            if (level === 'HIGH') li.lastElementChild.className = 'alert-text';
            else if (level === 'MEDIUM') li.lastElementChild.style.color = '#f59e0b';
            else li.lastElementChild.className = 'threat-none';
        }
    });
};

// Update Dashboard UI
window.updateDashboard = function updateDashboard() {
    if (!gameState) return;
    const valHealth = document.getElementById('val-health');
    if (valHealth) valHealth.textContent = `${gameState.health} / ${gameState.maxHealth}`;
    
    const valBudget = document.getElementById('val-budget');
    if (valBudget) valBudget.textContent = `₹${gameState.budget.toLocaleString('en-IN')}`;
    
    const valUsers = document.getElementById('val-users');
    if (valUsers) valUsers.textContent = gameState.users;
    
    const valDevices = document.getElementById('val-devices');
    if (valDevices) valDevices.textContent = gameState.devices;
    
    const valSecurity = document.getElementById('val-security');
    if (valSecurity) valSecurity.textContent = `${gameState.securityLevel}%`;
    
    const valStaff = document.getElementById('val-staff');
    if (valStaff) valStaff.textContent = gameState.staff;

    const netStatus = document.getElementById('network-status');
    if (netStatus) {
        if (gameState.health <= 0) {
            netStatus.textContent = 'NETWORK COMPROMISED';
            netStatus.className = 'alert-text';
        } else {
            netStatus.textContent = 'NETWORK SECURE';
            netStatus.className = 'status-secure';
        }
    }

    const healthValEl = document.getElementById('val-health');
    if (healthValEl) {
        const cardEl = healthValEl.closest('.status-card');
        if (cardEl) {
            cardEl.classList.remove('status-card-good', 'status-card-warning', 'status-card-danger');
            if (gameState.health >= 70) {
                cardEl.classList.add('status-card-good');
            } else if (gameState.health >= 40) {
                cardEl.classList.add('status-card-warning');
            } else {
                cardEl.classList.add('status-card-danger');
            }
        }
    }

    const barHealth = document.getElementById('bar-health');
    if (barHealth) {
        const pct = Math.max(0, Math.min(100, gameState.health));
        barHealth.style.width = pct + '%';
        if (pct >= 70) barHealth.style.backgroundColor = '#10b981';
        else if (pct >= 40) barHealth.style.backgroundColor = '#f59e0b';
        else barHealth.style.backgroundColor = '#ef4444';
    }

    const barSecurity = document.getElementById('bar-security');
    if (barSecurity) {
        barSecurity.style.width = Math.max(0, Math.min(100, gameState.securityLevel)) + '%';
    }
};

// Employee Risk Level
window.getEmployeeRisk = function getEmployeeRisk(awareness) {
    if (awareness >= 70) return 'LOW';
    if (awareness >= 40) return 'MEDIUM';
    return 'HIGH';
};

// Render Employee Cards
window.renderEmployees = function renderEmployees() {
    const listEl = document.getElementById('employee-list');
    if (!listEl || !gameState.employees) return;

    listEl.innerHTML = '';
    gameState.employees.forEach((emp, index) => {
        const risk = getEmployeeRisk(emp.awareness);
        const card = document.createElement('div');
        card.className = 'employee-card';
        card.style.cssText = 'padding:0.6rem;margin-bottom:0.5rem;background:rgba(0,0,0,0.3);border:1px solid rgba(16,185,129,0.2);border-radius:4px;';
        
        const riskColor = risk === 'LOW' ? '#10b981' : risk === 'MEDIUM' ? '#f59e0b' : '#ef4444';
        
        card.innerHTML = `
            <div style="display:flex;justify-content:space-between;margin-bottom:0.3rem;">
                <strong>${emp.name}</strong>
                <span>Awareness: ${emp.awareness}%</span>
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;">
                <span style="color:${riskColor};font-size:0.85rem;font-weight:bold;">Risk: ${risk}</span>
                <button class="cyber-button small-btn train-emp-btn" data-index="${index}" style="padding:0.3rem 0.6rem;font-size:0.8rem;">TRAIN (₹5,000)</button>
            </div>
        `;
        listEl.appendChild(card);
    });

    listEl.querySelectorAll('.train-emp-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const idx = parseInt(e.target.dataset.index);
            trainEmployee(idx);
        });
    });
};

// Train Employee
window.trainEmployee = function trainEmployee(index) {
    if (!gameState.employees || !gameState.employees[index]) return;
    const cost = 5000;
    if (gameState.budget < cost) {
        addLog('[TRAINING] Insufficient budget for employee training.');
        if (window.soundEngine) soundEngine.playDamage();
        return;
    }
    const emp = gameState.employees[index];
    if (emp.awareness >= 100) {
        addLog(`[TRAINING] ${emp.name} already has maximum awareness.`);
        return;
    }
    gameState.budget -= cost;
    emp.awareness = Math.min(100, emp.awareness + 25);
    if (window.soundEngine) soundEngine.playUpgrade();
    updateDashboard();
    renderEmployees();
    addLog(`[TRAINING] ${emp.name} trained! Awareness increased to ${emp.awareness}%.`);
    if (typeof saveGame === 'function') saveGame();
};

// Update Upgrade Buttons
window.updateUpgradeButtons = function updateUpgradeButtons() {
    if (!gameState.upgrades) return;
    const fwBtn = document.getElementById('upgrade-firewall');
    if (fwBtn && gameState.upgrades.firewall) {
        fwBtn.disabled = true;
        const s = fwBtn.querySelector('span');
        if (s) s.textContent = 'FIREWALL UPGRADED';
        else fwBtn.textContent = 'FIREWALL UPGRADED';
    }
    const avBtn = document.getElementById('upgrade-antivirus');
    if (avBtn && gameState.upgrades.antivirus) {
        avBtn.disabled = true;
        const s = avBtn.querySelector('span');
        if (s) s.textContent = 'ANTIVIRUS INSTALLED';
        else avBtn.textContent = 'ANTIVIRUS INSTALLED';
    }
    const trBtn = document.getElementById('upgrade-training');
    if (trBtn && gameState.upgrades.training) {
        trBtn.disabled = true;
        const s = trBtn.querySelector('span');
        if (s) s.textContent = 'TRAINING COMPLETE';
        else trBtn.textContent = 'TRAINING COMPLETE';
    }
    const bkBtn = document.getElementById('upgrade-backup');
    if (bkBtn && (gameState.upgrades.backup || gameState.backupEnabled)) {
        bkBtn.disabled = true;
        const s = bkBtn.querySelector('span');
        if (s) s.textContent = 'BACKUP ACTIVE';
        else bkBtn.textContent = 'BACKUP ACTIVE';
    }
};

// Purchase Upgrade
window.purchaseUpgrade = function purchaseUpgrade(type) {
    if (!gameState.upgrades) return;
    const costs = {
        firewall: 15000,
        antivirus: 10000,
        training: 8000,
        backup: 12000
    };
    const cost = costs[type];
    if (cost === undefined) return;

    if (gameState.budget < cost) {
        addLog(`[UPGRADE] Insufficient budget for ${type.toUpperCase()}. Required: ₹${cost.toLocaleString()}`);
        if (window.soundEngine) soundEngine.playDamage();
        return;
    }

    if (gameState.upgrades[type]) {
        addLog(`[UPGRADE] ${type.toUpperCase()} already purchased.`);
        return;
    }

    gameState.budget -= cost;
    gameState.upgrades[type] = true;
    if (window.soundEngine) soundEngine.playUpgrade();

    if (type === 'firewall') {
        gameState.firewallLevel += 1;
        gameState.securityLevel = Math.min(100, gameState.securityLevel + 15);
        addLog('[UPGRADE] Firewall upgraded to Level ' + gameState.firewallLevel + '! Security +15%');
    } else if (type === 'antivirus') {
        gameState.securityLevel = Math.min(100, gameState.securityLevel + 10);
        addLog('[UPGRADE] Antivirus installed! Security +10%');
    } else if (type === 'training') {
        gameState.employees.forEach(emp => { emp.awareness = Math.min(100, emp.awareness + 15); });
        gameState.securityLevel = Math.min(100, gameState.securityLevel + 10);
        addLog('[UPGRADE] All employees received security awareness training! Security +10%');
        renderEmployees();
    } else if (type === 'backup') {
        gameState.backupEnabled = true;
        gameState.securityLevel = Math.min(100, gameState.securityLevel + 5);
        addLog('[UPGRADE] Automated Backup system activated! Security +5%');
    }

    updateDashboard();
    updateUpgradeButtons();
    if (typeof saveGame === 'function') saveGame();
};

// Update Event History
window.updateEventHistory = function updateEventHistory() {
    const historyEl = document.getElementById('event-history');
    if (!historyEl || !gameState.eventHistory) return;
    if (gameState.eventHistory.length === 0) {
        historyEl.innerHTML = '<p style="color: var(--text-muted); font-size: 0.85rem;">No events yet.</p>';
        return;
    }
    historyEl.innerHTML = gameState.eventHistory.map(evt => `
        <div style="padding:0.4rem;border-bottom:1px solid rgba(16,185,129,0.1);font-size:0.85rem;">
            <strong style="color:#10b981;">${evt.title}</strong>: ${evt.result}
        </div>
    `).join('');
};

// Difficulty Multiplier
window.getDifficultyMultiplier = function getDifficultyMultiplier(mode) {
    const targetMode = mode || (gameState ? gameState.gameMode : 'survival');
    switch (targetMode) {
        case 'training': return 0.75;
        case 'survival': return 1.00;
        case 'hardcore': return 1.25;
        default: return 1.00;
    }
};

// Apply Damage Helper
window.applyDamage = function applyDamage(amount, reason) {
    const multiplier = getDifficultyMultiplier();
    const adjustedDamage = Math.round(amount * multiplier);
    gameState.health = Math.max(0, Math.min(100, gameState.health - adjustedDamage));
    updateDashboard();
    if (window.soundEngine) soundEngine.playDamage();
    if (reason) {
        addLog(`[DAMAGE] ${reason} dealt ${adjustedDamage} damage (${amount} × ${multiplier})`);
    }
    if (gameState.health <= 0) {
        handleGameOver();
    }
    return adjustedDamage;
};

// Initialize Game Mode
window.initializeGameMode = function initializeGameMode(mode) {
    const config = modeConfigs[mode] || modeConfigs['survival'];
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
    gameState.backupEnabled = false;

    gameState.upgrades = { firewall: false, antivirus: false, training: false, backup: false };
    gameState.attackChain = { active: false, stage: null, stages: ['PHISHING', 'CREDENTIAL THEFT', 'ACCOUNT COMPROMISE', 'DATA BREACH'] };
    gameState.employees = [
        { name: 'Rahul Sharma', awareness: 90 },
        { name: 'Amit Verma', awareness: 45 },
        { name: 'Priya Singh', awareness: 20 }
    ];
    gameState.eventHistory = [];

    const logEl = document.getElementById('security-log');
    if (logEl) logEl.innerHTML = '';

    const eventDisplay = document.getElementById('current-event-display');
    if (eventDisplay) eventDisplay.innerHTML = '<p style="color: var(--text-muted); font-size: 0.9rem;">No event generated yet.</p>';
    
    const incidentDisplay = document.getElementById('incident-display');
    if (incidentDisplay) incidentDisplay.innerHTML = '<p>No active incident.</p><p>Waiting for incoming security events...</p>';
    
    const incidentActions = document.getElementById('incident-actions');
    if (incidentActions) incidentActions.innerHTML = '';
    
    const initialBtns = document.getElementById('initial-incident-btns');
    if (initialBtns) initialBtns.style.display = 'flex';
    
    updateDashboard();
    renderEmployees();
    updateModeIndicator();
    updateEventHistory();
    updateUpgradeButtons();
    
    addLog(`[SYSTEM] Initialized ${config.name} mode.`);
    if (typeof saveGame === 'function') saveGame();
};

// Update Mode Indicator
window.updateModeIndicator = function updateModeIndicator() {
    const modeIndicator = document.getElementById('mode-indicator');
    if (modeIndicator && gameState) {
        const config = modeConfigs[gameState.gameMode] || modeConfigs['survival'];
        modeIndicator.innerHTML = `MODE: ${config.icon} ${config.name}`;
        modeIndicator.style.color = config.color;
    }
};

// PART 18 - FINAL SECURITY REPORT SYSTEM
window.calculateFinalScore = function calculateFinalScore() {
    let finalScore = gameState.score;
    if (gameState.health >= 90) finalScore += 500;
    else if (gameState.health >= 70) finalScore += 300;
    else if (gameState.health >= 40) finalScore += 100;

    if (gameState.securityLevel >= 80) finalScore += 500;
    else if (gameState.securityLevel >= 60) finalScore += 300;
    else if (gameState.securityLevel >= 40) finalScore += 100;

    finalScore += gameState.threatsDetected * 100;
    finalScore -= gameState.threatsMissed * 150;
    return Math.max(0, finalScore);
};

window.getPerformanceRating = function getPerformanceRating(finalScore) {
    if (finalScore >= 5000) return "ELITE DEFENDER";
    if (finalScore >= 3500) return "SECURITY EXPERT";
    if (finalScore >= 2000) return "SKILLED DEFENDER";
    if (finalScore >= 1000) return "ROOKIE DEFENDER";
    return "NETWORK LIABILITY";
};

window.getStarRating = function getStarRating(finalScore) {
    if (finalScore >= 5000) return "⭐⭐⭐⭐⭐";
    if (finalScore >= 3500) return "⭐⭐⭐⭐";
    if (finalScore >= 2000) return "⭐⭐⭐";
    if (finalScore >= 1000) return "⭐⭐";
    return "⭐";
};

window.generateFinalSecurityReport = function generateFinalSecurityReport() {
    const reportContainer = document.createElement('div');
    reportContainer.className = 'final-report-container';
    reportContainer.style.cssText = 'margin-top:1.5rem;padding:1.5rem;border:1px solid #4a4a4a;border-radius:6px;background:rgba(0,0,0,0.6);color:#f8f8f8;font-size:0.95rem;';

    const config = modeConfigs[gameState.gameMode];
    const modeText = config ? `${config.icon} ${config.name}` : 'UNKNOWN';
    const finalScore = calculateFinalScore();
    const performanceRating = getPerformanceRating(finalScore);
    const starRating = getStarRating(finalScore);

    reportContainer.innerHTML = `
        <div class="report-header" style="margin-bottom: 1.5rem; text-align: center;">
            <h3>📊 FINAL SECURITY REPORT</h3>
        </div>

        <div style="display: flex; flex-direction: column; gap: 0.8rem; margin-bottom: 1.5rem;">
            <div style="display: flex; gap: 0.5rem;"><strong>MODE:</strong> <span style="color: ${config?.color || '#f59e0b'};">${modeText}</span></div>
            <div style="display: flex; gap: 0.5rem;"><strong>FINAL SCORE:</strong> <span style="color: #00ff88; font-size: 1.3rem;">${finalScore.toLocaleString()}</span></div>
            <div style="display: flex; gap: 0.5rem;"><strong>PERFORMANCE:</strong> <span>${performanceRating}</span></div>
            <div style="display: flex; gap: 0.5rem;"><strong>RATING:</strong> <span>${starRating}</span></div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 0.5rem; font-size: 0.95rem;">
            <div>❤️ Final Health: ${gameState.health}/100</div>
            <div>🛡️ Final Security Level: ${gameState.securityLevel}%</div>
            <div>🎯 Threats Neutralized: ${gameState.threatsDetected}</div>
            <div>⚠️ Threats Missed: ${gameState.threatsMissed}</div>
            <div>💰 Remaining Budget: ₹${gameState.budget.toLocaleString('en-IN')}</div>
            <div>👨‍💻 Security Staff: ${gameState.staff}</div>
            <div>🔥 Firewall Level: ${gameState.firewallLevel}</div>
        </div>
    `;

    return reportContainer;
};

window.getPerformanceSummary = function getPerformanceSummary() {
    const finalScore = calculateFinalScore();
    if (gameState.health <= 0) {
        return "The network was compromised before the attack campaign could be contained.";
    }
    if (finalScore >= 5000) return "Outstanding defense. Your organization survived with elite-level security management.";
    if (finalScore >= 3500) return "Excellent defense. You handled most threats effectively.";
    if (finalScore >= 2000) return "Solid performance. Your organization survived, but there is room for improvement.";
    if (finalScore >= 1000) return "Your organization survived, but several security decisions exposed the network to risk.";
    return "Critical weaknesses were exposed. Your organization requires significant security improvements.";
};

window.getSecurityRecommendations = function getSecurityRecommendations() {
    const recommendations = [];
    if (gameState.securityLevel < 50) recommendations.push("🛡️ Upgrade your overall security infrastructure.");
    if (gameState.threatsMissed > gameState.threatsDetected) recommendations.push("🎯 Improve threat detection and incident response.");
    if (gameState.budget < 20000) recommendations.push("💰 Improve budget allocation and prioritize essential security controls.");
    if (gameState.firewallLevel <= 1) recommendations.push("🔥 Upgrade the firewall for stronger network protection.");
    const lowAwarenessCount = gameState.employees.filter(emp => emp.awareness < 50).length;
    if (lowAwarenessCount > 0) recommendations.push("👥 Increase employee cybersecurity training.");
    if (!gameState.backupEnabled) recommendations.push("💾 Install a backup system to improve ransomware recovery.");
    if (recommendations.length === 0) recommendations.push("✓ Security infrastructure was well maintained.");
    return recommendations.slice(0, 4);
};

window.generateEmployeeSecurityReport = function generateEmployeeSecurityReport() {
    const employeeList = document.createElement('div');
    employeeList.className = 'employee-report';
    employeeList.style.cssText = 'margin-top:1rem;padding:1rem;border:1px solid #4a4a4a;border-radius:4px;background:rgba(0,0,0,0.5);color:#f8f8f8;font-size:0.9rem;';
    employeeList.innerHTML = '<h4>👥 EMPLOYEE SECURITY</h4>';

    gameState.employees.forEach(employee => {
        const riskLevel = getEmployeeRisk(employee.awareness);
        const card = document.createElement('div');
        card.style.cssText = 'padding:0.4rem 0;border-bottom:1px solid #4a4a4a;';
        card.innerHTML = `
            <div style="display: flex; justify-content: space-between;">
                <strong>${employee.name}</strong>
                <span>Awareness: ${employee.awareness}%</span>
            </div>
            <div style="color: ${riskLevel === 'LOW' ? '#10b981' : riskLevel === 'MEDIUM' ? '#f59e0b' : '#ef4444'};">
                Risk: ${riskLevel}
            </div>
        `;
        employeeList.appendChild(card);
    });

    return employeeList;
};

window.getBestPerformanceMessage = function getBestPerformanceMessage() {
    if (gameState.health >= 80 && gameState.securityLevel >= 70 && gameState.threatsMissed <= gameState.threatsDetected) {
        return "🏆 EXCELLENT SECURITY MANAGEMENT";
    }
    return null;
};

// Game Over Handler
window.handleGameOver = function handleGameOver() {
    const incidentDisplay = document.getElementById('incident-display');
    if (incidentDisplay) {
        const report = generateFinalSecurityReport();
        const summary = getPerformanceSummary();
        const recs = getSecurityRecommendations();
        const empReport = generateEmployeeSecurityReport();

        incidentDisplay.innerHTML = `
            <div style="background: rgba(239, 68, 68, 0.1); padding: 1.5rem; border: 1px solid var(--danger); text-align: center;">
                <p class="alert-text" style="font-size: 1.8rem;">💀 NETWORK COMPROMISED</p>
                <p style="font-size: 1.2rem; margin-top: 0.5rem; color: var(--text-main);">GAME OVER</p>
                <p style="margin-top:0.5rem;color:var(--text-muted);">${summary}</p>
            </div>
        `;
        incidentDisplay.appendChild(report);

        const recDiv = document.createElement('div');
        recDiv.style.cssText = 'margin-top:1rem;padding:1rem;background:rgba(0,0,0,0.5);border:1px solid #4a4a4a;border-radius:4px;';
        recDiv.innerHTML = '<h4>💡 SECURITY RECOMMENDATIONS</h4>' + recs.map(r => `<div>${r}</div>`).join('');
        incidentDisplay.appendChild(recDiv);
        incidentDisplay.appendChild(empReport);
    }
    
    const initialBtns = document.getElementById('initial-incident-btns');
    if (initialBtns) initialBtns.style.display = 'none';
    const actions = document.getElementById('incident-actions');
    if (actions) actions.innerHTML = '';
    
    addLog('[SYSTEM] Network Compromised. Game Over.');
    if (typeof saveGame === 'function') saveGame();
};

// Attack Generators
window.generateRandomIncident = function generateRandomIncident() {
    const attacks = [generatePhishingIncident, generateMalwareIncident, generateWeakPasswordIncident, generateSuspiciousUsbIncident, generateRansomwareIncident];
    const pick = attacks[Math.floor(Math.random() * attacks.length)];
    pick();
};

window.generatePhishingIncident = function generatePhishingIncident() {
    if (window.soundEngine) soundEngine.playAlarm();
    const initialBtns = document.getElementById('initial-incident-btns');
    if (initialBtns) initialBtns.style.display = 'none';
    const incidentDisplay = document.getElementById('incident-display');
    const incidentActions = document.getElementById('incident-actions');

    incidentDisplay.innerHTML = `
        <p class="alert-text" style="font-size: 1.2rem;">🚨 PHISHING ATTACK DETECTED</p><br>
        <p><strong>Employee:</strong> Rahul Sharma</p>
        <p><strong>Email:</strong> IT Security Department</p>
        <p><strong>Message:</strong> "Your account will be suspended.<br>Verify your account immediately."</p>
        <p><strong>Attachment:</strong> Account_Verification.exe</p>
    `;

    incidentActions.innerHTML = `
        <button class="action-btn action-btn-danger" data-action="open">1. OPEN LINK</button>
        <button class="action-btn action-btn-safe" data-action="delete">2. DELETE EMAIL</button>
        <button class="action-btn action-btn-safe" data-action="report">3. REPORT TO SECURITY</button>
        <button class="action-btn action-btn-danger" data-action="ignore">4. IGNORE</button>
    `;

    addLog('[PHISHING] Threat detected');
    incidentActions.querySelectorAll('.action-btn').forEach(btn => {
        btn.addEventListener('click', (e) => handleDecision(e.target.dataset.action, 'Phishing'));
    });
};

window.generateMalwareIncident = function generateMalwareIncident() {
    if (window.soundEngine) soundEngine.playAlarm();
    const initialBtns = document.getElementById('initial-incident-btns');
    if (initialBtns) initialBtns.style.display = 'none';
    const incidentDisplay = document.getElementById('incident-display');
    const incidentActions = document.getElementById('incident-actions');

    incidentDisplay.innerHTML = `
        <p class="alert-text" style="font-size: 1.2rem;">🚨 MALWARE DETECTED</p><br>
        <p><strong>Device:</strong> PC-07</p>
        <p><strong>File:</strong> Salary_Increment_2026.exe</p>
        <p><strong>Message:</strong> "⚠ Suspicious executable detected."</p>
    `;

    incidentActions.innerHTML = `
        <button class="action-btn action-btn-danger" data-action="execute">1. EXECUTE</button>
        <button class="action-btn action-btn-safe" data-action="quarantine">2. QUARANTINE</button>
        <button class="action-btn action-btn-danger" data-action="ignore">3. IGNORE</button>
        <button class="action-btn action-btn-danger" data-action="send">4. SEND TO ANOTHER PC</button>
    `;

    addLog('[MALWARE] Threat detected');
    incidentActions.querySelectorAll('.action-btn').forEach(btn => {
        btn.addEventListener('click', (e) => handleDecision(e.target.dataset.action, 'Malware'));
    });
};

window.generateWeakPasswordIncident = function generateWeakPasswordIncident() {
    if (window.soundEngine) soundEngine.playAlarm();
    const initialBtns = document.getElementById('initial-incident-btns');
    if (initialBtns) initialBtns.style.display = 'none';
    const incidentDisplay = document.getElementById('incident-display');
    const incidentActions = document.getElementById('incident-actions');

    incidentDisplay.innerHTML = `
        <p class="alert-text" style="font-size: 1.2rem;">🚨 WEAK PASSWORD DETECTED</p><br>
        <p><strong>User:</strong> Amit Verma</p>
        <p><strong>Password:</strong> 123456</p>
        <p><strong>Message:</strong> "⚠ This password can be easily compromised."</p>
    `;

    incidentActions.innerHTML = `
        <button class="action-btn action-btn-danger" data-action="keep">1. KEEP PASSWORD</button>
        <button class="action-btn action-btn-safe" data-action="change">2. CHANGE PASSWORD</button>
        <button class="action-btn action-btn-safe" data-action="disable">3. DISABLE ACCOUNT</button>
        <button class="action-btn action-btn-danger" data-action="share">4. SHARE WITH ADMIN</button>
    `;

    addLog('[PASSWORD] Weak password detected');
    incidentActions.querySelectorAll('.action-btn').forEach(btn => {
        btn.addEventListener('click', (e) => handleDecision(e.target.dataset.action, 'WeakPassword'));
    });
};

window.generateSuspiciousUsbIncident = function generateSuspiciousUsbIncident() {
    if (window.soundEngine) soundEngine.playAlarm();
    const initialBtns = document.getElementById('initial-incident-btns');
    if (initialBtns) initialBtns.style.display = 'none';
    const incidentDisplay = document.getElementById('incident-display');
    const incidentActions = document.getElementById('incident-actions');

    incidentDisplay.innerHTML = `
        <p class="alert-text" style="font-size: 1.2rem;">🚨 SUSPICIOUS USB DETECTED</p><br>
        <p><strong>Employee:</strong> Priya Singh</p>
        <p><strong>Situation:</strong> "I found this USB outside the office."</p>
        <p><strong>Device:</strong> USB-UNKNOWN-04</p>
        <p><strong>Message:</strong> "⚠ Unknown devices may contain malicious software."</p>
    `;

    incidentActions.innerHTML = `
        <button class="action-btn action-btn-danger" data-action="plug">1. PLUG IT IN</button>
        <button class="action-btn action-btn-safe" data-action="scan">2. SCAN USB</button>
        <button class="action-btn action-btn-safe" data-action="format">3. FORMAT USB</button>
        <button class="action-btn action-btn-danger" data-action="give">4. GIVE TO ANOTHER EMPLOYEE</button>
    `;

    addLog('[USB] Suspicious USB device detected');
    incidentActions.querySelectorAll('.action-btn').forEach(btn => {
        btn.addEventListener('click', (e) => handleDecision(e.target.dataset.action, 'SuspiciousUSB'));
    });
};

window.generateRansomwareIncident = function generateRansomwareIncident() {
    if (window.soundEngine) soundEngine.playAlarm();
    const initialBtns = document.getElementById('initial-incident-btns');
    if (initialBtns) initialBtns.style.display = 'none';
    const incidentDisplay = document.getElementById('incident-display');
    const incidentActions = document.getElementById('incident-actions');

    incidentDisplay.innerHTML = `
        <p class="alert-text" style="font-size: 1.2rem;">🚨 RANSOMWARE CRITICAL ATTACK</p><br>
        <p><strong>Affected System:</strong> FILE-SERVER-01</p>
        <p><strong>Encrypted Files:</strong> Finance_Records_2026.lock</p>
        <p><strong>Ransom Demand:</strong> 2.5 BTC (₹5,000,000)</p>
        <p><strong>Message:</strong> "YOUR FILES ARE ENCRYPTED. PAY OR LOSE ALL DATA."</p>
    `;

    incidentActions.innerHTML = `
        <button class="action-btn action-btn-danger" data-action="pay">1. PAY RANSOM</button>
        <button class="action-btn action-btn-safe" data-action="restore">2. RESTORE FROM BACKUP</button>
        <button class="action-btn action-btn-safe" data-action="isolate">3. ISOLATE SYSTEM</button>
        <button class="action-btn action-btn-danger" data-action="ignore_ransom">4. IGNORE RANSOM</button>
    `;

    addLog('[RANSOMWARE] Ransomware outbreak detected!');
    incidentActions.querySelectorAll('.action-btn').forEach(btn => {
        btn.addEventListener('click', (e) => handleDecision(e.target.dataset.action, 'Ransomware'));
    });
};

// Handle Incident Decisions
window.handleDecision = function handleDecision(action, type) {
    const incidentDisplay = document.getElementById('incident-display');
    const incidentActions = document.getElementById('incident-actions');
    incidentActions.querySelectorAll('.action-btn').forEach(btn => btn.disabled = true);

    let feedback = '';

    if (type === 'Phishing') {
        if (action === 'report') {
            gameState.threatsDetected += 1;
            gameState.score += 500;
            updateThreatLevel('Phishing', 'NONE');
            feedback = '<p class="status-secure">✓ THREAT NEUTRALIZED</p><p>The phishing attempt was reported to the security team.</p>';
            addLog('[PHISHING] Player reported the attack.');
            if (window.soundEngine) soundEngine.playSuccess();
        } else if (action === 'delete') {
            gameState.threatsDetected += 1;
            gameState.score += 300;
            updateThreatLevel('Phishing', 'NONE');
            feedback = '<p class="status-secure">✓ EMAIL REMOVED</p><p>The suspicious email was safely deleted.</p>';
            addLog('[PHISHING] Player deleted the email.');
            if (window.soundEngine) soundEngine.playSuccess();
        } else if (action === 'open') {
            applyDamage(20, 'Phishing');
            gameState.threatsMissed += 1;
            updateThreatLevel('Phishing', 'HIGH');
            feedback = '<p class="alert-text">⚠ SECURITY BREACH</p><p>The employee opened the malicious link.</p>';
        } else if (action === 'ignore') {
            applyDamage(10, 'Phishing');
            gameState.threatsMissed += 1;
            updateThreatLevel('Phishing', 'MEDIUM');
            feedback = '<p style="color:#f59e0b;font-weight:bold;">⚠ THREAT ESCALATING</p><p>Ignoring the phishing attempt allowed the attacker to continue.</p>';
        }
    } else if (type === 'Malware') {
        if (action === 'quarantine') {
            gameState.threatsDetected += 1;
            gameState.score += 500;
            updateThreatLevel('Malware', 'NONE');
            feedback = '<p class="status-secure">✓ MALWARE QUARANTINED</p><p>The suspicious file was isolated successfully.</p>';
            addLog('[MALWARE] Malware quarantined successfully.');
            if (window.soundEngine) soundEngine.playSuccess();
        } else if (action === 'execute') {
            applyDamage(30, 'Malware');
            gameState.threatsMissed += 1;
            updateThreatLevel('Malware', 'HIGH');
            feedback = '<p class="alert-text">⚠ MALWARE EXECUTED</p><p>The malicious program was allowed to run.</p>';
        } else if (action === 'ignore') {
            applyDamage(20, 'Malware');
            gameState.threatsMissed += 1;
            updateThreatLevel('Malware', 'MEDIUM');
            feedback = '<p style="color:#f59e0b;font-weight:bold;">⚠ THREAT ACTIVE</p><p>The malware was not contained.</p>';
        } else if (action === 'send') {
            applyDamage(25, 'Malware');
            gameState.threatsMissed += 1;
            updateThreatLevel('Malware', 'HIGH');
            feedback = '<p class="alert-text">⚠ MALWARE SPREAD</p><p>The file was transferred to another device.</p>';
        }
    } else if (type === 'WeakPassword') {
        if (action === 'change') {
            gameState.threatsDetected += 1;
            gameState.score += 500;
            gameState.securityLevel = Math.min(100, gameState.securityLevel + 5);
            feedback = '<p class="status-secure">✓ PASSWORD SECURED</p><p>The weak password was replaced with a stronger password.</p>';
            addLog('[PASSWORD] Weak password changed. Security +5');
            if (window.soundEngine) soundEngine.playSuccess();
        } else if (action === 'disable') {
            gameState.threatsDetected += 1;
            gameState.score += 300;
            gameState.securityLevel = Math.min(100, gameState.securityLevel + 3);
            feedback = '<p class="status-secure">✓ ACCOUNT DISABLED</p><p>The vulnerable account has been disabled.</p>';
            addLog('[PASSWORD] Vulnerable account disabled. Security +3');
            if (window.soundEngine) soundEngine.playSuccess();
        } else if (action === 'keep') {
            applyDamage(10, 'Weak Password');
            gameState.securityLevel = Math.max(0, gameState.securityLevel - 5);
            gameState.threatsMissed += 1;
            feedback = '<p class="alert-text">⚠ WEAK PASSWORD REMAINS</p><p>The vulnerable account is still exposed.</p>';
        } else if (action === 'share') {
            applyDamage(5, 'Weak Password');
            gameState.securityLevel = Math.max(0, gameState.securityLevel - 3);
            gameState.threatsMissed += 1;
            feedback = '<p style="color:#f59e0b;font-weight:bold;">⚠ CREDENTIAL EXPOSURE</p><p>Sharing a password is unsafe.</p>';
        }
    } else if (type === 'SuspiciousUSB') {
        if (action === 'scan') {
            gameState.threatsDetected += 1;
            gameState.score += 500;
            gameState.securityLevel = Math.min(100, gameState.securityLevel + 3);
            updateThreatLevel('USB', 'NONE');
            feedback = '<p class="status-secure">✓ USB SCANNED</p><p>The device was scanned before being connected to the network.</p>';
            addLog('[USB] Device scanned and secured. Security +3');
            if (window.soundEngine) soundEngine.playSuccess();
        } else if (action === 'format') {
            gameState.threatsDetected += 1;
            gameState.score += 300;
            gameState.securityLevel = Math.min(100, gameState.securityLevel + 2);
            updateThreatLevel('USB', 'NONE');
            feedback = '<p class="status-secure">✓ USB FORMATTED</p><p>The suspicious device was safely erased.</p>';
            addLog('[USB] Device formatted. Security +2');
            if (window.soundEngine) soundEngine.playSuccess();
        } else if (action === 'plug') {
            applyDamage(15, 'Suspicious USB');
            gameState.securityLevel = Math.max(0, gameState.securityLevel - 5);
            gameState.threatsMissed += 1;
            updateThreatLevel('USB', 'HIGH');
            feedback = '<p class="alert-text">⚠ USB THREAT ACTIVATED</p><p>The unknown USB was connected to a company computer.</p>';
        } else if (action === 'give') {
            applyDamage(15, 'Suspicious USB');
            gameState.securityLevel = Math.max(0, gameState.securityLevel - 3);
            gameState.threatsMissed += 1;
            updateThreatLevel('USB', 'HIGH');
            feedback = '<p class="alert-text">⚠ THREAT TRANSFERRED</p><p>The suspicious device was given to another employee.</p>';
        }
    } else if (type === 'Ransomware') {
        if (action === 'restore') {
            if (gameState.backupEnabled) {
                gameState.threatsDetected += 1;
                gameState.score += 1000;
                updateThreatLevel('Ransomware', 'NONE');
                feedback = '<p class="status-secure">✓ SYSTEM RESTORED FROM BACKUP</p><p>All encrypted files were successfully recovered without paying ransom!</p>';
                addLog('[RANSOMWARE] Attack defeated using backup system! +1000 score');
                if (window.soundEngine) soundEngine.playSuccess();
            } else {
                applyDamage(40, 'Ransomware');
                gameState.threatsMissed += 1;
                updateThreatLevel('Ransomware', 'HIGH');
                feedback = '<p class="alert-text">⚠ BACKUP FAILED</p><p>No backup system installed! Data lost!</p>';
            }
        } else if (action === 'isolate') {
            gameState.threatsDetected += 1;
            gameState.score += 400;
            applyDamage(15, 'Ransomware');
            updateThreatLevel('Ransomware', 'MEDIUM');
            feedback = '<p class="status-secure">✓ NETWORK ISOLATED</p><p>Spread was halted, but local files were damaged.</p>';
            addLog('[RANSOMWARE] Network isolated.');
            if (window.soundEngine) soundEngine.playSuccess();
        } else if (action === 'pay') {
            gameState.budget = Math.max(0, gameState.budget - 20000);
            applyDamage(25, 'Ransomware');
            gameState.threatsMissed += 1;
            updateThreatLevel('Ransomware', 'MEDIUM');
            feedback = '<p class="alert-text">⚠ RANSOM PAID</p><p>Paid ₹20,000 to extortionists. Partial recovery achieved.</p>';
            addLog('[RANSOMWARE] Paid ransom ₹20,000.');
        } else if (action === 'ignore_ransom') {
            applyDamage(50, 'Ransomware');
            gameState.threatsMissed += 1;
            updateThreatLevel('Ransomware', 'HIGH');
            feedback = '<p class="alert-text">⚠ CRITICAL DAMAGE</p><p>Ignoring ransomware destroyed core databases!</p>';
        }
    }

    incidentDisplay.innerHTML += `<br><div style="border-top:1px dashed rgba(16,185,129,0.3);padding-top:1rem;margin-top:1rem;">${feedback}</div>`;
    updateDashboard();

    if (gameState.health > 0) {
        const btnContainer = document.createElement('div');
        btnContainer.style.cssText = 'display:flex;gap:0.5rem;flex-wrap:wrap;margin-top:1.5rem;';

        const newBtn = document.createElement('button');
        newBtn.className = 'cyber-button small-btn simulate-btn';
        newBtn.style.flex = '1';
        newBtn.textContent = 'NEW INCIDENT';
        newBtn.addEventListener('click', () => {
            incidentActions.innerHTML = '';
            generateRandomIncident();
        });
        btnContainer.appendChild(newBtn);

        incidentActions.appendChild(btnContainer);
    }

    if (typeof saveGame === 'function') saveGame();
};

// Random Events Definition & Handler
window.randomEvents = [
    {
        id: 'suspicious_login',
        title: '🚨 SUSPICIOUS LOGIN DETECTED',
        description: 'An unknown IP from abroad attempted to log into an admin account.',
        shortName: 'Suspicious Login',
        choices: [
            {
                text: '1. BLOCK LOGIN',
                result: 'Blocked suspicious login attempt. Security +5',
                consequence: { securityLevel: 5, score: 300, threatsDetected: 1 }
            },
            {
                text: '2. ALLOW LOGIN',
                result: 'Allowed unauthorized access. Health -15, Security -5',
                consequence: { health: -15, securityLevel: -5, threatsMissed: 1, reason: 'Suspicious Login Allowed' }
            },
            {
                text: '3. INVESTIGATE',
                result: 'Investigated and verified legitimate travel. Security +3',
                consequence: { securityLevel: 3, score: 400, threatsDetected: 1 }
            }
        ]
    },
    {
        id: 'lost_laptop',
        title: '💻 LOST COMPANY LAPTOP',
        description: 'An employee reported their company laptop was stolen from a coffee shop.',
        shortName: 'Lost Laptop',
        choices: [
            {
                text: '1. REMOTE WIPED',
                result: 'Remotely wiped stolen laptop data. Security +5',
                consequence: { securityLevel: 5, score: 400, threatsDetected: 1 }
            },
            {
                text: '2. IGNORE REPORT',
                result: 'Unprotected laptop compromised network data. Health -20, Security -5',
                consequence: { health: -20, securityLevel: -5, threatsMissed: 1, reason: 'Lost Laptop Exposure' }
            }
        ]
    }
];

window.generateRandomEvent = function generateRandomEvent() {
    const display = document.getElementById('current-event-display');
    if (!display || !randomEvents || randomEvents.length === 0) return;

    const event = randomEvents[Math.floor(Math.random() * randomEvents.length)];
    let choicesHtml = event.choices.map((c, i) => `<button class="cyber-button small-btn event-choice-btn" data-event="${event.id}" data-choice="${i}" style="margin-top:0.5rem;width:100%;text-align:left;">${c.text}</button>`).join('');

    display.innerHTML = `
        <div style="padding:0.8rem;background:rgba(16,185,129,0.05);border:1px solid rgba(16,185,129,0.3);border-radius:4px;">
            <strong style="color:var(--primary-color);">${event.title}</strong>
            <p style="font-size:0.9rem;margin:0.4rem 0;">${event.description}</p>
            <div>${choicesHtml}</div>
        </div>
    `;

    display.querySelectorAll('.event-choice-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const evId = e.target.dataset.event;
            const chIdx = parseInt(e.target.dataset.choice);
            handleEventChoice(evId, chIdx);
        });
    });
};

window.handleEventChoice = function handleEventChoice(eventId, choiceIndex) {
    const event = randomEvents.find(e => e.id === eventId);
    if (!event || !event.choices[choiceIndex]) return;

    const choice = event.choices[choiceIndex];
    const cons = choice.consequence;

    if (cons.score) gameState.score += cons.score;
    if (cons.securityLevel) gameState.securityLevel = Math.max(0, Math.min(100, gameState.securityLevel + cons.securityLevel));
    if (cons.threatsDetected) gameState.threatsDetected += cons.threatsDetected;
    if (cons.threatsMissed) gameState.threatsMissed += cons.threatsMissed;
    if (cons.health) applyDamage(Math.abs(cons.health), cons.reason || event.shortName);

    gameState.eventHistory.unshift({
        title: event.shortName,
        result: choice.result
    });

    const display = document.getElementById('current-event-display');
    if (display) {
        display.innerHTML = `<div style="padding:0.6rem;background:rgba(16,185,129,0.1);border-radius:4px;"><strong style="color:#10b981;">✓ ${event.shortName} Resolved</strong><p style="font-size:0.85rem;margin-top:0.2rem;">${choice.result}</p></div>`;
    }

    updateDashboard();
    updateEventHistory();
    if (typeof saveGame === 'function') saveGame();
};

// Initialize DOM listeners when document ready
document.addEventListener('DOMContentLoaded', () => {
    // Sound toggle listener
    const soundBtn = document.getElementById('sound-toggle-btn');
    if (soundBtn) {
        soundBtn.addEventListener('click', () => {
            soundEngine.muted = !soundEngine.muted;
            soundBtn.textContent = soundEngine.muted ? '🔇 SOUND: OFF' : '🔊 SOUND: ON';
            if (!soundEngine.muted) soundEngine.playClick();
        });
    }

    // Keyboard incident hotkeys (1, 2, 3, 4)
    document.addEventListener('keydown', (e) => {
        if (['1', '2', '3', '4'].includes(e.key)) {
            const index = parseInt(e.key) - 1;
            const actionBtns = document.querySelectorAll('#incident-actions .action-btn:not(:disabled)');
            if (actionBtns && actionBtns[index]) {
                soundEngine.playClick();
                actionBtns[index].click();
            }
        }
    });

    // Button click sound effect delegation
    document.body.addEventListener('click', (e) => {
        if (e.target && (e.target.tagName === 'BUTTON' || e.target.closest('button'))) {
            soundEngine.playClick();
        }
    });

    // Mode selection buttons listener
    document.querySelectorAll('.mode-card button').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const mode = e.target.dataset.mode;
            if (mode) initializeGameMode(mode);
            const modeSel = document.getElementById('mode-selection-screen');
            if (modeSel) modeSel.style.display = 'none';
            const dash = document.getElementById('dashboard-screen');
            if (dash) dash.style.display = 'block';
        });
    });

    // Start game button listener (default mode selection flow)
    const startBtn = document.getElementById('start-game-btn');
    if (startBtn) {
        startBtn.addEventListener('click', () => {
            const landing = document.getElementById('landing-screen');
            if (landing) landing.style.display = 'none';
            const modeSel = document.getElementById('mode-selection-screen');
            if (modeSel) modeSel.style.display = 'block';
        });
    }

    // Dev test buttons bindings
    const simBtn = document.getElementById('simulate-incident-btn');
    if (simBtn) simBtn.addEventListener('click', generateRandomIncident);

    const testPhish = document.getElementById('test-phishing-btn');
    if (testPhish) testPhish.addEventListener('click', generatePhishingIncident);

    const testMalware = document.getElementById('test-malware-btn');
    if (testMalware) testMalware.addEventListener('click', generateMalwareIncident);

    const testPwd = document.getElementById('test-password-btn');
    if (testPwd) testPwd.addEventListener('click', generateWeakPasswordIncident);

    const testUsb = document.getElementById('test-usb-btn');
    if (testUsb) testUsb.addEventListener('click', generateSuspiciousUsbIncident);

    const testRansom = document.getElementById('test-ransomware-btn');
    if (testRansom) testRansom.addEventListener('click', generateRansomwareIncident);

    // Random Event button binding
    const genEventBtn = document.getElementById('generate-event-btn');
    if (genEventBtn) genEventBtn.addEventListener('click', generateRandomEvent);

    // Upgrade buttons binding
    ['firewall', 'antivirus', 'training', 'backup'].forEach(type => {
        const btn = document.getElementById(`upgrade-${type}`);
        if (btn) btn.addEventListener('click', () => purchaseUpgrade(type));
    });

    // Initial render
    updateDashboard();
    renderEmployees();
    updateUpgradeButtons();
    updateEventHistory();
});