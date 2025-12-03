/**
 * Modifier Selection Template
 * Contains the boss modifier selection screen
 */
function createModifierTemplate() {
    return `
    <!-- Modifier Selection Screen -->
    <div id="modifierScreen" class="screen modal">
        <div class="modal-content">
            <h2 class="modal-title">Boss Defeated!</h2>
            <p class="modal-subtitle">The nightmare stirs... Choose a modifier to empower the boss</p>
            <div id="modifierOptions" class="modifier-grid">
                <!-- Dynamically populated -->
            </div>
        </div>
    </div>
    `;
}
