// Projectile System
class Projectile {
    constructor(x, y, vx, vy, damage, owner, color = '#ffff00', size = 4) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.damage = damage;
        this.owner = owner; // 'player' or 'boss'
        this.color = color;
        this.size = size;
        this.active = true;
        this.lifetime = 0;
        this.maxLifetime = 3.0; // 180 frames / 60
    }

    update(canvas, dt) {
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.lifetime += dt;

        // Remove if out of bounds or too old
        if (this.x < 0 || this.x > canvas.width ||
            this.y < 0 || this.y > canvas.height ||
            this.lifetime > this.maxLifetime) {
            this.active = false;
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.color;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    checkCollision(entity) {
        const dx = this.x - entity.x;
        const dy = this.y - entity.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < this.size + entity.size;
    }
}

// Special Projectile Types
class HomingProjectile extends Projectile {
    constructor(x, y, speed, damage, owner, target, color = '#ff00ff') {
        super(x, y, 0, 0, damage, owner, color, 6);
        this.speed = speed;
        this.target = target;
        this.turnRate = 0.05 * 60; // 3 radians/sec
    }

    update(canvas, dt) {
        // Calculate direction to target
        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        const angle = Math.atan2(dy, dx);

        // Update velocity to home towards target
        this.vx += Math.cos(angle) * this.turnRate * dt;
        this.vy += Math.sin(angle) * this.turnRate * dt;

        // Normalize and apply speed
        const mag = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (mag > 0) {
            this.vx = (this.vx / mag) * this.speed;
            this.vy = (this.vy / mag) * this.speed;
        }

        super.update(canvas, dt);
    }

    draw(ctx) {
        // Draw with trail effect
        ctx.save();
        ctx.shadowBlur = 20;
        ctx.shadowColor = this.color;

        // Trail
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 3;
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.moveTo(this.x - this.vx * 2, this.y - this.vy * 2);
        ctx.lineTo(this.x, this.y);
        ctx.stroke();

        // Main projectile
        ctx.globalAlpha = 1;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

class BouncingProjectile extends Projectile {
    constructor(x, y, vx, vy, damage, owner, color = '#ff6600') {
        super(x, y, vx, vy, damage, owner, color, 8);
        this.bounces = 0;
        this.maxBounces = 3;
    }

    update(canvas, dt) {
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.lifetime += dt;

        // Bounce off walls
        if (this.x < this.size || this.x > canvas.width - this.size) {
            this.vx *= -1;
            this.x = Math.max(this.size, Math.min(canvas.width - this.size, this.x));
            this.bounces++;
        }
        if (this.y < this.size || this.y > canvas.height - this.size) {
            this.vy *= -1;
            this.y = Math.max(this.size, Math.min(canvas.height - this.size, this.y));
            this.bounces++;
        }

        if (this.bounces > this.maxBounces || this.lifetime > this.maxLifetime) {
            this.active = false;
        }
    }
}

class ExplodingProjectile extends Projectile {
    constructor(x, y, vx, vy, damage, owner, color = '#ff0000') {
        super(x, y, vx, vy, damage, owner, color, 10);
        this.exploded = false;
        this.explosionRadius = 60;
        this.explosionTime = 0;
        this.maxExplosionTime = 0.35; // 20 frames / 60
    }

    explode() {
        this.exploded = true;
        this.vx = 0;
        this.vy = 0;
    }

    update(canvas, dt) {
        if (!this.exploded) {
            super.update(canvas, dt);
        } else {
            this.explosionTime += dt;
            if (this.explosionTime > this.maxExplosionTime) {
                this.active = false;
            }
        }
    }

    draw(ctx) {
        if (!this.exploded) {
            super.draw(ctx);
        } else {
            // Draw explosion
            const progress = this.explosionTime / this.maxExplosionTime;
            const radius = this.explosionRadius * progress;
            const alpha = 1 - progress;

            ctx.save();
            ctx.globalAlpha = alpha;

            // Outer ring
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 5;
            ctx.shadowBlur = 30;
            ctx.shadowColor = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, radius, 0, Math.PI * 2);
            ctx.stroke();

            // Inner glow
            ctx.fillStyle = this.color;
            ctx.globalAlpha = alpha * 0.3;
            ctx.beginPath();
            ctx.arc(this.x, this.y, radius * 0.7, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    checkExplosionCollision(entity) {
        if (!this.exploded) return false;

        const dx = this.x - entity.x;
        const dy = this.y - entity.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < this.explosionRadius;
    }
}

// Particle Effects
class Particle {
    constructor(x, y, color, size = 3) {
        this.x = x;
        this.y = y;
        const angle = Math.random() * Math.PI * 2;
        const speed = (Math.random() * 3 + 1) * 60; // Scale speed
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.color = color;
        this.size = size;
        this.life = 1;
        this.decay = (Math.random() * 0.02 + 0.01) * 60; // Scale decay
    }

    update(dt) {
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.vy += 6.0 * dt; // gravity 0.1 * 60
        this.life -= this.decay * dt;
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    isAlive() {
        return this.life > 0;
    }
}
