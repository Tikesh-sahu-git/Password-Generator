document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const passwordInput = document.getElementById('password');
    const copyBtn = document.getElementById('copy-btn');
    const generateBtn = document.getElementById('generate-btn');
    const lengthSlider = document.getElementById('length');
    const lengthValue = document.getElementById('length-value');
    const lowercaseCheckbox = document.getElementById('lowercase');
    const uppercaseCheckbox = document.getElementById('uppercase');
    const numbersCheckbox = document.getElementById('numbers');
    const symbolsCheckbox = document.getElementById('symbols');
    const strengthBar = document.getElementById('strength-bar');
    const strengthLabel = document.getElementById('strength-label');

    // Character sets
    const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
    const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numberChars = '0123456789';
    const symbolChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    // Update length value display
    lengthSlider.addEventListener('input', function() {
        lengthValue.textContent = this.value;
        // Update background size for the range slider
        const value = this.value;
        const min = this.min || 4;
        const max = this.max || 64;
        const percentage = ((value - min) / (max - min)) * 100;
        this.style.backgroundSize = percentage + '% 100%';
        
        // Animate the value display
        lengthValue.style.transform = 'scale(1.2)';
        setTimeout(() => {
            lengthValue.style.transform = 'scale(1)';
        }, 200);
    });

    // Initialize range slider background
    lengthSlider.dispatchEvent(new Event('input'));

    // Copy password to clipboard
    copyBtn.addEventListener('click', async function() {
        if (!passwordInput.value) return;
        
        try {
            await navigator.clipboard.writeText(passwordInput.value);
            
            // Visual feedback
            const originalText = copyBtn.innerHTML;
            copyBtn.innerHTML = `
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                Copied!
            `;
            copyBtn.classList.add('copied');
            
            setTimeout(function() {
                copyBtn.innerHTML = originalText;
                copyBtn.classList.remove('copied');
            }, 2000);
        } catch (err) {
            console.error('Failed to copy: ', err);
            // Fallback for older browsers
            passwordInput.select();
            document.execCommand('copy');
            
            // Visual feedback
            copyBtn.textContent = 'Copied!';
            copyBtn.classList.add('copied');
            
            setTimeout(function() {
                copyBtn.textContent = 'Copy';
                copyBtn.classList.remove('copied');
            }, 2000);
        }
    });

    // Generate password with animation
    generateBtn.addEventListener('click', function() {
        // Add loading animation to button
        generateBtn.disabled = true;
        generateBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="spin" style="margin-right: 8px; animation: spin 1s linear infinite;">
                <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
            </svg>
            Generating...
        `;
        
        // Simulate processing delay for better animation
        setTimeout(() => {
            const length = parseInt(lengthSlider.value);
            const includeLower = lowercaseCheckbox.checked;
            const includeUpper = uppercaseCheckbox.checked;
            const includeNumbers = numbersCheckbox.checked;
            const includeSymbols = symbolsCheckbox.checked;
            
            // Validate at least one character type is selected
            if (!includeLower && !includeUpper && !includeNumbers && !includeSymbols) {
                alert('Please select at least one character type');
                resetGenerateButton();
                return;
            }
            
            // Build character pool based on selected options
            let charPool = '';
            if (includeLower) charPool += lowercaseChars;
            if (includeUpper) charPool += uppercaseChars;
            if (includeNumbers) charPool += numberChars;
            if (includeSymbols) charPool += symbolChars;
            
            // Generate password using crypto API if available
            let password = '';
            if (window.crypto && window.crypto.getRandomValues) {
                const values = new Uint32Array(length);
                window.crypto.getRandomValues(values);
                
                for (let i = 0; i < length; i++) {
                    password += charPool[values[i] % charPool.length];
                }
            } else {
                // Fallback for browsers without crypto API
                for (let i = 0; i < length; i++) {
                    const randomIndex = Math.floor(Math.random() * charPool.length);
                    password += charPool[randomIndex];
                }
            }
            
            // Display password with animation
            passwordInput.value = '';
            passwordInput.classList.remove('password-animate');
            
            // Typewriter effect
            let i = 0;
            const typingEffect = setInterval(() => {
                if (i < password.length) {
                    passwordInput.value += password.charAt(i);
                    i++;
                } else {
                    clearInterval(typingEffect);
                    passwordInput.classList.add('password-animate');
                    resetGenerateButton();
                }
            }, 30);
            
            // Update strength meter
            updateStrengthMeter(password);
        }, 500);
    });

    function resetGenerateButton() {
        generateBtn.disabled = false;
        generateBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px;">
                <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                <path d="M3 3v5h5"></path>
                <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"></path>
                <path d="M16 16h5v5"></path>
            </svg>
            Generate Password
        `;
    }

    // Calculate password strength
    function updateStrengthMeter(password) {
        // Strength calculation based on length and character variety
        let strength = 0;
        
        // Length contributes up to 60 points (max at 20+ chars)
        strength += Math.min(password.length * 3, 60);
        
        // Character variety contributes up to 40 points
        let varietyScore = 0;
        if (/[a-z]/.test(password)) varietyScore += 10;
        if (/[A-Z]/.test(password)) varietyScore += 10;
        if (/[0-9]/.test(password)) varietyScore += 10;
        if (/[^a-zA-Z0-9]/.test(password)) varietyScore += 10;
        
        strength += varietyScore;
        
        // Animate the strength bar
        let currentWidth = parseInt(strengthBar.style.width) || 0;
        let increment = (strength - currentWidth) / 20;
        let steps = 0;
        
        const animateStrengthBar = setInterval(() => {
            if (steps >= 20) {
                clearInterval(animateStrengthBar);
            } else {
                currentWidth += increment;
                strengthBar.style.width = currentWidth + '%';
                steps++;
            }
        }, 15);
        
        // Update strength label with animation
        strengthLabel.style.opacity = '0';
        strengthLabel.style.transform = 'translateY(-5px)';
        
        setTimeout(() => {
            if (strength < 40) {
                strengthBar.style.backgroundColor = 'var(--danger-color)';
                strengthLabel.textContent = 'Weak';
                strengthLabel.style.color = 'var(--danger-color)';
            } else if (strength < 70) {
                strengthBar.style.backgroundColor = 'var(--warning-color)';
                strengthLabel.textContent = 'Medium';
                strengthLabel.style.color = 'var(--warning-color)';
            } else if (strength < 90) {
                strengthBar.style.backgroundColor = 'var(--info-color)';
                strengthLabel.textContent = 'Strong';
                strengthLabel.style.color = 'var(--info-color)';
            } else {
                strengthBar.style.backgroundColor = 'var(--success-color)';
                strengthLabel.textContent = 'Very Strong';
                strengthLabel.style.color = 'var(--success-color)';
            }
            
            strengthLabel.style.opacity = '1';
            strengthLabel.style.transform = 'translateY(0)';
        }, 300);
    }

    // Generate a password on page load with delay for animation
    setTimeout(() => {
        generateBtn.click();
    }, 500);
});