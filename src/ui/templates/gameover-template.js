/**
 * Game Over Screen Template
 * Contains the game over screen with final statistics
 */
function createGameOverTemplate() {
    return `
    <!-- Game Over Screen -->
    <div id="gameOverScreen" class="screen modal">
        <div class="modal-content">
            <h2 class="modal-title game-over-title">You Have Fallen</h2>
            <div class="stats-container">
                <div class="stat-item">
                    <div class="stat-label">Level Reached</div>
                    <div id="finalLevel" class="stat-value">0</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">Boss Faced</div>
                    <div id="finalBoss" class="stat-value">Unknown</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">Time Survived</div>
                    <div id="survivalTime" class="stat-value">0:00</div>
                </div>
            </div>
            <div id="modifierSummarySection" class="modifier-summary-section">
                <h3 class="modifier-summary-title">Boss Modifiers</h3>
                <div id="modifierSummary" class="modifier-summary-list">
                    <!-- Dynamically populated -->
                </div>
            </div>
            <button id="returnMenuBtn" class="btn-primary">Return to Menu</button>
        </div>
    </div>
    `;
}
