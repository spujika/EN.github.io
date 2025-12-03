/**
 * Extraction Screen Template
 * Contains the choice screen between extracting rewards or continuing deeper
 */
function createExtractionTemplate() {
    return `
    <!-- Extraction Choice Screen -->
    <div id="extractionScreen" class="screen modal">
        <div class="modal-content extraction-content">
            <h2 class="modal-title">Choose Your Fate</h2>
            <p class="modal-subtitle">Wake with your rewards, or dream deeper for greater treasures?</p>
            
            <div class="level-info" style="text-align: center; margin-bottom: 20px;">
                <h3 id="nextLevelDisplay" style="color: #ff00ff; text-shadow: 0 0 10px #ff00ff;">Next Level: 2</h3>
                <p id="mechanicWarning" style="color: #ff4500; font-style: italic; display: none;">The nightmare stirs and gains new knowledge...</p>
            </div>

            <div id="currentRewardDisplay" class="reward-display">
                <h3>Current Rewards</h3>
                <div id="rewardCoins" class="reward-coins">💰 0</div>
                <div id="rewardItems" class="reward-items-grid"></div>
            </div>

            <div class="extraction-choice">
                <div class="choice-card extract-card">
                    <div class="choice-icon">🐓</div>
                    <h3>Wake</h3>
                    <p>Claim your rewards and wake safely. All items will be added to your inventory.</p>
                    <button id="extractBtn" class="btn-primary">Wake Up</button>
                </div>
                <div class="choice-card continue-card">
                    <div class="choice-icon">😴</div>
                    <h3>Dream</h3>
                    <p>Descend deeper into the nightmare! Rewards will increase, but you risk losing everything if you
                        fall.</p>
                    <button id="continueBtn" class="btn-primary">Dream Deeper</button>
                </div>
            </div>
        </div>
    </div>
    `;
}
