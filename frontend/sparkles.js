// Animated sparkles background using Canvas

class Sparkle {
  constructor(x, y, size, opacity) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.opacity = opacity;
    this.maxOpacity = opacity;
    this.twinkleSpeed = Math.random() * 0.03 + 0.01;
    this.isIncreasing = Math.random() > 0.5;
    this.drift = Math.random() * 0.5;
  }

  update() {
    // Twinkle effect
    if (this.isIncreasing) {
      this.opacity += this.twinkleSpeed;
      if (this.opacity >= this.maxOpacity) {
        this.isIncreasing = false;
      }
    } else {
      this.opacity -= this.twinkleSpeed;
      if (this.opacity <= this.maxOpacity * 0.3) {
        this.isIncreasing = true;
      }
    }

    // Gentle drift
    this.x += Math.sin(performance.now() * 0.001 + this.y) * 0.01;
  }

  draw(ctx) {
    ctx.fillStyle = `rgba(0, 0, 0, ${this.opacity})`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

class SparkleAnimation {
  constructor() {
    this.canvas = document.getElementById('sparkleCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.sparkles = [];
    this.animationId = null;

    this.resizeCanvas();
    this.createSparkles();
    this.animate();

    // Handle window resize
    window.addEventListener('resize', () => this.resizeCanvas());
  }

  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  createSparkles() {
    this.sparkles = [];
    const sparkleCount = Math.floor((this.canvas.width * this.canvas.height) / 50000);

    for (let i = 0; i < sparkleCount; i++) {
      const x = Math.random() * this.canvas.width;
      const y = Math.random() * this.canvas.height;
      const size = Math.random() * 1.5 + 0.5;
      const opacity = Math.random() * 0.6 + 0.2;

      this.sparkles.push(new Sparkle(x, y, size, opacity));
    }
  }

  animate() {
    // Clear canvas
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Update and draw sparkles
    this.sparkles.forEach((sparkle) => {
      sparkle.update();
      sparkle.draw(this.ctx);
    });

    this.animationId = requestAnimationFrame(() => this.animate());
  }

  destroy() {
    cancelAnimationFrame(this.animationId);
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new SparkleAnimation();
  });
} else {
  new SparkleAnimation();
}
