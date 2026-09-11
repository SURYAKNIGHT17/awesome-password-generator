/**
 * Password Generator - Core functionality for generating secure passwords
 * Implements cryptographically secure random generation with various options
 */

class PasswordGenerator {
    constructor() {
        // Character sets
        this.charSets = {
            uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
            lowercase: 'abcdefghijklmnopqrstuvwxyz',
            numbers: '0123456789',
            symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
        };
        
        // Similar characters that can be excluded
        this.similarChars = '0O1lI';
        
        // Common patterns to avoid in strong passwords
        this.commonPatterns = [
            '123456', 'password', 'qwerty', 'admin', 
            'welcome', 'abc123', '111111', '12345678'
        ];
        
        // Pronounceable patterns (consonant-vowel combinations)
        this.consonants = 'bcdfghjklmnpqrstvwxyz';
        this.vowels = 'aeiou';
        
        // Password history
        this.passwordHistory = [];
        
        // Password templates
        this.templates = JSON.parse(localStorage.getItem('passwordTemplates')) || [];
    }
    
    /**
     * Generate an unbiased cryptographically secure random integer in range [0, max)
     * Rejection sampling eliminates modulo bias
     * @param {number} max - Upper bound (exclusive)
     * @returns {number} Random integer between 0 and max-1
     */
    getRandomInt(max) {
        if (max <= 0) return 0;
        const maxUint = 0xffffffff;
        const limit = maxUint - (maxUint % max);
        const array = new Uint32Array(1);
        
        let rand;
        do {
            window.crypto.getRandomValues(array);
            rand = array[0];
        } while (rand >= limit);
        
        return rand % max;
    }
    
    /**
     * Get a random character from a string using unbiased CSPRNG
     * @param {string} characters - The character set to choose from
     * @returns {string} A random character
     */
    getRandomChar(characters) {
        if (!characters || characters.length === 0) return '';
        const randomIndex = this.getRandomInt(characters.length);
        return characters.charAt(randomIndex);
    }
    
    /**
     * Shuffle an array using Fisher-Yates algorithm with CSPRNG
     * @param {Array} array - The array to shuffle
     * @returns {Array} The shuffled array
     */
    shuffleArray(array) {
        const result = [...array];
        for (let i = result.length - 1; i > 0; i--) {
            const j = this.getRandomInt(i + 1);
            [result[i], result[j]] = [result[j], result[i]];
        }
        return result;
    }
    
    /**
     * Filter a character set according to user exclusion options
     * @param {string} charSetString - Base character set
     * @param {Object} options - Password options
     * @returns {string} Filtered character set
     */
    getFilteredCharSet(charSetString, options) {
        let result = charSetString;
        if (options.excludeSimilar) {
            result = [...result].filter(c => !this.similarChars.includes(c)).join('');
        }
        if (options.excludeChars) {
            result = [...result].filter(c => !options.excludeChars.includes(c)).join('');
        }
        return result;
    }
    
    /**
     * Calculate the character pool based on selected options
     * @param {Object} options - Password generation options
     * @returns {string} The character pool
     */
    calculateCharPool(options) {
        let charPool = '';
        
        if (options.uppercase) charPool += this.getFilteredCharSet(this.charSets.uppercase, options);
        if (options.lowercase) charPool += this.getFilteredCharSet(this.charSets.lowercase, options);
        if (options.numbers) charPool += this.getFilteredCharSet(this.charSets.numbers, options);
        if (options.symbols) charPool += this.getFilteredCharSet(this.charSets.symbols, options);
        
        return charPool;
    }
    
    /**
     * Find a partition of targetLength into a list of word lengths from [8, 7, 6, 5, 4, 3, 2]
     * @param {number} targetLength - Target character length for words
     * @returns {Array<number>} Array of word lengths summing exactly to targetLength
     */
    findWordLengthPartition(targetLength) {
        const validLengths = [8, 7, 6, 5, 4, 3, 2];
        const partition = [];
        let remaining = targetLength;

        while (remaining > 0) {
            const possible = validLengths.filter(l => {
                if (l > remaining) return false;
                const rem = remaining - l;
                return rem === 0 || rem >= 2;
            });

            if (possible.length === 0) {
                if (partition.length > 0) {
                    const prev = partition.pop();
                    remaining += prev;
                    continue;
                }
                break;
            }

            const chosen = possible[this.getRandomInt(possible.length)];
            partition.push(chosen);
            remaining -= chosen;
        }

        return partition;
    }

    /**
     * Generate a pronounceable passphrase composed of real, friendly English words
     * @param {number} length - Target password length
     * @param {Object} options - Password generation options
     * @returns {string} A clear, readable, real-word pronounceable password
     */
    generatePronounceable(length, options = {}) {
        const wordPools = {
            2: ['in', 'on', 'at', 'go', 'up', 'us', 'me', 'we', 'be', 'so', 'to', 'no', 'is', 'it', 'am', 'ox', 'my', 'by', 'do', 'he'],
            3: ['sky', 'sun', 'sea', 'fox', 'gem', 'cat', 'owl', 'bay', 'oak', 'ice', 'art', 'ray', 'joy', 'air', 'fly', 'run', 'zen', 'top', 'key', 'fir', 'dew', 'arc', 'hub', 'orb', 'zip', 'red', 'cup', 'pen', 'box', 'hut'],
            4: ['star', 'wave', 'wind', 'moon', 'fire', 'rain', 'snow', 'blue', 'gold', 'ruby', 'jade', 'echo', 'aura', 'bold', 'kind', 'warm', 'glow', 'pure', 'peak', 'cove', 'palm', 'pine', 'rose', 'dawn', 'dusk', 'haze', 'mist', 'lion', 'bear', 'hawk', 'dove', 'fern', 'sage', 'moss', 'apex', 'flux', 'vibe', 'pulse', 'hero', 'hope', 'leaf', 'nest', 'rock', 'silk', 'team', 'tide', 'unit', 'vast', 'wild', 'zeal'],
            5: ['solar', 'breeze', 'cloud', 'flame', 'river', 'ocean', 'frost', 'amber', 'pearl', 'magic', 'spark', 'light', 'crest', 'bloom', 'grove', 'haven', 'swift', 'vivid', 'clear', 'noble', 'grand', 'royal', 'titan', 'comet', 'orbit', 'pulse', 'sonic', 'bliss', 'charm', 'dream', 'cedar', 'hazel', 'ember', 'glade', 'prism', 'valor', 'vigor', 'alpha', 'bravo', 'crown', 'eagle', 'giant', 'honor', 'karma', 'lemon', 'mango', 'oasis', 'peace', 'quest', 'radar', 'shine', 'tiger', 'unity', 'viper'],
            6: ['planet', 'galaxy', 'meteor', 'shadow', 'silver', 'crystal', 'forest', 'canyon', 'island', 'summit', 'aurora', 'cosmic', 'zenith', 'wonder', 'spirit', 'shield', 'castle', 'falcon', 'harbor', 'legend', 'meadow', 'velvet', 'beacon', 'bounty', 'bridge', 'dragon', 'orion', 'phoenix', 'timber', 'whisper', 'anchor', 'bamboo', 'cactus', 'clover', 'cosmo', 'jungle', 'knight', 'legacy', 'marble', 'mirage', 'nature', 'orchid', 'palace', 'quartz', 'safari', 'spring', 'sunset', 'trophy', 'willow', 'winter'],
            7: ['ancient', 'captain', 'diamond', 'emerald', 'feather', 'freedom', 'glacier', 'harmony', 'horizon', 'journey', 'kingdom', 'lantern', 'liberty', 'miracle', 'mystery', 'origami', 'passion', 'phantom', 'pioneer', 'rainbow', 'silence', 'triumph', 'twilight', 'universe', 'victory'],
            8: ['absolute', 'blossom', 'champion', 'corridor', 'daylight', 'dynasty', 'explorer', 'fountain', 'guardian', 'heritage', 'infinity', 'mountain', 'paradise', 'pinnacle', 'radiance', 'sapphire', 'sentinel', 'spectrum', 'starlight', 'sunshine', 'symmetry', 'tranquil', 'velocity']
        };

        const getFilteredPool = (len) => {
            const basePool = wordPools[len] || [];
            if (!options.excludeSimilar && !options.excludeChars) {
                return basePool;
            }
            const filtered = basePool.filter(w => {
                if (options.excludeSimilar) {
                    if ([...w].some(c => this.similarChars.includes(c))) return false;
                }
                if (options.excludeChars) {
                    if ([...w].some(c => options.excludeChars.includes(c))) return false;
                }
                return true;
            });
            return filtered.length > 0 ? filtered : basePool;
        };

        let targetWordLength = length;
        let numSuffix = '';
        let symSuffix = '';

        if (options.numbers && targetWordLength > 4) {
            const numLen = targetWordLength >= 12 ? 2 : 1;
            targetWordLength -= numLen;
            const numberChars = this.getFilteredCharSet(this.charSets.numbers, options) || '23456789';
            for (let i = 0; i < numLen; i++) {
                numSuffix += this.getRandomChar(numberChars);
            }
        }

        if (options.symbols && targetWordLength > 4) {
            targetWordLength -= 1;
            const symbolChars = this.getFilteredCharSet(this.charSets.symbols, options) || '!@#$%';
            symSuffix = this.getRandomChar(symbolChars);
        }

        const partition = this.findWordLengthPartition(targetWordLength);
        let words = [];

        for (const len of partition) {
            const pool = getFilteredPool(len);
            let word = pool[this.getRandomInt(pool.length)];
            if (options.uppercase !== false) {
                word = word.charAt(0).toUpperCase() + word.slice(1);
            } else {
                word = word.toLowerCase();
            }
            words.push(word);
        }

        let result = words.join('') + numSuffix + symSuffix;

        if (result.length < length) {
            const extraPool = this.getFilteredCharSet(this.charSets.lowercase, options) || 'aeiou';
            while (result.length < length) {
                result += this.getRandomChar(extraPool);
            }
        } else if (result.length > length) {
            result = result.substring(0, length);
        }

        return result;
    }
    
    /**
     * Ensure password contains at least one character from each selected category
     * without re-introducing excluded characters
     * @param {string} password - The generated password
     * @param {Object} options - Password generation options
     * @returns {string} Password satisfying category requirements
     */
    ensureCharacterRequirements(password, options) {
        const passwordArray = password.split('');
        const categories = [];
        
        if (options.uppercase) categories.push(this.getFilteredCharSet(this.charSets.uppercase, options));
        if (options.lowercase) categories.push(this.getFilteredCharSet(this.charSets.lowercase, options));
        if (options.numbers) categories.push(this.getFilteredCharSet(this.charSets.numbers, options));
        if (options.symbols) categories.push(this.getFilteredCharSet(this.charSets.symbols, options));
        
        const validCategories = categories.filter(set => set.length > 0);
        if (validCategories.length === 0) return password;
        
        // Find categories that are missing in current password
        let missingCategories = validCategories.filter(set => {
            return ![...password].some(char => set.includes(char));
        });
        
        if (missingCategories.length === 0) return password;
        
        // Replace random positions with missing category characters
        let positions = this.shuffleArray([...Array(password.length).keys()]);
        let posIndex = 0;
        
        for (const missingSet of missingCategories) {
            if (posIndex < positions.length) {
                passwordArray[positions[posIndex]] = this.getRandomChar(missingSet);
                posIndex++;
            }
        }
        
        return passwordArray.join('');
    }
    
    /**
     * Check if password contains common patterns
     * @param {string} password - The password to check
     * @returns {boolean} True if password contains common patterns
     */
    containsCommonPatterns(password) {
        const lowercasePassword = password.toLowerCase();
        
        // Check for common password patterns
        for (const pattern of this.commonPatterns) {
            if (lowercasePassword.includes(pattern)) {
                return true;
            }
        }
        
        // Check for repeated characters (more than 3 in a row)
        if (/([a-zA-Z0-9!@#$%^&*()_+\-=\[\]{}|;:,.<>?])\1{2,}/.test(password)) {
            return true;
        }
        
        // Check for sequential characters
        if (/(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|012|123|234|345|456|567|678|789)/i.test(password)) {
            return true;
        }
        
        return false;
    }
    
    /**
     * Calculate password entropy
     * @param {string} charPool - Character pool used for generation
     * @param {number} length - Password length
     * @returns {number} Password entropy in bits
     */
    calculateEntropy(charPool, length) {
        if (!charPool || charPool.length === 0 || length <= 0) return 0;
        return length * Math.log2(charPool.length);
    }
    
    /**
     * Evaluate password strength based on entropy and patterns
     * @param {string} password - The password to evaluate
     * @param {number} entropy - The calculated entropy
     * @returns {Object} Strength details including score and feedback
     */
    evaluatePasswordStrength(password, entropy) {
        let score = 0;
        let feedback = '';
        
        if (entropy < 40) {
            score = 0;
            feedback = 'Very weak - easily cracked';
        } else if (entropy < 60) {
            score = 25;
            feedback = 'Weak - vulnerable to brute force';
        } else if (entropy < 80) {
            score = 50;
            feedback = 'Medium - could be stronger';
        } else if (entropy < 100) {
            score = 75;
            feedback = 'Strong - good password';
        } else {
            score = 100;
            feedback = 'Very strong - excellent password';
        }
        
        if (this.containsCommonPatterns(password)) {
            score = Math.max(0, score - 20);
            feedback += ' (contains common patterns)';
        }
        
        if (password.length < 10) {
            score = Math.max(0, score - 10);
            feedback += ' (too short)';
        } else if (password.length > 20) {
            score = Math.min(100, score + 10);
        }
        
        return {
            score,
            feedback,
            entropy
        };
    }
    
    /**
     * Generate a password based on provided options using bounded attempts
     * @param {Object} options - Password generation options
     * @returns {Object} Generated password and strength details
     */
    generatePassword(options) {
        const defaultOptions = {
            length: 16,
            uppercase: true,
            lowercase: true,
            numbers: true,
            symbols: true,
            excludeSimilar: false,
            excludeChars: '',
            pronounceable: false
        };
        
        options = { ...defaultOptions, ...options };
        
        if (options.length < 8) options.length = 8;
        if (options.length > 128) options.length = 128;
        
        if (!options.uppercase && !options.lowercase && !options.numbers && !options.symbols && !options.pronounceable) {
            options.lowercase = true;
        }
        
        let password = '';
        let charPool = '';
        let attempts = 0;
        const maxAttempts = 50;
        
        do {
            password = '';
            if (options.pronounceable) {
                password = this.generatePronounceable(options.length, options);
                charPool = this.consonants + this.vowels;
            } else {
                charPool = this.calculateCharPool(options);
                if (charPool.length === 0) {
                    charPool = 'abcdefghijklmnopqrstuvwxyz';
                }
                
                for (let i = 0; i < options.length; i++) {
                    password += this.getRandomChar(charPool);
                }
                
                password = this.ensureCharacterRequirements(password, options);
            }
            attempts++;
        } while (this.containsCommonPatterns(password) && options.length > 10 && attempts < maxAttempts);
        
        const entropy = this.calculateEntropy(charPool, options.length);
        const strength = this.evaluatePasswordStrength(password, entropy);
        
        this.addToHistory(password, strength);
        
        return {
            password,
            strength
        };
    }
    
    /**
     * Generate multiple passwords
     * @param {Object} options - Password generation options
     * @param {number} count - Number of passwords to generate
     * @returns {Array} Array of generated passwords with strength details
     */
    generateMultiplePasswords(options, count) {
        const passwords = [];
        for (let i = 0; i < count; i++) {
            passwords.push(this.generatePassword(options));
        }
        return passwords;
    }
    
    /**
     * Add password to history
     * @param {string} password - Generated password
     * @param {Object} strength - Password strength details
     */
    addToHistory(password, strength) {
        this.passwordHistory.unshift({
            password,
            strength,
            timestamp: new Date().toISOString()
        });
        
        if (this.passwordHistory.length > 20) {
            this.passwordHistory.pop();
        }
    }
    
    /**
     * Clear password history
     */
    clearHistory() {
        this.passwordHistory = [];
    }
    
    /**
     * Save current options as a template
     * @param {string} name - Template name
     * @param {Object} options - Password generation options
     */
    saveTemplate(name, options) {
        this.templates.push({
            name,
            options,
            created: new Date().toISOString()
        });
        
        localStorage.setItem('passwordTemplates', JSON.stringify(this.templates));
        return this.templates;
    }
    
    /**
     * Delete a saved template
     * @param {number} index - Template index to delete
     */
    deleteTemplate(index) {
        if (index >= 0 && index < this.templates.length) {
            this.templates.splice(index, 1);
            localStorage.setItem('passwordTemplates', JSON.stringify(this.templates));
        }
        return this.templates;
    }
    
    /**
     * Get all saved templates
     * @returns {Array} Array of saved templates
     */
    getTemplates() {
        return this.templates;
    }
}

// Create global password generator instance
const passwordGenerator = new PasswordGenerator();