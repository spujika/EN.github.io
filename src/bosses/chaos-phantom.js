
// 5. CHAOS PHANTOM - Unpredictable
class ChaosPhantom extends Boss {
    constructor(x, y, canvas) {
        super(x, y, canvas);
        this.name = 'Chaos Phantom';
        this.color = '#ff00ff';
        this.size = 26;
        this.speed = 90; // 1.5 * 60
        this.maxHealth = 160;
        this.health = this.maxHealth;
        this.targetDistance = 200;



        this.clones = [];
        this.controlsInverted = false;
        this.controlsInvertDuration = 0;
        this.attackPattern = 'random';

        // New Mechanics
        this.realCloneActive = false;
        this.screenTearActive = false;
        this.screenTearDuration = 0;
        this.cloneCooldown = 0;
        this.screenTearCooldown = 0;
        this.hasUsedClonePhase2 = false;
        this.hasUsedClonePhase3 = false;
    }

    takeDamage(amount, particles) {
        if (this.realCloneActive) {
            // When real boss is hit during clone phase, end the phase immediately
            this.realCloneActive = false;
            this.clones = []; // Destroy all clones
            this.aiState = 'chase'; // Resume movement
            return super.takeDamage(amount, particles);
        }
        return super.takeDamage(amount, particles);
    }

    update(player, projectiles, level, particles, dt) {
        super.update(player, projectiles, level, particles, dt);

        // Phase 2+: Real Clone Mechanic (Once per phase)
        // Phase 2+: Real Clone Mechanic (Once per phase)
        // Only trigger if level >= 5 (User requested no clones at level 1)
        if (level >= 5) {
            if (this.phase === 2 && !this.hasUsedClonePhase2 && !this.realCloneActive) {
                this.activateRealClone();
                this.hasUsedClonePhase2 = true;
            } else if (this.phase === 3 && !this.hasUsedClonePhase3 && !this.realCloneActive) {
                this.activateRealClone();
                this.hasUsedClonePhase3 = true;
            }
        }

        // Manage Clones
        if (this.realCloneActive) {
            // Update clone positions (stationary until real boss is hit)
            this.clones.forEach(clone => {
                if (clone.isFake && clone.active) {
                    // Clones don't move - they stand still
                    // No movement code needed
                }
            });

            // Check if all clones are gone or timer expires
            if (this.clones.filter(c => c.isFake).length === 0) {
                this.realCloneActive = false;
                this.aiState = 'chase';
            }
        }

        // Phase 2+: Screen Tear (Level 5+)
        if (level >= 5 && this.phase >= 2) {
            if (this.screenTearCooldown <= 0 && Math.random() < 0.003) {
                this.screenTearActive = true;
                this.screenTearDuration = 2.0; // 120 frames / 60
                this.screenTearCooldown = 6.66; // 400 frames / 60
            }
            if (this.screenTearCooldown > 0) this.screenTearCooldown -= dt;

            if (this.screenTearActive) {
                this.screenTearDuration -= dt;
                if (this.screenTearDuration <= 0) {
                    this.screenTearActive = false;
                }
            }
        }

        // Phase 3: Reality Collapse (Randomize projectile colors) (Level 5+)
        if (level >= 5 && this.phase === 3) {
            // Invert controls more often
            if (!this.controlsInverted && Math.random() < 0.01) {
                this.controlsInverted = true;
                this.controlsInvertDuration = 2.0; // 120 frames / 60
            }
        }
    }

    updateAI(player, distance, dt) {
        if (this.realCloneActive) {
            return; // Don't move during clone phase
        }
        super.updateAI(player, distance, dt);
    }

    activateRealClone() {
        this.realCloneActive = true;
        this.clones = [];

        // Teleport boss and spawn 3 clones
        const positions = [
            { x: this.canvas.width * 0.25, y: this.canvas.height * 0.25 },
            { x: this.canvas.width * 0.75, y: this.canvas.height * 0.25 },
            { x: this.canvas.width * 0.25, y: this.canvas.height * 0.75 },
            { x: this.canvas.width * 0.75, y: this.canvas.height * 0.75 }
        ];

        // Shuffle positions
        for (let i = positions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [positions[i], positions[j]] = [positions[j], positions[i]];
        }

        // Move real boss to first position
        this.x = positions[0].x;
        this.y = positions[0].y;
        this.aiState = 'stationary'; // Stop moving

        // Spawn 3 fake clones
        for (let i = 1; i < 4; i++) {
            this.clones.push({
                x: positions[i].x,
                y: positions[i].y,
                isFake: true,
                health: 1, // Die in one hit
                size: this.size,
                active: true
            });
        }
    }

    checkProjectileCollision(projectile) {
        // Check collision with Clones
        for (let i = this.clones.length - 1; i >= 0; i--) {
            const clone = this.clones[i];
            if (!clone.isFake || !clone.active) continue; // Only check fake clones

            const dx = projectile.x - clone.x;
            const dy = projectile.y - clone.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < clone.size + projectile.size) {
                // Hit a fake clone - punish player
                clone.active = false;
                this.clones.splice(i, 1);
                return 'fake_clone_hit'; // Return special value
            }
        }
        return false;
    }

    handleAttacks(player, projectiles, level, particles, dt) {
        // Ability 1: Chaos Bolt (Level 1+)
        if (level >= 1 && this.attackCooldown <= 0 && !this.realCloneActive) {
            const patterns = ['spread', 'spiral', 'circle', 'burst'];
            const pattern = patterns[Math.floor(Math.random() * patterns.length)];

            switch (pattern) {
                case 'spread':
                    const spreadCount = 3 + this.projectileCount;
                    for (let i = -spreadCount; i <= spreadCount; i++) {
                        const angle = this.angle + (i * Math.PI / 12);
                        const speed = 300 * this.projectileSpeedMultiplier; // 5.0 * 60
                        projectiles.push(new Projectile(
                            this.x, this.y,
                            Math.cos(angle) * speed, Math.sin(angle) * speed,
                            12 * this.damageMultiplier, 'boss', this.phase === 3 ? '#00ff00' : '#ff00ff', 5
                        ));
                    }
                    break;
                case 'spiral':
                    const spiralCount = 12 + (this.projectileCount * 2);
                    for (let i = 0; i < spiralCount; i++) {
                        const angle = (i / spiralCount) * Math.PI * 2 + (Date.now() / 200);
                        const speed = 210 * this.projectileSpeedMultiplier; // 3.5 * 60
                        projectiles.push(new Projectile(
                            this.x, this.y,
                            Math.cos(angle) * speed, Math.sin(angle) * speed,
                            10 * this.damageMultiplier, 'boss', '#ff00ff', 5
                        ));
                    }
                    break;
                case 'circle':
                    const circleCount = 16 + (this.projectileCount * 4);
                    for (let i = 0; i < circleCount; i++) {
                        const angle = (i / circleCount) * Math.PI * 2;
                        const speed = 270 * this.projectileSpeedMultiplier; // 4.5 * 60
                        projectiles.push(new Projectile(
                            this.x, this.y,
                            Math.cos(angle) * speed, Math.sin(angle) * speed,
                            11 * this.damageMultiplier, 'boss', '#ff00ff', 5
                        ));
                    }
                    break;
                case 'burst':
                    const burstCount = 1 + this.projectileCount;
                    for (let i = 0; i < burstCount; i++) {
                        projectiles.push(new HomingProjectile(
                            this.x, this.y, 270 * this.projectileSpeedMultiplier, // 4.5 * 60
                            15 * this.damageMultiplier, 'boss', player, '#ff00ff'
                        ));
                    }
                    break;
            }

            this.attackCooldown = 3.0; // 180 frames / 60
        }

        // Ability 2: Phase Shift (Level 5+)
        if (level >= 5 && Math.random() < 0.008) {
            this.x = Math.random() * this.canvas.width;
            this.y = Math.random() * this.canvas.height;

            if (particles) {
                for (let i = 0; i < 25; i++) {
                    particles.push(new Particle(this.x, this.y, '#ff00ff', 5));
                }
            }
        }

        // Ability 3: Mirror Image (Level 10+)
        if (level >= 10) {
            this.clones = this.clones.filter(c => c.lifetime > 0);
            const maxClones = 2 + this.projectileCount;

            if (this.clones.length < maxClones && Math.random() < 0.005) {
                this.clones.push({
                    x: this.x + (Math.random() - 0.5) * 100,
                    y: this.y + (Math.random() - 0.5) * 100,
                    lifetime: 3.0, // 180 frames / 60
                    shootCooldown: 0.5 // 30 frames / 60
                });
            }

            this.clones.forEach(clone => {
                clone.lifetime -= dt;
                clone.shootCooldown -= dt;

                if (clone.shootCooldown <= 0) {
                    const angle = Math.atan2(player.y - clone.y, player.x - clone.x);
                    const speed = 270 * this.projectileSpeedMultiplier; // 4.5 * 60
                    projectiles.push(new Projectile(
                        clone.x, clone.y,
                        Math.cos(angle) * speed, Math.sin(angle) * speed,
                        10 * this.damageMultiplier, 'boss', '#ff1493', 5
                    ));
                    clone.shootCooldown = 1.0; // 60 frames / 60
                }
            });
        }

        // Ability 4: Reality Warp (Level 15+)
        if (level >= 15 && !this.controlsInverted && Math.random() < 0.003) {
            this.controlsInverted = true;
            this.controlsInvertDuration = 3.0; // 180 frames / 60
        }

        if (this.controlsInverted) {
            this.controlsInvertDuration -= dt;
            if (this.controlsInvertDuration <= 0) {
                this.controlsInverted = false;
            }
        }

        // Ability 5: Pandemonium (Level 20+)
        if (level >= 20 && Math.random() < 0.015) {
            // Randomly use any previous attack
            this.attackCooldown = 0;
        }
    }

    draw(ctx) {
        // Screen Tear Effect (Global distortion)
        if (this.screenTearActive) {
            ctx.save();
            const shiftX = (Math.random() - 0.5) * 20;
            const shiftY = (Math.random() - 0.5) * 20;
            ctx.translate(shiftX, shiftY);
            if (Math.random() < 0.3) {
                ctx.fillStyle = `rgba(${Math.random() * 255}, 0, 255, 0.1)`;
                ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            }
        }

        super.draw(ctx);

        // Draw Real Clones (Phase 2+ mechanic)
        if (this.realCloneActive) {
            this.clones.forEach(clone => {
                if (clone.isFake && clone.active) {
                    ctx.save();
                    ctx.fillStyle = this.color; // Use boss color instead of hardcoded
                    ctx.shadowBlur = 20;
                    ctx.shadowColor = this.color;
                    ctx.beginPath();
                    ctx.arc(clone.x, clone.y, this.size, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();

                    // Draw fake health bar to match real boss
                    const barWidth = 60;
                    const barHeight = 6;
                    const healthPercent = this.health / this.maxHealth; // Match real boss HP

                    ctx.fillStyle = '#333';
                    ctx.fillRect(clone.x - barWidth / 2, clone.y - this.size - 15, barWidth, barHeight);

                    // Draw health based on actual boss HP
                    ctx.fillStyle = healthPercent > 0.5 ? '#00ff00' : (healthPercent > 0.25 ? '#ffff00' : '#ff0000');
                    ctx.fillRect(clone.x - barWidth / 2, clone.y - this.size - 15, barWidth * healthPercent, barHeight);
                }
            });

            // Draw subtle glitch effect on REAL boss only (10% chance)
            if (Math.random() < 0.1) {
                ctx.save();
                ctx.fillStyle = '#00ffff';
                ctx.globalAlpha = 0.5;
                ctx.beginPath();
                ctx.arc(this.x + (Math.random() - 0.5) * 10, this.y + (Math.random() - 0.5) * 10, this.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        }

        // Draw Legacy Mirror Image Clones (Level 10)
        this.clones.forEach(clone => {
            if (!clone.isFake && clone.lifetime) {
                const alpha = clone.lifetime / 3.0; // 180 frames / 60
                ctx.save();
                ctx.globalAlpha = alpha * 0.7;
                ctx.fillStyle = '#ff1493';
                ctx.shadowBlur = 20;
                ctx.shadowColor = '#ff1493';
                ctx.beginPath();
                ctx.arc(clone.x, clone.y, this.size * 0.8, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        });

        // Glitch effect (general)
        if (!this.realCloneActive && Math.random() < 0.1) {
            ctx.save();
            ctx.globalAlpha = 0.5;
            ctx.fillStyle = '#00ffff';
            ctx.beginPath();
            ctx.arc(this.x + (Math.random() - 0.5) * 10, this.y + (Math.random() - 0.5) * 10, this.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        if (this.screenTearActive) {
            ctx.restore();
        }
    }
}

