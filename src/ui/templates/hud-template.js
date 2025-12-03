/**
 * HUD Template
 * Contains the in-game heads-up display with health bars, level display, and hotbar
 */
function createHUDTemplate() {
    return `
    <!-- HUD -->
    <div id="hud">
        <div class="hud-top">
            <div class="hud-section">
                <div class="label">Level</div>
                <div id="levelDisplay" class="value level-value">1</div>
            </div>
            <div class="hud-section boss-info">
                <div id="bossName" class="boss-name">???</div>
                <div class="boss-health-container">
                    <div id="bossHealthBar" class="health-bar boss-bar">
                        <div id="bossHealthFill" class="health-fill boss-fill"></div>
                    </div>
                    <div id="bossHealthText" class="health-text">100%</div>
                </div>
            </div>
        </div>

        <!-- Player HUD at bottom center -->
        <div class="hud-bottom">
            <div class="player-hud">
                <div class="player-stat-group">
                    <div class="label">HP</div>
                    <div class="health-bar player-bar">
                        <div id="playerHealthFill" class="health-fill player-fill"></div>
                    </div>
                    <div id="playerHealthText" class="health-text">100 / 100</div>
                </div>
                <div class="player-stat-group">
                    <div class="label">Stamina</div>
                    <div id="dashChargesContainer" class="dash-charges-container"></div>
                </div>
            </div>
            <div class="hotbar-container">
                <div id="hotbarSlot0" class="hotbar-slot">
                    <div class="hotbar-key">1</div>
                    <div class="hotbar-icon"></div>
                    <div class="hotbar-quantity"></div>
                </div>
                <div id="hotbarSlot1" class="hotbar-slot">
                    <div class="hotbar-key">2</div>
                    <div class="hotbar-icon"></div>
                    <div class="hotbar-quantity"></div>
                </div>
            </div>
        </div>
    </div>
    `;
}
