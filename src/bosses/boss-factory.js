// Boss Factory
function createRandomBoss(level, width, height) {
    const bossTypes = [
        CrimsonReaper,
        VoidSorcerer,
        IronColossus,
        SwarmQueen,
        ChaosPhantom
    ];

    const BossClass = bossTypes[Math.floor(Math.random() * bossTypes.length)];
    // Create a minimal canvas-like object with width/height properties
    const canvas = { width, height };
    return new BossClass(width / 2, height / 4, canvas);
}
