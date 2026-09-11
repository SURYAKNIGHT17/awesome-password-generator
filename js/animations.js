/**
 * Animations.js - Handles all visual animations and effects for the password generator
 */

class AnimationManager {
    constructor() {
        this.animationContainer = document.getElementById('animation-container');
        this.passwordOutput = document.getElementById('password-output');
        this.strengthMeter = document.getElementById('strength-meter');
        this.body = document.body;
        
        // Animation settings
        this.particleCount = 30;
        this.matrixDensity = 0.5;
        this.rainCharacters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
        
        // Initialize background particles
        this.initBackgroundParticles();
    }
    
    /**
     * Initialize floating background particles
     */
    initBackgroundParticles() {
        for (let i = 0; i < this.particleCount; i++) {
            const particle = document.createElement('div');
            particle.classList.add('particle');
            
            // Random size between 5px and 15px
            const size = Math.random() * 10 + 5;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            
            // Random position
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.top = `${Math.random() * 100}%`;
            
            // Random animation delay
            particle.style.animationDelay = `${Math.random() * 5}s`;
            
            this.animationContainer.appendChild(particle);
        }
    }
    
    /**
     * Show character rain effect during password generation
     */
    characterRainEffect() {
        // Clear previous rain characters
        const existingRain = document.querySelectorAll('.rain-character');
        existingRain.forEach(el => el.remove());
        
        // Create new rain characters
        const screenWidth = window.innerWidth;
        const charCount = Math.floor(screenWidth / 20); // Approximately one character every 20px
        
        for (let i = 0; i < charCount; i++) {
            const char = document.createElement('div');
            char.classList.add('rain-character');
            
            // Random character from the pool
            char.textContent = this.rainCharacters.charAt(Math.floor(Math.random() * this.rainCharacters.length));
            
            // Random position and delay
            char.style.left = `${Math.random() * 100}%`;
            char.style.animationDelay = `${Math.random() * 2}s`;
            char.style.fontSize = `${Math.random() * 16 + 12}px`;
            char.style.opacity = `${Math.random() * 0.5 + 0.5}`;
            
            this.animationContainer.appendChild(char);
            
            // Remove after animation completes
            setTimeout(() => {
                if (char && char.parentNode) {
                    char.parentNode.removeChild(char);
                }
            }, 3000);
        }
    }
    
    /**
     * Matrix-style character cascade effect
     */
    matrixEffect() {
        const matrixContainer = document.createElement('div');
        matrixContainer.classList.add('matrix-effect');
        this.animationContainer.appendChild(matrixContainer);
        
        const columns = Math.floor(window.innerWidth / 20);
        const characters = '01';
        
        for (let i = 0; i < columns * this.matrixDensity; i++) {
            const matrixChar = document.createElement('div');
            matrixChar.classList.add('matrix-character');
            matrixChar.textContent = characters.charAt(Math.floor(Math.random() * characters.length));
            
            matrixChar.style.left = `${Math.random() * 100}%`;
            matrixChar.style.animationDuration = `${Math.random() * 3 + 1}s`;
            matrixChar.style.opacity = `${Math.random() * 0.5 + 0.3}`;
            
            matrixContainer.appendChild(matrixChar);
        }
        
        // Remove matrix effect after animation
        setTimeout(() => {
            if (matrixContainer && matrixContainer.parentNode) {
                matrixContainer.parentNode.removeChild(matrixContainer);
            }
        }, 3000);
    }
    
    /**
     * Typewriter effect for revealing password
     * @param {string} password - The password to reveal
     * @param {function} callback - Function to call after animation completes
     */
    /**
     * Typewriter effect for revealing password
     * @param {string} password - The password to reveal
     * @param {function} callback - Function to call after animation completes
     */
    typewriterEffect(password, callback) {
        this.passwordOutput.textContent = '';
        this.passwordOutput.classList.add('typewriter');
        
        let i = 0;
        const typing = setInterval(() => {
            if (i < password.length) {
                this.passwordOutput.textContent += password.charAt(i);
                i++;
            } else {
                clearInterval(typing);
                this.passwordOutput.classList.remove('typewriter');
                if (callback) callback();
            }
        }, Math.max(10, 500 / password.length));
    }
    
    /**
     * Slot machine effect for password characters
     * @param {string} password - The final password to display
     */
    slotMachineEffect(password) {
        this.passwordOutput.innerHTML = '';
        
        // Limit slot machine effect to 40 characters max for performance
        if (password.length > 40) {
            this.passwordOutput.textContent = password;
            return;
        }
        
        for (let i = 0; i < password.length; i++) {
            const slotContainer = document.createElement('span');
            slotContainer.classList.add('slot-machine');
            
            const slot = document.createElement('div');
            slot.classList.add('slot');
            
            const chars = this.rainCharacters + password[i];
            const numChars = 8;
            for (let j = 0; j < numChars; j++) {
                const randomChar = chars.charAt(Math.floor(Math.random() * chars.length));
                const charSpan = document.createElement('span');
                charSpan.style.display = 'block';
                charSpan.textContent = randomChar;
                slot.appendChild(charSpan);
            }
            
            const finalChar = document.createElement('span');
            finalChar.style.display = 'block';
            finalChar.textContent = password[i];
            slot.appendChild(finalChar);
            
            slotContainer.appendChild(slot);
            this.passwordOutput.appendChild(slotContainer);
            
            setTimeout(() => {
                slot.style.transform = `translateY(-${numChars * 100}%)`;
            }, i * 30);
        }
    }
    
    /**
     * Glitch effect for secure theme
     * @param {string} text - Text to apply glitch effect to
     */
    glitchEffect(text) {
        const glitchElement = document.createElement('div');
        glitchElement.classList.add('glitch');
        glitchElement.setAttribute('data-text', text);
        glitchElement.textContent = text;
        
        this.passwordOutput.innerHTML = '';
        this.passwordOutput.appendChild(glitchElement);
        
        // Remove glitch effect after a few seconds
        setTimeout(() => {
            if (this.passwordOutput.contains(glitchElement)) {
                this.passwordOutput.innerHTML = text;
            }
        }, 3000);
    }
    
    /**
     * Pulse/glow effect for strong passwords
     */
    pulseEffect() {
        this.passwordOutput.parentElement.style.animation = 'pulse 1s 3';
        
        // Remove animation after it completes
        setTimeout(() => {
            this.passwordOutput.parentElement.style.animation = '';
        }, 3000);
    }
    
    /**
     * Screen shake for ultra-strong passwords
     */
    screenShakeEffect() {
        this.body.style.animation = 'shake 0.5s';
        
        // Remove animation after it completes
        setTimeout(() => {
            this.body.style.animation = '';
        }, 500);
    }
    
    /**
     * Update background gradient based on password strength
     * @param {number} strength - Password strength value (0-100)
     */
    updateBackgroundGradient(strength) {
        let color1, color2;
        
        if (strength < 25) {
            // Weak - Red to Orange
            color1 = '#ff4757';
            color2 = '#ff6b81';
        } else if (strength < 50) {
            // Medium - Orange to Yellow
            color1 = '#ff6b81';
            color2 = '#ffa502';
        } else if (strength < 75) {
            // Strong - Yellow to Green
            color1 = '#ffa502';
            color2 = '#2ed573';
        } else {
            // Very Strong - Green to Blue
            color1 = '#2ed573';
            color2 = '#1e90ff';
        }
        
        // Apply gradient to strength meter
        this.strengthMeter.style.background = `linear-gradient(to right, ${color1}, ${color2})`;
        this.strengthMeter.style.width = `${strength}%`;
    }
    
    /**
     * Show copy to clipboard feedback
     */
    showCopyFeedback() {
        const feedbackElement = document.createElement('div');
        feedbackElement.classList.add('copy-feedback');
        feedbackElement.textContent = 'Copied to clipboard!';
        
        this.passwordOutput.parentElement.appendChild(feedbackElement);
        feedbackElement.classList.add('show');
        
        // Remove feedback after animation
        setTimeout(() => {
            if (feedbackElement && feedbackElement.parentNode) {
                feedbackElement.parentNode.removeChild(feedbackElement);
            }
        }, 1000);
    }
    
    /**
     * Show notification
     * @param {string} message - Notification message
     * @param {string} icon - Font Awesome icon class
     */
    showNotification(message, icon = 'fa-check-circle') {
        // Remove existing notification if any
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        // Create new notification
        const notification = document.createElement('div');
        notification.classList.add('notification');
        
        const iconElement = document.createElement('i');
        iconElement.className = `fas ${icon}`;
        
        const textElement = document.createElement('span');
        textElement.textContent = message;
        
        notification.appendChild(iconElement);
        notification.appendChild(textElement);
        
        document.body.appendChild(notification);
        
        // Show with animation
        setTimeout(() => notification.classList.add('show'), 10);
        
        // Hide after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    /**
     * Apply random animation effect to password display
     * @param {string} password - The password to display
     */
    applyRandomEffect(password) {
        const effects = [
            () => this.typewriterEffect(password),
            () => this.slotMachineEffect(password),
            () => this.glitchEffect(password),
        ];
        
        // Choose random effect
        const randomEffect = effects[Math.floor(Math.random() * effects.length)];
        randomEffect();
    }
}

// Create global animation manager instance
const animationManager = new AnimationManager();