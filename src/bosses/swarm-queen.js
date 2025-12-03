// 4. SWARM QUEEN - Summoner
class SwarmQueen extends Boss {
    constructor(x, y, canvas) {
        super(x, y, canvas);
        this.name = 'Swarm Queen';
        this.color = '#9b870c';
        this.size = 32;
        this.speed = 66; // 1.1 * 60
        this.maxHealth = 150;
        this.health = this.maxHealth;
        this.targetDistance = 250;



        this.minions = [];
        this.webs = [];

        // New Mechanics
        this.eggSacs = [];
        this.stickyFloors = [];
        this.eggSacCooldown = 0;
        this.stickyFloorCooldown = 0;
        this.minionSpawnCooldown = 0;
    }

    update(player, projectiles, level, particles, dt) {
        super.update(player, projectiles, level, particles, dt);

        // Minion Management & Spawning (Restored)
        this.minions = this.minions.filter(m => m.health > 0);
        // Ability 1: Spawn Drones (Level 1+)
        if (level >= 1) {
            if (this.minionSpawnCooldown <= 0) {
                const spawnCount = 1 + this.projectileCount;
                for (let i = 0; i < spawnCount; i++) {
                    this.minions.push({
                        x: this.x + (Math.random() - 0.5) * 50,
                        y: this.y + (Math.random() - 0.5) * 50,
                        health: 20,
                        size: 10,
                        speed: 90, // 1.5 * 60
                        shootCooldown: 1.5 // 90 frames / 60
                    });
                }
                this.minionSpawnCooldown = 4.0; // 240 frames / 60
            }
            if (this.minionSpawnCooldown > 0) this.minionSpawnCooldown -= dt;
        }

        // Update all minions (Normal + Elite)
        this.minions.forEach(minion => {
            const dx = player.x - minion.x;
            const dy = player.y - minion.y;
            const angle = Math.atan2(dy, dx);

            minion.x += Math.cos(angle) * minion.speed * dt;
            minion.y += Math.sin(angle) * minion.speed * dt;

            minion.shootCooldown -= dt;
            if (minion.shootCooldown <= 0) {
                const speed = 120 * this.projectileSpeedMultiplier; // 2.0 * 60
                projectiles.push(new Projectile(
                    minion.x, minion.y,
                    Math.cos(angle) * speed, Math.sin(angle) * speed,
                    8 * this.damageMultiplier, 'boss', '#ffd700', 4
                ));
                minion.shootCooldown = 6.66; // 400 frames / 60
            }
        });

        // Ability 2: Sticky Floor (Level 5+)
        if (level >= 5) {
            // Spawn sticky floor
            if (this.stickyFloorCooldown <= 0 && Math.random() < 0.01) {
                this.stickyFloors.push({
                    x: player.x,
                    y: player.y,
                    radius: 60,
                    lifetime: 5.0, // 300 frames / 60
                    age: 0
                });
                this.stickyFloorCooldown = 4.0; // 240 frames / 60
            }
            if (this.stickyFloorCooldown > 0) this.stickyFloorCooldown -= dt;

            // Update sticky floors
            this.stickyFloors = this.stickyFloors.filter(floor => {
                floor.age += dt;

                // Check collision with player
                const dx = player.x - floor.x;
                const dy = player.y - floor.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < floor.radius) {
                    player.speedMultiplier = 0.5; // Slow down
                }

                return floor.age < floor.lifetime;
            });
        }

        // Ability 3: Egg Sacs (Level 10+)
        if (level >= 10) {
            if (this.eggSacCooldown <= 0 && this.eggSacs.length < 3 && Math.random() < 0.005) {
                this.eggSacs.push({
                    x: this.x + (Math.random() - 0.5) * 150,
                    y: this.y + (Math.random() - 0.5) * 150,
                    health: 1,
                    maxHealth: 1,
                    size: 15,
                    hatchTimer: 5.0, // 300 frames / 60
                    maxHatchTimer: 5.0
                });
                this.eggSacCooldown = 5.0; // 300 frames / 60
            }
            if (this.eggSacCooldown > 0) this.eggSacCooldown -= dt;

            // Update Egg Sacs
            for (let i = this.eggSacs.length - 1; i >= 0; i--) {
                const sac = this.eggSacs[i];
                sac.hatchTimer -= dt;

                if (sac.hatchTimer <= 0) {
                    // Hatch into Elite Minion
                    this.minions.push({
                        x: sac.x,
                        y: sac.y,
                        health: 40, // Stronger
                        size: 14,
                        speed: 120, // 2.0 * 60
                        shootCooldown: 1.0, // 60 frames / 60
                        isElite: true
                    });
                    this.eggSacs.splice(i, 1);
                    console.log("Egg Sac Hatched!");
                }
            }
        }
    }

    checkProjectileCollision(projectile) {
        // Check collision with Egg Sacs
        for (let i = this.eggSacs.length - 1; i >= 0; i--) {
            const sac = this.eggSacs[i];
            const dx = projectile.x - sac.x;
            const dy = projectile.y - sac.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < sac.size + projectile.size) {
                sac.health -= projectile.damage;
                if (sac.health <= 0) {
                    this.eggSacs.splice(i, 1);
                    // Spawn goop particles?
                }
                return true; // Handled
            }
        }
        return false;
    }

    applyWebs(player) {
        // Deprecated in favor of Sticky Floor logic in update, but keeping for backward compat if needed
        // Actually, let's just merge the logic. The original code called applyWebs from Game class?
        // Let's check Game class. If it calls applyWebs, we should keep it or update Game class.
        // Assuming Game class might call it, but we can also handle it in update.
        // For now, let's leave the original web logic as is for Level 15+
        this.webs.forEach(web => {
            const dx = player.x - web.x;
            const dy = player.y - web.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < web.radius) {
                player.speedMultiplier = 0.5;
            }
        });
    }

    draw(ctx) {
        super.draw(ctx);

        // Draw Sticky Floors
        this.stickyFloors.forEach(floor => {
            const alpha = 1 - (floor.age / floor.lifetime);
            ctx.save();
            ctx.globalAlpha = alpha * 0.6;
            ctx.fillStyle = '#32cd32'; // Lime green slime
            ctx.beginPath();
            ctx.arc(floor.x, floor.y, floor.radius, 0, Math.PI * 2);
            ctx.fill();

            // Bubbles
            if (Math.random() < 0.1) {
                ctx.fillStyle = '#98fb98';
                ctx.beginPath();
                ctx.arc(floor.x + (Math.random() - 0.5) * floor.radius, floor.y + (Math.random() - 0.5) * floor.radius, 3, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        });

        // Draw Egg Sacs
        this.eggSacs.forEach(sac => {
            ctx.save();
            ctx.fillStyle = '#f0e68c'; // Khaki
            ctx.strokeStyle = '#8b4513';
            ctx.lineWidth = 2;

            // Pulsating effect
            const pulse = Math.sin(Date.now() / 200) * 2;
            ctx.beginPath();
            ctx.arc(sac.x, sac.y, sac.size + pulse, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // Progress bar (Hatch timer)
            const pct = 1 - (sac.hatchTimer / sac.maxHatchTimer);
            ctx.fillStyle = '#ff0000';
            ctx.fillRect(sac.x - 15, sac.y - 25, 30 * pct, 4);

            ctx.restore();
        });

        // Draw minions
        this.minions.forEach(minion => {
            ctx.save();
            ctx.fillStyle = minion.explodeTimer ? '#ff6600' : (minion.isElite ? '#ff4500' : '#ffd700');
            ctx.shadowBlur = 10;
            ctx.shadowColor = ctx.fillStyle;
            ctx.beginPath();
            ctx.arc(minion.x, minion.y, minion.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });

        // Draw webs (Legacy/Level 15)
        this.webs.forEach(web => {
            const alpha = 1 - (web.age / web.lifetime);
            ctx.save();
            ctx.globalAlpha = alpha * 0.4;
            ctx.fillStyle = '#00ff00';
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#00ff00';
            ctx.beginPath();
            ctx.arc(web.x, web.y, web.radius, 0, Math.PI * 2);
            ctx.fill();

            // Web pattern
            ctx.strokeStyle = '#00ff00';
            ctx.lineWidth = 2;
            for (let i = 0; i < 8; i++) {
                const angle = (i / 8) * Math.PI * 2;
                ctx.beginPath();
                ctx.moveTo(web.x, web.y);
                ctx.lineTo(
                    web.x + Math.cos(angle) * web.radius,
                    web.y + Math.sin(angle) * web.radius
                );
                ctx.stroke();
            }
            ctx.restore();
        });
    }
}

