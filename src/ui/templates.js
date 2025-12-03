/**
 * Template Loader System
 * Loads all HTML templates and injects them into the DOM on page load
 * This file must be loaded BEFORE any other game scripts
 */

/**
 * Initialize all HTML templates
 * Called automatically on DOMContentLoaded
 */
function initializeTemplates() {
    const body = document.body;

    // Create game container first (needed for canvas initialization)
    const gameContainer = document.createElement('div');
    gameContainer.id = 'gameContainer';
    gameContainer.className = 'screen';
    gameContainer.innerHTML = '<canvas id="gameCanvas"></canvas>';
    body.appendChild(gameContainer);

    // Inject all UI templates
    body.insertAdjacentHTML('beforeend', createMainMenuTemplate());

    // Add HUD inside game container
    gameContainer.insertAdjacentHTML('beforeend', createHUDTemplate());

    // Add all other screens
    body.insertAdjacentHTML('beforeend', createExtractionTemplate());
    body.insertAdjacentHTML('beforeend', createModifierTemplate());
    body.insertAdjacentHTML('beforeend', createInventoryTemplate());
    body.insertAdjacentHTML('beforeend', createGameOverTemplate());
    body.insertAdjacentHTML('beforeend', createModalsTemplate());
    body.insertAdjacentHTML('beforeend', createDebugTemplate());

    console.log('✓ All UI templates loaded successfully');
}

// Auto-initialize templates when DOM is ready
document.addEventListener('DOMContentLoaded', initializeTemplates);
