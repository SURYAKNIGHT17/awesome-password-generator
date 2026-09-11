/**
 * App.js - Main application logic connecting UI with password generator and animations
 */

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const passwordOutput = document.getElementById('password-output');
    const lengthSlider = document.getElementById('length-slider');
    const lengthValue = document.getElementById('length-value');
    const generateBtn = document.getElementById('generate-btn');
    const copyBtn = document.getElementById('copy-btn');
    const refreshBtn = document.getElementById('refresh-btn');
    const saveTemplateBtn = document.getElementById('save-template-btn');
    const loadTemplateBtn = document.getElementById('load-template-btn');
    const strengthMeter = document.getElementById('strength-meter');
    const strengthText = document.getElementById('strength-text');
    const entropyValue = document.getElementById('entropy-value');
    const historyList = document.getElementById('history-list');
    const templatesModal = document.getElementById('templates-modal');
    const templatesList = document.getElementById('templates-list');
    const closeModal = document.querySelector('.close-modal');
    const themeSwitch = document.getElementById('theme-switch');
    const typewriterWidget = document.getElementById('typewriter-widget');
    const maskHistoryBtn = document.getElementById('mask-history-btn');
    const clearHistoryBtn = document.getElementById('clear-history-btn');
    
    // Character set checkboxes
    const uppercaseCheck = document.getElementById('uppercase');
    const lowercaseCheck = document.getElementById('lowercase');
    const numbersCheck = document.getElementById('numbers');
    const symbolsCheck = document.getElementById('symbols');
    const excludeSimilarCheck = document.getElementById('exclude-similar');
    const pronounceableCheck = document.getElementById('pronounceable');
    const excludeCharsInput = document.getElementById('exclude-chars');
    
    // Current password data & state
    let currentPassword = '';
    let currentStrength = {};
    let multiplePasswords = [];
    let currentPasswordIndex = 0;
    let isHistoryMasked = true;
    let typewriterTimer = null;
    
    /**
     * Initialize the application
     */
    function init() {
        // Set initial values
        lengthValue.textContent = lengthSlider.value;
        
        // Set up event listeners
        setupEventListeners();
        
        // Load theme preference
        loadThemePreference();
        
        // Generate initial password
        generateNewPassword();
        
        // Render password history
        renderPasswordHistory();
    }
    
    /**
     * Trigger typewriter widget typing animation
     */
    function triggerTypewriterAnimation() {
        if (!typewriterWidget) return;
        typewriterWidget.classList.add('is-typing');
        clearTimeout(typewriterTimer);
        typewriterTimer = setTimeout(() => {
            typewriterWidget.classList.remove('is-typing');
        }, 1200);
    }
    
    /**
     * Set up all event listeners
     */
    function setupEventListeners() {
        // Slider events
        lengthSlider.addEventListener('input', () => {
            lengthValue.textContent = lengthSlider.value;
            triggerTypewriterAnimation();
            lengthValue.style.animation = 'none';
            setTimeout(() => {
                lengthValue.style.animation = 'float 0.5s ease-out';
            }, 10);
        });
        
        // Text input typing triggers typewriter animation
        if (excludeCharsInput) {
            excludeCharsInput.addEventListener('input', triggerTypewriterAnimation);
            excludeCharsInput.addEventListener('keydown', triggerTypewriterAnimation);
        }
        
        // Button events
        generateBtn.addEventListener('click', () => {
            triggerTypewriterAnimation();
            generateNewPassword();
        });
        copyBtn.addEventListener('click', copyToClipboard);
        refreshBtn.addEventListener('click', () => {
            triggerTypewriterAnimation();
            refreshPassword();
        });
        saveTemplateBtn.addEventListener('click', showSaveTemplatePrompt);
        loadTemplateBtn.addEventListener('click', showTemplatesModal);
        
        // History controls
        if (maskHistoryBtn) {
            maskHistoryBtn.addEventListener('click', () => {
                isHistoryMasked = !isHistoryMasked;
                maskHistoryBtn.innerHTML = isHistoryMasked ? 
                    '<i class="fas fa-eye-slash"></i> Mask' : 
                    '<i class="fas fa-eye"></i> Unmask';
                renderPasswordHistory();
            });
        }
        
        if (clearHistoryBtn) {
            clearHistoryBtn.addEventListener('click', () => {
                passwordGenerator.clearHistory();
                renderPasswordHistory();
                animationManager.showNotification('History cleared', 'fa-trash');
            });
        }
        
        // Checkbox events - add bounce effect
        const checkboxes = document.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                triggerTypewriterAnimation();
                const label = checkbox.nextElementSibling;
                if (label) {
                    label.style.animation = 'none';
                    setTimeout(() => {
                        label.style.animation = 'pulse 0.3s';
                    }, 10);
                }
                
                // Ensure at least one character set is selected
                ensureOneCharSetSelected();
                
                // Disable pronounceable if symbols or numbers are selected
                if (checkbox.id === 'symbols' || checkbox.id === 'numbers') {
                    if (checkbox.checked) {
                        pronounceableCheck.disabled = true;
                        pronounceableCheck.checked = false;
                        pronounceableCheck.parentElement.style.opacity = '0.5';
                    } else if (!numbersCheck.checked && !symbolsCheck.checked) {
                        pronounceableCheck.disabled = false;
                        pronounceableCheck.parentElement.style.opacity = '1';
                    }
                }
                
                // Disable numbers and symbols if pronounceable is selected
                if (checkbox.id === 'pronounceable') {
                    if (checkbox.checked) {
                        numbersCheck.disabled = true;
                        symbolsCheck.disabled = true;
                        numbersCheck.checked = false;
                        symbolsCheck.checked = false;
                        numbersCheck.parentElement.style.opacity = '0.5';
                        symbolsCheck.parentElement.style.opacity = '0.5';
                    } else {
                        numbersCheck.disabled = false;
                        symbolsCheck.disabled = false;
                        numbersCheck.parentElement.style.opacity = '1';
                        symbolsCheck.parentElement.style.opacity = '1';
                    }
                }
            });
        });
        
        // Modal events
        closeModal.addEventListener('click', () => {
            templatesModal.style.display = 'none';
        });
        closeModal.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                templatesModal.style.display = 'none';
            }
        });
        
        window.addEventListener('click', (e) => {
            if (e.target === templatesModal) {
                templatesModal.style.display = 'none';
            }
        });
        
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && templatesModal.style.display === 'flex') {
                templatesModal.style.display = 'none';
            }
        });
        
        // Theme switch
        themeSwitch.addEventListener('change', toggleTheme);
    }
    
    /**
     * Ensure at least one character set is selected
     */
    function ensureOneCharSetSelected() {
        if (!uppercaseCheck.checked && 
            !lowercaseCheck.checked && 
            !numbersCheck.checked && 
            !symbolsCheck.checked) {
            // If none are selected, default to lowercase
            lowercaseCheck.checked = true;
            animationManager.showNotification('At least one character set must be selected', 'fa-exclamation-circle');
        }
    }
    
    /**
     * Get current password generation options from UI
     * @returns {Object} Password generation options
     */
    function getPasswordOptions() {
        return {
            length: parseInt(lengthSlider.value),
            uppercase: uppercaseCheck.checked,
            lowercase: lowercaseCheck.checked,
            numbers: numbersCheck.checked,
            symbols: symbolsCheck.checked,
            excludeSimilar: excludeSimilarCheck.checked,
            excludeChars: excludeCharsInput.value,
            pronounceable: pronounceableCheck.checked
        };
    }
    
    /**
     * Generate a new password
     */
    function generateNewPassword() {
        // Show character rain animation during generation
        animationManager.characterRainEffect();
        
        // Get options from UI
        const options = getPasswordOptions();
        
        // Generate password
        const result = passwordGenerator.generatePassword(options);
        displayPassword(result);
        
        // Reset refresh button
        refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i>';
        refreshBtn.title = 'Generate new password';
        
        // Update password history display
        renderPasswordHistory();
    }
    
    /**
     * Display password and update strength indicators
     * @param {Object} result - Password generation result
     */
    function displayPassword(result) {
        currentPassword = result.password;
        currentStrength = result.strength;
        
        // Apply random animation effect to display password
        animationManager.applyRandomEffect(currentPassword);
        
        // Update strength meter
        updateStrengthMeter(currentStrength);
        
        // Add special effects based on strength
        if (currentStrength.score >= 75) {
            animationManager.pulseEffect();
        }
        if (currentStrength.score >= 90) {
            animationManager.screenShakeEffect();
            setTimeout(() => animationManager.matrixEffect(), 500);
        }
    }
    
    /**
     * Update the strength meter display
     * @param {Object} strength - Password strength details
     */
    function updateStrengthMeter(strength) {
        // Update text
        strengthText.textContent = strength.feedback.split(' - ')[0];
        entropyValue.textContent = Math.round(strength.entropy);
        
        // Update meter with animation
        animationManager.updateBackgroundGradient(strength.score);
    }
    
    /**
     * Copy password to clipboard
     */
    function copyToClipboard() {
        if (!currentPassword) return;
        
        navigator.clipboard.writeText(currentPassword).then(() => {
            // Show copy feedback animation
            animationManager.showCopyFeedback();
        }).catch(err => {
            console.error('Could not copy text: ', err);
            animationManager.showNotification('Failed to copy to clipboard', 'fa-times-circle');
        });
    }
    
    /**
     * Refresh/cycle through passwords
     */
    function refreshPassword() {
        if (multiplePasswords.length > 1) {
            // Cycle through multiple passwords
            currentPasswordIndex = (currentPasswordIndex + 1) % multiplePasswords.length;
            displayPassword(multiplePasswords[currentPasswordIndex]);
        } else {
            // Generate a new password
            generateNewPassword();
        }
    }
    
    /**
     * Render password history list safely (XSS-proof & supports masking)
     */
    function renderPasswordHistory() {
        historyList.innerHTML = '';
        
        if (passwordGenerator.passwordHistory.length === 0) {
            const emptyDiv = document.createElement('div');
            emptyDiv.className = 'empty-history';
            emptyDiv.textContent = 'No passwords generated yet';
            historyList.appendChild(emptyDiv);
            return;
        }
        
        passwordGenerator.passwordHistory.forEach((item) => {
            const historyItem = document.createElement('div');
            historyItem.classList.add('history-item');
            
            const passwordDiv = document.createElement('div');
            passwordDiv.classList.add('history-password');
            passwordDiv.textContent = isHistoryMasked ? '•'.repeat(Math.min(item.password.length, 24)) : item.password;
            
            const actionsDiv = document.createElement('div');
            actionsDiv.classList.add('history-actions');
            
            const date = new Date(item.timestamp);
            const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            const timeSpan = document.createElement('span');
            timeSpan.classList.add('history-time');
            timeSpan.textContent = timeString;
            
            const copyBtn = document.createElement('button');
            copyBtn.className = 'btn history-copy';
            copyBtn.title = 'Copy to clipboard';
            copyBtn.setAttribute('aria-label', 'Copy password from history');
            copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
            
            copyBtn.addEventListener('click', () => {
                navigator.clipboard.writeText(item.password).then(() => {
                    animationManager.showNotification('Copied from history', 'fa-copy');
                });
            });
            
            actionsDiv.appendChild(timeSpan);
            actionsDiv.appendChild(copyBtn);
            
            historyItem.appendChild(passwordDiv);
            historyItem.appendChild(actionsDiv);
            
            historyList.appendChild(historyItem);
        });
    }
    
    /**
     * Show prompt to save current options as template
     */
    function showSaveTemplatePrompt() {
        const templateName = prompt('Enter a name for this template:');
        if (templateName && templateName.trim() !== '') {
            const options = getPasswordOptions();
            passwordGenerator.saveTemplate(templateName.trim(), options);
            animationManager.showNotification('Template saved', 'fa-save');
        }
    }
    
    /**
     * Show templates modal with saved templates (XSS-proof)
     */
    function showTemplatesModal() {
        templatesList.innerHTML = '';
        const templates = passwordGenerator.getTemplates();
        
        if (templates.length === 0) {
            const emptyDiv = document.createElement('div');
            emptyDiv.className = 'empty-templates';
            emptyDiv.textContent = 'No saved templates';
            templatesList.appendChild(emptyDiv);
        } else {
            templates.forEach((template, index) => {
                const templateItem = document.createElement('div');
                templateItem.classList.add('template-item');
                
                const nameDiv = document.createElement('div');
                nameDiv.classList.add('template-name');
                nameDiv.textContent = template.name; // Safe against XSS
                
                const charSets = [];
                if (template.options.uppercase) charSets.push('ABC');
                if (template.options.lowercase) charSets.push('abc');
                if (template.options.numbers) charSets.push('123');
                if (template.options.symbols) charSets.push('#@!');
                
                const date = new Date(template.created);
                const dateString = date.toLocaleDateString();
                
                const detailsDiv = document.createElement('div');
                detailsDiv.classList.add('template-details');
                
                const lenSpan = document.createElement('span');
                lenSpan.textContent = `Length: ${parseInt(template.options.length)} `;
                const setSpan = document.createElement('span');
                setSpan.textContent = `Sets: ${charSets.join(', ')} `;
                const dateSpan = document.createElement('span');
                dateSpan.textContent = `Created: ${dateString}`;
                
                detailsDiv.appendChild(lenSpan);
                detailsDiv.appendChild(setSpan);
                detailsDiv.appendChild(dateSpan);
                
                const actionsDiv = document.createElement('div');
                actionsDiv.classList.add('template-actions');
                
                const loadBtn = document.createElement('button');
                loadBtn.className = 'btn template-load';
                loadBtn.title = 'Load template';
                loadBtn.setAttribute('aria-label', `Load template ${template.name}`);
                loadBtn.innerHTML = '<i class="fas fa-check"></i>';
                loadBtn.addEventListener('click', () => {
                    loadTemplate(template.options);
                    templatesModal.style.display = 'none';
                });
                
                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'btn template-delete';
                deleteBtn.title = 'Delete template';
                deleteBtn.setAttribute('aria-label', `Delete template ${template.name}`);
                deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
                deleteBtn.addEventListener('click', () => {
                    if (confirm(`Delete template "${template.name}"?`)) {
                        passwordGenerator.deleteTemplate(index);
                        showTemplatesModal();
                    }
                });
                
                actionsDiv.appendChild(loadBtn);
                actionsDiv.appendChild(deleteBtn);
                
                templateItem.appendChild(nameDiv);
                templateItem.appendChild(detailsDiv);
                templateItem.appendChild(actionsDiv);
                
                templatesList.appendChild(templateItem);
            });
        }
        
        templatesModal.style.display = 'flex';
    }
    
    /**
     * Load template options into UI
     * @param {Object} options - Template options
     */
    function loadTemplate(options) {
        // Update UI elements
        lengthSlider.value = options.length;
        lengthValue.textContent = options.length;
        
        uppercaseCheck.checked = options.uppercase;
        lowercaseCheck.checked = options.lowercase;
        numbersCheck.checked = options.numbers;
        symbolsCheck.checked = options.symbols;
        excludeSimilarCheck.checked = options.excludeSimilar;
        pronounceableCheck.checked = options.pronounceable;
        excludeCharsInput.value = options.excludeChars || '';
        
        // Handle disabled states
        if (options.pronounceable) {
            numbersCheck.disabled = true;
            symbolsCheck.disabled = true;
            numbersCheck.parentElement.style.opacity = '0.5';
            symbolsCheck.parentElement.style.opacity = '0.5';
        } else {
            numbersCheck.disabled = false;
            symbolsCheck.disabled = false;
            numbersCheck.parentElement.style.opacity = '1';
            symbolsCheck.parentElement.style.opacity = '1';
        }
        
        if (options.numbers || options.symbols) {
            pronounceableCheck.disabled = true;
            pronounceableCheck.parentElement.style.opacity = '0.5';
        } else {
            pronounceableCheck.disabled = false;
            pronounceableCheck.parentElement.style.opacity = '1';
        }
        
        // Generate new password with loaded options
        generateNewPassword();
        animationManager.showNotification('Template loaded', 'fa-check-circle');
    }
    
    /**
     * Toggle between light and dark theme
     */
    function toggleTheme() {
        if (themeSwitch.checked) {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
        }
    }
    
    /**
     * Load theme preference from localStorage
     */
    function loadThemePreference() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            themeSwitch.checked = true;
            document.documentElement.setAttribute('data-theme', 'dark');
        }
    }
    
    // Initialize the application
    init();
});