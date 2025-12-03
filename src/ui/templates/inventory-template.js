/**
 * Inventory Screen Template
 * Contains the full inventory management interface with equipment, items, and merchant
 */
function createInventoryTemplate() {
    return `
    <!-- Inventory Screen -->
    <div id="inventoryScreen" class="screen">
        <div class="inventory-container">
            <div class="inventory-header">
                <h1>Inventory</h1>
                <button id="enterNightmareFromInventory" class="btn-primary" style="margin-right: 10px;">Enter
                    Nightmare</button>
                <button id="closeInventoryBtn" class="btn-close">✕</button>
            </div>

            <div class="inventory-main">
                <!-- Equipment Panel -->
                <div class="inventory-equipment-panel">
                    <h3>Equipment</h3>
                    <div class="equipment-slots">
                        <div class="equipment-slot" data-slot="helmet">
                            <div class="slot-placeholder">⛑️</div>
                            <div class="slot-label">Helmet</div>
                        </div>
                        <div class="equipment-slot" data-slot="chest">
                            <div class="slot-placeholder">🛡️</div>
                            <div class="slot-label">Chest</div>
                        </div>
                        <div class="equipment-slot" data-slot="weapon">
                            <div class="slot-placeholder">⚔️</div>
                            <div class="slot-label">Weapon</div>
                        </div>
                    </div>
                    <h3 style="margin-top: 20px;">Hotbar</h3>
                    <div class="equipment-slots">
                        <div class="equipment-slot hotbar-equipment-slot" data-hotbar-slot="0">
                            <div class="slot-placeholder">1</div>
                            <div class="slot-label">Slot 1</div>
                        </div>
                        <div class="equipment-slot hotbar-equipment-slot" data-hotbar-slot="1">
                            <div class="slot-placeholder">2</div>
                            <div class="slot-label">Slot 2</div>
                        </div>
                    </div>
                    <div class="player-stats-display">
                        <h3>Player Stats</h3>
                        <div class="stat-row" id="statDamage">
                            <span class="stat-name">Damage</span>
                            <span class="stat-val">0 <span class="bonus-val">(+0)</span></span>
                        </div>
                        <div class="stat-row" id="statDefense">
                            <span class="stat-name">Defense</span>
                            <span class="stat-val">0 <span class="bonus-val">(+0)</span></span>
                        </div>
                        <div class="stat-row" id="statSpeed">
                            <span class="stat-name">Speed</span>
                            <span class="stat-val">0 <span class="bonus-val">(+0)</span></span>
                        </div>
                        <div class="stat-row" id="statHealth">
                            <span class="stat-name">Health</span>
                            <span class="stat-val">0 <span class="bonus-val">(+0)</span></span>
                        </div>
                    </div>
                </div>

                <div class="inventory-grid-container">
                    <div id="inventoryGrid" class="inventory-grid"></div>
                </div>

                <div class="inventory-sidebar">
                    <div class="inventory-stats">
                        <h3>Statistics</h3>
                        <div class="stat-line">
                            <span>Total Items:</span>
                            <span id="totalItems">0</span>
                        </div>
                        <div class="stat-line">
                            <span>Inventory Value:</span>
                            <span id="inventoryValue">0 💰</span>
                        </div>
                        <div class="stat-line">
                            <span>Slots Used:</span>
                            <span id="slotsUsed">0 / 60</span>
                        </div>
                    </div>

                    <div class="vendor-section">
                        <div class="vendor-header">
                            <h3 id="merchantName">Traveling Merchant</h3>
                            <div class="merchant-timer">
                                <span>⟳</span> <span id="merchantTimer">5:00</span>
                            </div>
                        </div>
                        <div class="vendor-type-icon" id="merchantIcon">🛒</div>
                        <p class="vendor-text" id="merchantDesc">Right-click items to sell.</p>

                        <div class="merchant-stock-container">
                            <h4>Current Stock</h4>
                            <div id="merchantStockGrid" class="merchant-grid"></div>
                        </div>
                    </div>

                    <!-- Extraction Pool (shown only in extraction mode) -->
                    <div class="extraction-pool" style="display: none;">
                        <div class="extraction-pool-header">
                            <h3>Extracted Rewards</h3>

                            <p class="extraction-instructions">Click items to take them. Destroy inventory items to make
                                space.</p>
                        </div>
                        <div id="extractionItemsGrid" class="extraction-items-grid"></div>
                        <div class="extraction-actions">
                            <button id="takeAllBtn" class="btn-secondary">Take All</button>
                            <button id="doneManagingBtn" class="btn-primary">Done Extracting</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `;
}
