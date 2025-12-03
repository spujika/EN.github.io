/**
 * Main Menu Template
 * Contains the main menu screen with game title, buttons, and boss preview
 */
function createMainMenuTemplate() {
    return `
    <!-- Main Menu -->
    <div id="mainMenu" class="screen active">
        <div class="menu-content">
            <h1 class="game-title">ETERNAL<span class="title-glow">NIGHTMARE</span></h1>
            <p class="tagline">Face the endless horror. Fight until you fall.</p>
            <button id="startBtn" class="btn-primary">Enter the Nightmare</button>
            <button id="inventoryBtn" class="btn-secondary">Inventory</button>
            <div class="boss-preview">
                <p class="preview-text">Face 5 Unique Bosses</p>
                <div class="boss-icons">
                    <div class="boss-icon" title="Crimson Reaper" data-boss-type="CrimsonReaper">⚔️</div>
                    <div class="boss-icon" title="Void Sorcerer" data-boss-type="VoidSorcerer">🔮</div>
                    <div class="boss-icon" title="Iron Colossus" data-boss-type="IronColossus">🛡️</div>
                    <div class="boss-icon" title="Swarm Queen" data-boss-type="SwarmQueen">👑</div>
                    <div class="boss-icon" title="Chaos Phantom" data-boss-type="ChaosPhantom">👻</div>
                </div>
            </div>
        </div>
        <div class="animated-bg"></div>
    </div>
    `;
}
