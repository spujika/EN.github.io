/**
 * Modals Template
 * Contains split stack and withdraw coin modals
 */
function createModalsTemplate() {
    return `
    <!-- Split Stack Modal -->
    <div id="splitModal" class="modal split-modal">
        <div class="split-modal-content">
            <h3>Split Stack</h3>
            <div class="split-item-display">
                <span id="splitItemIcon" class="split-icon">💰</span>
                <span id="splitItemName">Coins</span>
            </div>
            <div class="split-preview">
                <div class="split-stack left-stack">
                    <div class="stack-amount" id="splitLeft">4</div>
                    <div class="stack-label">Keep</div>
                </div>
                <div class="split-divider">→</div>
                <div class="split-stack right-stack">
                    <div class="stack-amount" id="splitRight">5</div>
                    <div class="stack-label">Split Off</div>
                </div>
            </div>
            <input type="range" id="splitSlider" min="1" max="8" value="4" class="split-slider" />
            <div class="split-actions">
                <button id="splitConfirm" class="btn-primary">Confirm</button>
                <button id="splitCancel" class="btn-secondary">Cancel</button>
            </div>
        </div>
    </div>

    <!-- Withdraw Modal -->
    <div id="withdrawModal" class="modal split-modal">
        <div class="split-modal-content">
            <h3>Withdraw Coins</h3>
            <div class="split-item-display">
                <span id="withdrawItemIcon" class="split-icon">💰</span>
                <span id="withdrawItemName">Coin Pouch</span>
            </div>
            <div class="split-preview">
                <div class="split-stack left-stack">
                    <div class="stack-amount" id="withdrawLeft">50</div>
                    <div class="stack-label">Keep in Pouch</div>
                </div>
                <div class="split-divider">→</div>
                <div class="split-stack right-stack">
                    <div class="stack-amount" id="withdrawRight">50</div>
                    <div class="stack-label">Withdraw</div>
                </div>
            </div>
            <input type="range" id="withdrawSlider" min="1" max="100" value="50" class="split-slider" />
            <div class="split-actions">
                <button id="withdrawConfirmBtn" class="btn-primary">Confirm</button>
                <button id="withdrawCancelBtn" class="btn-secondary">Cancel</button>
            </div>
        </div>
    </div>
    `;
}
