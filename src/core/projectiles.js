// Projectile System
class Projectile {
    constructor(x, y, vx, vy, damage, owner, color = '#ffff00', size = 4, maxLifetime = 3.0) {
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
        this.maxLifetime = maxLifetime; // Custom lifetime or default 3.0 seconds
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

class BoomerangProjectile extends Projectile {
    constructor(x, y, angle, speed, damage, owner, color = '#8b0000') {
        super(x, y, 0, 0, damage, owner, color, 8);
        this.originX = x;
        this.originY = y;
        this.angle = angle;
        this.speed = speed;
        this.maxLifetime = 3.0; // Total journey time
        this.rotationAngle = 0;

        // Arc parameters for boomerang trajectory
        this.arcRadius = 200; // How far out the boomerang goes
        this.arcSpeed = Math.PI / 1.5; // Speed of arc traversal (radians per second)
    }

    update(canvas, dt) {
        this.lifetime += dt;

        // Calculate position along the boomerang arc
        // The boomerang travels in a circle around a point offset from the origin
        const t = this.lifetime * this.arcSpeed;

        // Create an arc that goes out and comes back
        // At t=0, starts at origin
        // At t=PI, reaches maximum distance
        // At t=2*PI, returns to origin
        const progress = Math.min(t, Math.PI * 2);

        // Offset the center of the arc in the direction of the initial angle
        const centerOffsetX = this.originX + Math.cos(this.angle) * this.arcRadius;
        const centerOffsetY = this.originY + Math.sin(this.angle) * this.arcRadius;

        // Calculate position on the circular arc
        this.x = centerOffsetX + Math.cos(this.angle + Math.PI + progress) * this.arcRadius;
        this.y = centerOffsetY + Math.sin(this.angle + Math.PI + progress) * this.arcRadius;

        // Calculate velocity for drawing direction
        const nextT = progress + 0.1;
        const nextX = centerOffsetX + Math.cos(this.angle + Math.PI + nextT) * this.arcRadius;
        const nextY = centerOffsetY + Math.sin(this.angle + Math.PI + nextT) * this.arcRadius;
        this.vx = (nextX - this.x) * 10;
        this.vy = (nextY - this.y) * 10;

        // Update rotation for spinning effect
        this.rotationAngle += 12 * dt; // Spin speed

        // Deactivate if completed the full arc or too old
        if (progress >= Math.PI * 2 || this.lifetime > this.maxLifetime) {
            this.active = false;
        }

        // Out of bounds check (but allow some leeway for arc)
        if (this.x < -100 || this.x > canvas.width + 100 ||
            this.y < -100 || this.y > canvas.height + 100) {
            this.active = false;
        }
    }

    draw(ctx) {
        ctx.save();

        // Draw blood trail
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.3;
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        const trailLength = 20;
        ctx.beginPath();
        ctx.moveTo(
            this.x - Math.cos(Math.atan2(this.vy, this.vx)) * trailLength,
            this.y - Math.sin(Math.atan2(this.vy, this.vx)) * trailLength
        );
        ctx.lineTo(this.x, this.y);
        ctx.stroke();

        // Draw spinning scythe
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotationAngle);
        ctx.globalAlpha = 1;

        // Scythe blade (crescent shape)
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.color;

        // Draw crescent moon shape for scythe
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.fill();

        // Add blade extension
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(this.size * 2, -this.size / 2);
        ctx.lineTo(this.size * 2, this.size / 2);
        ctx.closePath();
        ctx.fill();

        // Add glow effect
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = '#ff0000';
        ctx.beginPath();
        ctx.arc(0, 0, this.size * 0.6, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
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
