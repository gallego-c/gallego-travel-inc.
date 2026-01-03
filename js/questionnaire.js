// ==========================================
// Gallego Travel Inc. - Questionnaire Logic
// ==========================================

// State Management
let currentStep = 1;
const totalSteps = 11;

const formData = {
    identity: '',
    name: '',
    email: '',
    travelTime: '',
    availableDates: [],
    departure: 'Barcelona', // Always Barcelona
    foreignCity: '',
    continent: 'Europe', // Always Europe
    selectedCities: ['paris', 'rome', 'amsterdam', 'london', 'prague', 'vienna', 'lisbon', 'berlin', 'athens', 'dublin'],
    travelers: '',
    adventureType: 'Surprise'
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    updateProgress();
    // Pre-select adventure type
    const adventureBtn = document.querySelector('.adventure-btn');
    if (adventureBtn) {
        adventureBtn.classList.add('selected');
    }
});

// ==========================================
// Navigation Functions
// ==========================================

function nextStep() {
    const currentSlide = document.querySelector(`.question-slide[data-step="${currentStep}"]`);
    
    // Handle conditional flow
    if (currentStep === 5 && formData.departure === 'Barcelona') {
        // Skip foreign city input if departing from Barcelona
        currentStep = 7;
    } else {
        currentStep++;
    }
    
    showStep(currentStep);
}

function prevStep() {
    const prevStepNum = currentStep - 1;
    
    // Handle conditional flow going backwards
    if (currentStep === 7 && formData.departure === 'Barcelona') {
        // Skip foreign city input
        currentStep = 5;
    } else {
        currentStep--;
    }
    
    showStep(currentStep);
}

function showStep(step) {
    // Hide all slides
    document.querySelectorAll('.question-slide').forEach(slide => {
        slide.classList.remove('active');
    });
    
    // Show current slide
    const currentSlide = document.querySelector(`.question-slide[data-step="${step}"]`);
    if (currentSlide) {
        currentSlide.classList.add('active');
    }
    
    updateProgress();
}

function updateProgress() {
    const progress = document.getElementById('progress');
    const percentage = ((currentStep - 1) / (totalSteps - 1)) * 100;
    progress.style.width = `${percentage}%`;
}

// ==========================================
// Step 1: Identity Selection
// ==========================================

function selectIdentity(value) {
    formData.identity = value;
    
    // Update button states
    document.querySelectorAll('.question-slide[data-step="1"] .option-btn').forEach(btn => {
        btn.classList.remove('selected');
        if (btn.dataset.value === value) {
            btn.classList.add('selected');
        }
    });
    
    // Configure step 2 based on selection
    const nameGroup = document.getElementById('name-group');
    const userInfoTitle = document.getElementById('user-info-title');
    
    if (value === 'gerard') {
        nameGroup.style.display = 'none';
        userInfoTitle.setAttribute('data-i18n', 'step2TitleGerard');
        userInfoTitle.textContent = translations[currentLang].step2TitleGerard;
        formData.name = 'Gerard';
    } else {
        nameGroup.style.display = 'block';
        userInfoTitle.setAttribute('data-i18n', 'step2TitleRandom');
        userInfoTitle.textContent = translations[currentLang].step2TitleRandom;
        formData.name = '';
    }
    
    // Enable next button
    document.getElementById('next-1').disabled = false;
}

// ==========================================
// Step 2: User Info Validation
// ==========================================

function validateUserInfo() {
    const email = document.getElementById('user-email').value.trim();
    const name = document.getElementById('user-name').value.trim();
    const nameGroup = document.getElementById('name-group');
    
    formData.email = email;
    
    let isValid = false;
    
    if (formData.identity === 'gerard') {
        // Only email required for Gerard
        isValid = isValidEmail(email);
    } else {
        // Name and email required for random person
        formData.name = name;
        isValid = name.length > 0 && isValidEmail(email);
    }
    
    document.getElementById('next-2').disabled = !isValid;
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// ==========================================
// Step 3: Travel Time Selection
// ==========================================

function selectTravelTime(value) {
    formData.travelTime = value === 'this-month' ? 'This month' : 'Later in the year';
    
    document.querySelectorAll('.question-slide[data-step="3"] .option-btn').forEach(btn => {
        btn.classList.remove('selected');
        if (btn.dataset.value === value) {
            btn.classList.add('selected');
        }
    });
    
    document.getElementById('next-3').disabled = false;
}

// ==========================================
// Step 4: Available Date Ranges
// ==========================================

function addDateInput() {
    const container = document.getElementById('dates-container');
    const wrapper = document.createElement('div');
    wrapper.className = 'date-range-wrapper';
    wrapper.innerHTML = `
        <label data-i18n="step4StartDate">${translations[currentLang].step4StartDate}</label>
        <input type="date" class="date-input date-start" oninput="validateDates()">
        <label data-i18n="step4EndDate">${translations[currentLang].step4EndDate}</label>
        <input type="date" class="date-input date-end" oninput="validateDates()">
    `;
    container.appendChild(wrapper);
}

function validateDates() {
    const dateRanges = document.querySelectorAll('.date-range-wrapper');
    const filledRanges = [];
    let hasError = false;
    
    // Get current month info if "this-month" is selected
    const isThisMonth = formData.travelTime === 'This month';
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).toISOString().split('T')[0];
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0).toISOString().split('T')[0];
    
    dateRanges.forEach(wrapper => {
        const startInput = wrapper.querySelector('.date-start');
        const endInput = wrapper.querySelector('.date-end');
        
        // Set min/max attributes if "this month" is selected
        if (isThisMonth) {
            startInput.setAttribute('min', firstDayOfMonth);
            startInput.setAttribute('max', lastDayOfMonth);
            endInput.setAttribute('min', firstDayOfMonth);
            endInput.setAttribute('max', lastDayOfMonth);
        } else {
            startInput.removeAttribute('min');
            startInput.removeAttribute('max');
            endInput.removeAttribute('min');
            endInput.removeAttribute('max');
        }
        
        // Reset error styling
        startInput.style.borderColor = '';
        endInput.style.borderColor = '';
        
        if (startInput.value && endInput.value) {
            const startDate = new Date(startInput.value);
            const endDate = new Date(endInput.value);
            
            // Validate end date is not before start date
            if (endDate < startDate) {
                endInput.style.borderColor = '#dc2626';
                endInput.style.boxShadow = '0 0 0 3px rgba(220, 38, 38, 0.1)';
                hasError = true;
            } else {
                filledRanges.push({
                    start: startInput.value,
                    end: endInput.value
                });
            }
        }
    });
    
    formData.availableDates = filledRanges;
    
    const dateCountNum = document.getElementById('date-count-num');
    dateCountNum.textContent = `${filledRanges.length} / 3`;
    
    const dateCount = document.getElementById('date-count');
    if (filledRanges.length >= 3 && !hasError) {
        dateCount.style.color = '#4CAF50';
    } else {
        dateCount.style.color = '#888888';
    }
    
    document.getElementById('next-4').disabled = filledRanges.length < 3 || hasError;
}

// ==========================================
// Step 5: Departure Selection
// ==========================================

function selectDeparture(value) {
    document.querySelectorAll('.question-slide[data-step="5"] .option-btn').forEach(btn => {
        btn.classList.remove('selected');
        if (btn.dataset.value === value) {
            btn.classList.add('selected');
        }
    });
    
    if (value === 'barcelona') {
        formData.departure = 'Barcelona';
    } else {
        formData.departure = 'Foreign (Barcelona anyway)';
    }
    
    document.getElementById('next-5').disabled = false;
}

// ==========================================
// Step 6: Foreign City Input
// ==========================================

function validateForeignCity() {
    const cityInput = document.getElementById('foreign-city');
    const barcelonaMessage = document.getElementById('barcelona-message');
    
    formData.foreignCity = cityInput.value.trim();
    
    if (formData.foreignCity.length > 0) {
        barcelonaMessage.style.display = 'block';
        document.getElementById('next-6').disabled = false;
    } else {
        barcelonaMessage.style.display = 'none';
        document.getElementById('next-6').disabled = true;
    }
}

// ==========================================
// Step 7: Continent Selection
// ==========================================

function selectContinent(value) {
    formData.continent = 'Europe';
    
    document.querySelectorAll('.question-slide[data-step="7"] .option-btn:not(.disabled-option)').forEach(btn => {
        btn.classList.remove('selected');
        if (btn.dataset.value === value) {
            btn.classList.add('selected');
        }
    });
    
    document.getElementById('next-7').disabled = false;
}

// ==========================================
// Step 8: City Selection
// ==========================================

function toggleCity(card) {
    const city = card.dataset.city;
    const status = card.querySelector('.city-status');
    
    if (card.classList.contains('selected')) {
        card.classList.remove('selected');
        formData.selectedCities = formData.selectedCities.filter(c => c !== city);
        status.textContent = '✗';
    } else {
        card.classList.add('selected');
        formData.selectedCities.push(city);
        status.textContent = '✓';
    }
}

// ==========================================
// Step 9: Travelers Selection
// ==========================================

function selectTravelers(value) {
    formData.travelers = value;
    
    document.querySelectorAll('.question-slide[data-step="9"] .option-btn').forEach(btn => {
        btn.classList.remove('selected');
        if (btn.dataset.value === value) {
            btn.classList.add('selected');
        }
    });
    
    const warning = document.getElementById('travelers-warning');
    if (value === '2+') {
        warning.style.display = 'block';
    } else {
        warning.style.display = 'none';
    }
    
    document.getElementById('next-9').disabled = false;
}

// ==========================================
// Step 10: Adventure Type
// ==========================================

function selectAdventure(value) {
    formData.adventureType = 'Surprise';
    // Already pre-selected, just ensure it stays selected
    document.querySelector('.adventure-btn').classList.add('selected');
}

// ==========================================
// Finish & Save to Server
// ==========================================

function finishQuestionnaire() {
    // Save data to server
    saveToServer();
}

async function saveToServer() {
    try {
        // Show loading state (optional)
        const finishBtn = document.getElementById('next-10');
        const originalText = finishBtn.textContent;
        finishBtn.textContent = 'Saving...';
        finishBtn.disabled = true;
        
        // Send data to server
        const response = await fetch('/api/save-response', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            console.log('✅ Response saved successfully!');
            console.log('Form Data:', formData);
            
            // Show final message
            currentStep = 11;
            showStep(11);
        } else {
            console.error('❌ Failed to save response:', result.message);
            alert('Failed to save your response. Please try again.');
            finishBtn.textContent = originalText;
            finishBtn.disabled = false;
        }
        
    } catch (error) {
        console.error('❌ Error connecting to server:', error);
        alert('Error: Could not connect to server. Make sure the server is running (npm start).');
        
        // Re-enable button
        const finishBtn = document.getElementById('next-10');
        finishBtn.textContent = translations[currentLang].btnFinish;
        finishBtn.disabled = false;
    }
}
