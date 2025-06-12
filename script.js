// Game State
let gameState = {
    companyName: '',
    day: 1,
    dayOfWeek: 0,
    week: 1,
    balance: 60,
    location: '',
    gameMode: 'scored',
    weather: 'sunny',
    inventory: {
        lemons: 0,
        sugar: 0,
        cups: 0,
        lemonExpiry: []
    },
    prices: {
        lemons: 0.50,
        sugar: 1.00,
        cups: 0.10
    },
    dailyStats: [],
    totalCustomersServed: 0,
    totalCustomersMissed: 0
};

// Weather types
const weatherTypes = {
    sunny: { icon: 'fa-sun', name: 'Sunny', desc: 'Perfect lemonade weather!', demandMultiplier: 1.5 },
    cloudy: { icon: 'fa-cloud', name: 'Cloudy', desc: 'Mild weather today', demandMultiplier: 1.0 },
    rainy: { icon: 'fa-cloud-rain', name: 'Rainy', desc: 'Not great for outdoor sales', demandMultiplier: 0.5 },
    heatwave: { icon: 'fa-temperature-high', name: 'Heatwave', desc: 'Everyone wants a cold drink!', demandMultiplier: 2.0 },
    snowstorm: { icon: 'fa-snowflake', name: 'Snowstorm', desc: 'Bundle up! Sales will be tough', demandMultiplier: 0.2 }
};

// Days of week
const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// News headlines
const newsHeadlines = [
    "Breaking: Lemonade declared perfect companion for ice cream!",
    "Scientists discover drinking lemonade increases smile frequency by 200%",
    "Local dog learns to fetch lemons for owner's lemonade stand",
    "Grandma's secret lemonade recipe found in attic - contains extra love",
    "Study shows people who drink lemonade are 40% more likely to whistle",
    "Famous chef declares lemonade the 'drink of summer champions'",
    "Kids petition to make lemonade the official state beverage",
    "Lemonade stands linked to increased neighborhood happiness",
    "World's sourest lemon discovered - perfect for extreme lemonade fans",
    "Dance craze 'The Lemon Squeeze' sweeps the nation",
    "Celebrities spotted drinking lemonade - trend alert!",
    "New yoga pose inspired by lemon squeezing gains popularity"
];

// Random events
const randomEvents = [
    { text: "Sugar shortage! Prices increased by 50% today only", effect: 'sugar_increase', chance: 0.1 },
    { text: "Local lemon farm has surplus! Lemon prices reduced by 30%", effect: 'lemon_decrease', chance: 0.1 },
    { text: "Health craze sweeps the city! Demand for fresh lemonade increases", effect: 'demand_increase', chance: 0.15 },
    { text: "Major traffic jam nearby brings extra foot traffic", effect: 'traffic_boost', chance: 0.1 },
    { text: "Competitor opens nearby! Expect reduced customers today", effect: 'competition', chance: 0.1 }
];

// Initialize
document.getElementById('starting-budget').addEventListener('input', function(e) {
    document.getElementById('budget-value').textContent = e.target.value;
});

// Validate company name input
document.getElementById('company-name').addEventListener('input', function(e) {
    // Remove any special characters that could break the game
    e.target.value = e.target.value.replace(/[<>\"\']/g, '');
    validateStartForm();
});

// Validate number inputs
function validateNumberInput(inputId, min, max) {
    const input = document.getElementById(inputId);
    input.addEventListener('input', function(e) {
        let value = parseInt(e.target.value);
        
        if (isNaN(value) || value < min) {
            e.target.value = min;
        } else if (value > max) {
            e.target.value = max;
        }
        
        if (inputId.includes('buy-')) {
            updatePriceCalculation();
        }
    });
    
    // Prevent negative numbers with keyboard
    input.addEventListener('keydown', function(e) {
        if (e.key === '-' || e.key === 'e' || e.key === 'E') {
            e.preventDefault();
        }
    });
}

// Apply validation to all number inputs
validateNumberInput('cups-to-make', 0, 1000);
validateNumberInput('buy-lemons', 0, 999);
validateNumberInput('buy-sugar', 0, 999);
validateNumberInput('buy-cups', 0, 999);

document.getElementById('cup-price-input').addEventListener('input', function(e) {
    let price = parseFloat(e.target.value);
    
    // Enforce bounds
    if (isNaN(price) || price < 0) {
        e.target.value = '0.00';
        price = 0;
    } else if (price > 10) {
        e.target.value = '10.00';
        price = 10;
    }
    
    // Visual warnings
    if (price > 5) {
        e.target.classList.add('danger');
    } else if (price > 3) {
        e.target.classList.add('warning');
    } else {
        e.target.classList.remove('warning', 'danger');
    }
});

// Validate start form
function validateStartForm() {
    const name = document.getElementById('company-name').value.trim();
    const location = document.querySelector('input[name="location"]:checked');
    const startBtn = document.getElementById('start-btn');
    
    if (name && location) {
        startBtn.disabled = false;
    } else {
        startBtn.disabled = true;
    }
}

document.getElementById('company-name').addEventListener('input', validateStartForm);
document.querySelectorAll('input[name="location"]').forEach(radio => {
    radio.addEventListener('change', validateStartForm);
});

// Start game
function startGame() {
    const companyName = document.getElementById('company-name').value.trim();
    
    // Final validation
    if (!companyName || companyName.length > 50) {
        alert('Please enter a valid company name (1-50 characters)');
        return;
    }
    
    const locationChecked = document.querySelector('input[name="location"]:checked');
    if (!locationChecked) {
        alert('Please select a location');
        return;
    }
    
    gameState.companyName = companyName;
    gameState.balance = parseInt(document.getElementById('starting-budget').value);
    gameState.location = locationChecked.value;
    gameState.gameMode = document.querySelector('input[name="game-mode"]:checked').value;
    
    // Validate balance one more time
    if (gameState.balance < 20 || gameState.balance > 100) {
        gameState.balance = 60;
    }
    
    document.getElementById('hud').style.display = 'block';
    updateHUD();
    showScreen('morning-screen');
    showMorningBriefing();
}

// Show screen
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

// Update HUD
function updateHUD() {
    document.getElementById('company-name-display').textContent = gameState.companyName;
    document.getElementById('day-display').textContent = `${daysOfWeek[gameState.dayOfWeek]} (Day ${gameState.day})`;
    document.getElementById('week-display').textContent = gameState.week;
    document.getElementById('balance-display').textContent = Math.max(0, gameState.balance).toFixed(2);
    document.getElementById('lemons-display').textContent = Math.max(0, gameState.inventory.lemons);
    document.getElementById('sugar-display').textContent = Math.max(0, gameState.inventory.sugar);
    document.getElementById('cups-display').textContent = Math.max(0, gameState.inventory.cups);
    
    // Display location
    const locationNames = {
        'mall': 'Mall',
        'park': 'Park', 
        'truck': 'Food Truck'
    };
    document.getElementById('location-display').textContent = locationNames[gameState.location] || '';
    
    const weather = weatherTypes[gameState.weather];
    document.getElementById('weather-icon-hud').className = `fas ${weather.icon}`;
    document.getElementById('weather-display-hud').textContent = weather.name;
    
    // Update lemon dropdown on hover
    updateLemonDetails();
}

// Morning briefing
function showMorningBriefing() {
    // Expire old lemons and clean up expired batches
    const today = gameState.day;
    let expiredLemons = 0;
    
    gameState.inventory.lemonExpiry = gameState.inventory.lemonExpiry.filter(batch => {
        if (batch.expiryDay <= today) {
            expiredLemons += batch.amount;
            return false;
        }
        return batch.amount > 0; // Also remove batches with 0 lemons
    });
    
    gameState.inventory.lemons -= expiredLemons;
    gameState.inventory.lemons = Math.max(0, gameState.inventory.lemons);
    
    // Random weather with proper weights
    const weatherRoll = Math.random();
    if (weatherRoll < 0.45) {
        gameState.weather = 'sunny';
    } else if (weatherRoll < 0.75) {
        gameState.weather = 'cloudy';
    } else if (weatherRoll < 0.92) {
        gameState.weather = 'rainy';
    } else if (weatherRoll < 0.97) {
        gameState.weather = 'heatwave';
    } else {
        gameState.weather = 'snowstorm';
    }
    
    // Random prices - adjusted for better game balance
    gameState.prices.lemons = parseFloat((0.20 + Math.random() * 0.30).toFixed(2)); // $0.20-0.50
    gameState.prices.sugar = parseFloat((0.50 + Math.random() * 0.50).toFixed(2)); // $0.50-1.00
    gameState.prices.cups = parseFloat((0.05 + Math.random() * 0.05).toFixed(2));  // $0.05-0.10
    
    // Check for random event
    let currentEvent = null;
    for (const event of randomEvents) {
        if (Math.random() < event.chance) {
            currentEvent = event;
            break;
        }
    }
    
    // Store today's event for journal
    gameState.todayEvent = currentEvent;
    
    // Apply event effects
    if (currentEvent) {
        switch (currentEvent.effect) {
            case 'sugar_increase':
                gameState.prices.sugar = parseFloat((gameState.prices.sugar * 1.5).toFixed(2));
                break;
            case 'lemon_decrease':
                // This should result in lower prices, but $0.32 seems reasonable
                // Original price was likely around $0.46, reduced by 30% = $0.32
                gameState.prices.lemons = parseFloat((gameState.prices.lemons * 0.7).toFixed(2));
                break;
        }
        
        document.getElementById('event-display').style.display = 'block';
        document.getElementById('event-text').textContent = currentEvent.text;
    } else {
        document.getElementById('event-display').style.display = 'none';
    }
    
    // Update display
    const weather = weatherTypes[gameState.weather];
    document.getElementById('weather-icon').className = `fas ${weather.icon} weather-icon`;
    document.getElementById('weather-text').textContent = weather.name;
    document.getElementById('weather-desc').textContent = weather.desc;
    
    document.getElementById('news-ticker-text').textContent = newsHeadlines[Math.floor(Math.random() * newsHeadlines.length)];
    
    document.getElementById('lemon-price').textContent = gameState.prices.lemons.toFixed(2);
    document.getElementById('sugar-price').textContent = gameState.prices.sugar.toFixed(2);
    document.getElementById('cup-price').textContent = gameState.prices.cups.toFixed(2);
    
    updateHUD();
}

// Show business screen
function showBusinessScreen() {
    // Check if player can afford rent first
    let rentCost = 0;
    switch (gameState.location) {
        case 'mall': rentCost = 10; break;
        case 'park': rentCost = 3; break;
        case 'truck': rentCost = 5; break;
    }
    
    if (gameState.balance < rentCost) {
        alert(`You don't have enough money to pay today's rent ($${rentCost})!`);
        
        // In unlimited mode, offer loan
        if (gameState.gameMode === 'unlimited' && !gameState.hasLoan) {
            if (confirm('Would you like to take a $50 loan to continue?')) {
                gameState.balance += 50;
                gameState.hasLoan = true;
                updateHUD();
            } else {
                alert('Game Over! You cannot afford to operate today.');
                showFinalScore();
                return;
            }
        } else {
            alert('Game Over! You cannot afford to operate today.');
            showFinalScore();
            return;
        }
    }
    
    showScreen('business-screen');
    
    // Show truck location selector if food truck
    document.getElementById('truck-location').style.display = 
        gameState.location === 'truck' ? 'block' : 'none';
    
    // Update current inventory
    document.getElementById('current-lemons').textContent = gameState.inventory.lemons;
    document.getElementById('current-sugar').textContent = gameState.inventory.sugar;
    document.getElementById('current-cups').textContent = gameState.inventory.cups;
    
    // Update unit prices
    document.getElementById('lemon-unit-price').textContent = gameState.prices.lemons;
    document.getElementById('sugar-unit-price').textContent = gameState.prices.sugar;
    document.getElementById('cup-unit-price').textContent = gameState.prices.cups;
    
    // Reset inputs
    document.getElementById('buy-lemons').value = 0;
    document.getElementById('buy-sugar').value = 0;
    document.getElementById('buy-cups').value = 0;
    
    updatePriceCalculation();
}

// Update price calculations
function updatePriceCalculation() {
    const buyLemons = parseInt(document.getElementById('buy-lemons').value) || 0;
    const buySugar = parseInt(document.getElementById('buy-sugar').value) || 0;
    const buyCups = parseInt(document.getElementById('buy-cups').value) || 0;
    
    const lemonTotal = (buyLemons * parseFloat(gameState.prices.lemons)).toFixed(2);
    const sugarTotal = (buySugar * parseFloat(gameState.prices.sugar)).toFixed(2);
    const cupTotal = (buyCups * parseFloat(gameState.prices.cups)).toFixed(2);
    
    document.getElementById('lemon-total').textContent = lemonTotal;
    document.getElementById('sugar-total').textContent = sugarTotal;
    document.getElementById('cup-total').textContent = cupTotal;
}

// Auto calculate ingredients
function autoCalculate() {
    const cupsToMake = parseInt(document.getElementById('cups-to-make').value) || 0;
    
    // Validate cups to make
    if (cupsToMake < 0 || cupsToMake > 1000) {
        alert('Please enter a valid number of cups to make (0-1000)');
        return;
    }
    
    const neededLemons = cupsToMake;
    const neededSugar = Math.ceil(cupsToMake * 0.5);
    const neededCups = cupsToMake;
    
    const buyLemons = Math.max(0, neededLemons - gameState.inventory.lemons);
    const buySugar = Math.max(0, neededSugar - gameState.inventory.sugar);
    const buyCups = Math.max(0, neededCups - gameState.inventory.cups);
    
    // Calculate total cost
    const totalCost = (buyLemons * parseFloat(gameState.prices.lemons)) +
                     (buySugar * parseFloat(gameState.prices.sugar)) +
                     (buyCups * parseFloat(gameState.prices.cups));
    
    // Check if player can afford it
    const marketing = document.querySelector('input[name="marketing"]:checked').value;
    let marketingCost = 0;
    switch (marketing) {
        case 'flyers': marketingCost = 5; break;
        case 'radio': marketingCost = 15; break;
        case 'push': marketingCost = 10; break;
        case 'agency': marketingCost = 30; break;
    }
    
    let rentCost = 0;
    switch (gameState.location) {
        case 'mall': rentCost = 10; break;
        case 'park': rentCost = 3; break;
        case 'truck': rentCost = 5; break;
    }
    
    const totalWithExtras = totalCost + marketingCost + rentCost;
    
    if (totalWithExtras > gameState.balance) {
        alert(`Auto-calculate would cost $${totalCost.toFixed(2)} for ingredients, but with rent and marketing you need $${totalWithExtras.toFixed(2)}. You only have $${gameState.balance.toFixed(2)}.`);
        return;
    }
    
    document.getElementById('buy-lemons').value = buyLemons;
    document.getElementById('buy-sugar').value = buySugar;
    document.getElementById('buy-cups').value = buyCups;
    
    updatePriceCalculation();
}

// Proceed to receipt
function proceedToReceipt() {
    const buyLemons = parseInt(document.getElementById('buy-lemons').value) || 0;
    const buySugar = parseInt(document.getElementById('buy-sugar').value) || 0;
    const buyCups = parseInt(document.getElementById('buy-cups').value) || 0;
    const cupsToMake = parseInt(document.getElementById('cups-to-make').value) || 0;
    const cupPrice = parseFloat(document.getElementById('cup-price-input').value) || 0;
    
    // Validate cup price
    if (cupPrice < 0 || cupPrice > 10) {
        alert('Cup price must be between $0.00 and $10.00');
        return;
    }
    
    // Marketing cost
    const marketing = document.querySelector('input[name="marketing"]:checked').value;
    let marketingCost = 0;
    let marketingCups = 0;
    switch (marketing) {
        case 'social': marketingCups = 2; break;  // Costs 2 cups for influencer samples
        case 'flyers': marketingCost = 5; break;
        case 'radio': marketingCost = 15; break;
        case 'push': marketingCost = 10; break;
        case 'agency': marketingCost = 30; break;
    }
    
    // Location rent
    let rentCost = 0;
    switch (gameState.location) {
        case 'mall': rentCost = 10; break;
        case 'park': rentCost = 3; break;
        case 'truck': rentCost = 5; break;
    }
    
    // Check rent + marketing first (these are required)
    const requiredCost = rentCost + marketingCost;
    if (requiredCost > gameState.balance) {
        if (marketingCost > 0) {
            alert(`You need at least $${requiredCost.toFixed(2)} for rent ($${rentCost}) and marketing ($${marketingCost}), but only have $${gameState.balance.toFixed(2)}. Try a cheaper marketing option or none.`);
        } else {
            alert(`You need at least $${rentCost} for rent but only have $${gameState.balance.toFixed(2)}!`);
        }
        return;
    }
    
    // Now check if trying to make cups without any way to make them
    if (cupsToMake > 0 || marketingCups > 0) {
        const totalLemons = gameState.inventory.lemons + buyLemons;
        const totalSugar = gameState.inventory.sugar + buySugar;
        const totalCups = gameState.inventory.cups + buyCups;
        
        if (totalLemons === 0 || totalSugar === 0 || totalCups === 0) {
            alert('You need at least some of each ingredient (lemons, sugar, and cups) to make lemonade!');
            return;
        }
        
        const maxPossibleCups = Math.min(
            totalLemons,
            Math.floor(totalSugar * 2),
            totalCups
        );
        
        const totalCupsNeeded = cupsToMake + marketingCups;
        
        if (totalCupsNeeded > maxPossibleCups) {
            if (marketingCups > 0) {
                alert(`You don't have enough ingredients! You need ${totalCupsNeeded} cups total (${cupsToMake} to sell + ${marketingCups} for social media). Maximum possible: ${maxPossibleCups} cups`);
            } else {
                alert(`You don't have enough ingredients to make ${cupsToMake} cups! Maximum possible: ${maxPossibleCups} cups`);
            }
            return;
        }
    }
    
    const lemonCost = buyLemons * parseFloat(gameState.prices.lemons);
    const sugarCost = buySugar * parseFloat(gameState.prices.sugar);
    const cupCost = buyCups * parseFloat(gameState.prices.cups);
    
    const totalCost = lemonCost + sugarCost + cupCost + marketingCost + rentCost;
    
    if (totalCost > gameState.balance) {
        alert(`Not enough money! You need $${totalCost.toFixed(2)} but only have $${gameState.balance.toFixed(2)}`);
        return;
    }
    
    // Build receipt
    let receiptHTML = '<h3>Purchase Summary</h3>';
    
    if (buyLemons > 0 || buySugar > 0 || buyCups > 0) {
        receiptHTML += '<div class="inventory-grid">';
        
        if (buyLemons > 0) {
            // Weighted random for expiry - 2 days most common
            const expiryRoll = Math.random();
            let expiryDays;
            if (expiryRoll < 0.6) {
                expiryDays = 2;  // 60% chance
            } else if (expiryRoll < 0.85) {
                expiryDays = 3;  // 25% chance
            } else {
                expiryDays = 1;  // 15% chance
            }
            
            receiptHTML += `
                <div class="inventory-item">
                    <i class="fas fa-lemon"></i>
                    <div>${buyLemons} Lemons</div>
                    <div>$${lemonCost.toFixed(2)}</div>
                    <div style="color: var(--warning); font-size: 12px;">Expires in ${expiryDays} day${expiryDays > 1 ? 's' : ''}</div>
                </div>
            `;
            
            // Store expiry info
            gameState.inventory.lemonExpiry.push({
                amount: buyLemons,
                expiryDay: gameState.day + expiryDays
            });
        }
        
        if (buySugar > 0) {
            receiptHTML += `
                <div class="inventory-item">
                    <i class="fas fa-cube"></i>
                    <div>${buySugar} Sugar Bags</div>
                    <div>$${sugarCost.toFixed(2)}</div>
                </div>
            `;
        }
        
        if (buyCups > 0) {
            receiptHTML += `
                <div class="inventory-item">
                    <i class="fas fa-glass-water"></i>
                    <div>${buyCups} Cups</div>
                    <div>$${cupCost.toFixed(2)}</div>
                </div>
            `;
        }
        
        receiptHTML += '</div>';
    }
    
    receiptHTML += '<div class="stats-grid" style="margin-top: 20px;">';
    
    if (marketingCost > 0 || marketing === 'social') {
        const marketingLabel = marketing === 'social' ? 'Social Media' : 'Marketing';
        const marketingValue = marketing === 'social' ? '2 cups' : `$${marketingCost.toFixed(2)}`;
        receiptHTML += `
            <div class="stat-card">
                <div class="stat-label">${marketingLabel}</div>
                <div class="stat-value">${marketingValue}</div>
                ${marketing === 'social' ? '<div style="font-size: 12px; color: #666;">for influencers</div>' : ''}
            </div>
        `;
    }
    
    receiptHTML += `
        <div class="stat-card">
            <div class="stat-label">Daily Rent</div>
            <div class="stat-value">$${rentCost.toFixed(2)}</div>
        </div>
        <div class="stat-card">
            <div class="stat-label">Total Cost</div>
            <div class="stat-value">$${totalCost.toFixed(2)}</div>
        </div>
    `;
    
    receiptHTML += '</div>';
    
    document.getElementById('receipt-content').innerHTML = receiptHTML;
    
    // Apply purchases
    gameState.inventory.lemons += buyLemons;
    gameState.inventory.sugar += buySugar;
    gameState.inventory.cups += buyCups;
    gameState.balance -= totalCost;
    
    // Store today's settings
    gameState.todaySettings = {
        cupPrice: parseFloat(document.getElementById('cup-price-input').value),
        cupsToMake: parseInt(document.getElementById('cups-to-make').value) || 0,
        marketing: marketing,
        marketingCups: marketing === 'social' ? 2 : 0,
        subLocation: gameState.location === 'truck' ? document.getElementById('sub-location').value : null
    };
    
    // Validate settings one more time
    if (gameState.todaySettings.cupPrice < 0 || gameState.todaySettings.cupPrice > 10) {
        gameState.todaySettings.cupPrice = 1.00;
    }
    if (gameState.todaySettings.cupsToMake < 0 || gameState.todaySettings.cupsToMake > 1000) {
        gameState.todaySettings.cupsToMake = 0;
    }
    
    // Store today's expenses for profit calculation
    gameState.todayExpenses = totalCost;
    
    updateHUD();
    showScreen('receipt-screen');
}

// Start selling
function startSelling() {
    const settings = gameState.todaySettings;
    const weather = weatherTypes[gameState.weather];
    
    // Final validation before selling
    if (!settings || settings.cupsToMake === 0) {
        alert('You didn\'t prepare any cups to sell!');
        return;
    }
    
    // Verify we still have enough ingredients (in case of data corruption)
    const maxPossibleCups = Math.min(
        gameState.inventory.lemons,
        Math.floor(gameState.inventory.sugar * 2),
        gameState.inventory.cups
    );
    
    if (maxPossibleCups < settings.cupsToMake) {
        // Adjust to what we can actually make
        settings.cupsToMake = maxPossibleCups;
        if (settings.cupsToMake === 0) {
            alert('You don\'t have enough ingredients to make any lemonade!');
            return;
        }
    }
    
    // Calculate base demand - adjusted for reasonable customer numbers
    let baseDemand = 25;
    
    // Location modifiers
    switch (gameState.location) {
        case 'mall':
            baseDemand = 45;  // Increased from 40
            break;
        case 'park':
            baseDemand = 30;
            break;
        case 'truck':
            switch (settings.subLocation) {
                case 'school': baseDemand = 35; break;
                case 'park': baseDemand = 25; break;
                case 'stadium': baseDemand = 50; break;  // Increased from 45
                case 'office': baseDemand = 30; break;
            }
            break;
    }
    
    // Weekend boost
    if (gameState.dayOfWeek >= 5) {
        baseDemand *= 1.3;  // Increased from 1.25
    }
    
    // Apply event modifiers BEFORE weather
    if (gameState.todayEvent) {
        switch (gameState.todayEvent.effect) {
            case 'demand_increase':
            case 'traffic_boost':
                baseDemand *= 1.3;  // 30% boost for these events
                break;
            case 'competition':
                baseDemand *= 0.8;  // 20% reduction
                break;
        }
    }
    
    // Weather modifier
    baseDemand *= weather.demandMultiplier;
    
    // Price modifier - more realistic curve
    let priceModifier = 1;
    if (settings.cupPrice <= 0.50) {
        priceModifier = 1.8;
    } else if (settings.cupPrice <= 1.00) {
        priceModifier = 1.5;
    } else if (settings.cupPrice <= 1.50) {
        priceModifier = 1.2;
    } else if (settings.cupPrice <= 2.00) {
        priceModifier = 1.0;
    } else if (settings.cupPrice <= 2.50) {
        priceModifier = 0.8;
    } else if (settings.cupPrice <= 3.00) {
        priceModifier = 0.6;
    } else if (settings.cupPrice <= 4.00) {
        priceModifier = 0.3;
    } else {
        priceModifier = 0.1;
    }
    baseDemand *= priceModifier;
    
    // Marketing modifier - adjusted for balance with new social media cost
    let marketingBoost = 1;
    switch (settings.marketing) {
        case 'social': marketingBoost = 1.20; break;  // Increased from 1.15 due to cup cost
        case 'flyers': 
            marketingBoost = (weather.name === 'Sunny' || gameState.dayOfWeek >= 5) ? 1.4 : 1.25;
            break;
        case 'radio':
            marketingBoost = gameState.location === 'mall' ? 1.6 : 1.35;
            break;
        case 'push': marketingBoost = 1.4; break;
        case 'agency': marketingBoost = 1.55; break;
    }
    baseDemand *= marketingBoost;
    
    // Random variation (±20%)
    baseDemand *= (0.8 + Math.random() * 0.4);
    
    const totalCustomers = Math.floor(baseDemand);
    
    // Calculate actual sales
    const maxCups = Math.min(
        settings.cupsToMake,
        gameState.inventory.lemons - settings.marketingCups,
        Math.floor(gameState.inventory.sugar * 2) - Math.ceil(settings.marketingCups * 0.5),
        gameState.inventory.cups - settings.marketingCups
    );
    
    // Ensure we have enough for marketing samples first
    if (settings.marketingCups > 0) {
        const totalAvailableCups = Math.min(
            gameState.inventory.lemons,
            Math.floor(gameState.inventory.sugar * 2),
            gameState.inventory.cups
        );
        
        if (totalAvailableCups < settings.marketingCups) {
            alert('Not enough ingredients to make social media samples!');
            settings.marketingCups = 0;
            settings.marketing = 'none';
        }
    }
    
    const cupsSold = Math.min(totalCustomers, maxCups);
    const customersServed = cupsSold;
    const customersMissed = Math.max(0, totalCustomers - cupsSold);
    
    // Calculate ingredients used
    const lemonsUsed = cupsSold;
    const sugarUsed = Math.ceil(cupsSold * 0.5);
    const cupsUsed = cupsSold;
    
    // Update inventory - ensure we don't go negative
    // First deduct marketing cups if social media was used
    let totalLemonsUsed = lemonsUsed + settings.marketingCups;
    let totalSugarUsed = sugarUsed + Math.ceil(settings.marketingCups * 0.5);
    let totalCupsUsed = cupsUsed + settings.marketingCups;
    
    // Use lemons from oldest batches first (FIFO)
    let lemonsToUse = totalLemonsUsed;
    gameState.inventory.lemonExpiry.sort((a, b) => a.expiryDay - b.expiryDay);
    
    gameState.inventory.lemonExpiry = gameState.inventory.lemonExpiry.map(batch => {
        if (lemonsToUse > 0 && batch.amount > 0) {
            const used = Math.min(batch.amount, lemonsToUse);
            batch.amount -= used;
            lemonsToUse -= used;
        }
        return batch;
    }).filter(batch => batch.amount > 0); // Remove empty batches
    
    gameState.inventory.lemons = Math.max(0, gameState.inventory.lemons - totalLemonsUsed);
    gameState.inventory.sugar = Math.max(0, gameState.inventory.sugar - totalSugarUsed);
    gameState.inventory.cups = Math.max(0, gameState.inventory.cups - totalCupsUsed);
    
    // Calculate revenue
    const revenue = cupsSold * settings.cupPrice;
    gameState.balance += revenue;
    
    // Ensure balance never goes negative
    gameState.balance = Math.max(0, gameState.balance);
    
    // Calculate profit (revenue minus today's expenses from receipt)
    const profit = revenue - (gameState.todayExpenses || 0);
    
    // Store daily stats
    gameState.dailyStats.push({
        day: gameState.day,
        dayOfWeek: daysOfWeek[gameState.dayOfWeek],
        weather: weather.name,
        revenue: revenue,
        profit: profit,
        customersServed: customersServed,
        customersMissed: customersMissed,
        cupPrice: settings.cupPrice,
        location: gameState.location,
        event: gameState.todayEvent ? gameState.todayEvent.text : null
    });
    
    gameState.totalCustomersServed += customersServed;
    gameState.totalCustomersMissed += customersMissed;
    
    // Build summary
    let summaryHTML = `
        <div class="weather-display">
            <i class="fas ${weather.icon} weather-icon"></i>
            <div>
                <h3>${weather.name}</h3>
                <p>${weather.desc}</p>
            </div>
        </div>
        
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-label">Total Customers</div>
                <div class="stat-value">${totalCustomers}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Cups Sold</div>
                <div class="stat-value">${cupsSold}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Customers Missed</div>
                <div class="stat-value" style="color: ${customersMissed > 0 ? 'var(--warning)' : 'var(--success)'}">${customersMissed}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Leftover Cups</div>
                <div class="stat-value">${Math.max(0, maxCups - cupsSold)}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Revenue</div>
                <div class="stat-value">${revenue.toFixed(2)}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Today's Profit</div>
                <div class="stat-value" style="color: ${profit >= 0 ? 'var(--success)' : 'var(--warning)'}">${profit.toFixed(2)}</div>
            </div>
        </div>
    `;
    
    // Success message if supply closely matched demand
    const leftoverCups = Math.max(0, maxCups - cupsSold);
    const supplyDemandDiff = Math.abs(cupsSold - totalCustomers);
    
    if (supplyDemandDiff <= 3 && leftoverCups <= 3 && cupsSold > 0) {
        summaryHTML += `
            <div class="success-message">
                <i class="fas fa-star"></i> Perfect planning! Your supply matched demand beautifully!
            </div>
        `;
    } else if (leftoverCups > 10) {
        summaryHTML += `
            <div class="card" style="background: #FFF3CD; border: 2px solid #FFD700; margin-top: 20px;">
                <p><i class="fas fa-exclamation-triangle"></i> You made too many cups! Consider reducing production to avoid waste.</p>
            </div>
        `;
    }
    
    document.getElementById('summary-content').innerHTML = summaryHTML;
    
    updateHUD();
    showScreen('summary-screen');
}

// Next day
function nextDay() {
    // Check for game end FIRST
    if (gameState.gameMode === 'scored' && gameState.day >= 28) {
        showFinalScore();
        return;
    }
    
    // Check for weekly recap
    if (gameState.day % 7 === 0 && gameState.day > 0) {
        showWeeklyRecap();
        return;
    }
    
    // Advance day
    gameState.day++;
    gameState.dayOfWeek = (gameState.dayOfWeek + 1) % 7;
    if (gameState.dayOfWeek === 0) {
        gameState.week++;
    }
    
    updateHUD();
    showScreen('morning-screen');
    showMorningBriefing();
}

// Weekly recap
function showWeeklyRecap() {
    const weekStats = gameState.dailyStats.slice(-7);
    
    let totalRevenue = 0;
    let totalProfit = 0;
    
    weekStats.forEach(stat => {
        totalRevenue += stat.revenue;
        totalProfit += stat.profit;
    });
    
    // Build stats
    document.getElementById('weekly-stats').innerHTML = `
        <div class="stat-card">
            <div class="stat-label">Total Revenue</div>
            <div class="stat-value">${totalRevenue.toFixed(2)}</div>
        </div>
        <div class="stat-card">
            <div class="stat-label">Total Profit</div>
            <div class="stat-value" style="color: ${totalProfit >= 0 ? 'var(--success)' : 'var(--warning)'}">${totalProfit.toFixed(2)}</div>
        </div>
        <div class="stat-card">
            <div class="stat-label">Average Daily Profit</div>
            <div class="stat-value">${(totalProfit / weekStats.length).toFixed(2)}</div>
        </div>
    `;
    
    // Clear any existing charts first
    const charts = ['profit-chart', 'inventory-chart', 'customers-chart'];
    charts.forEach(chartId => {
        const chartElement = document.getElementById(chartId);
        const chartInstance = Chart.getChart(chartElement);
        if (chartInstance) {
            chartInstance.destroy();
        }
    });
    
    // Charts
    const days = weekStats.map(s => `Day ${s.day}`);
    const profits = weekStats.map(s => s.profit);
    const customers = weekStats.map(s => s.customersServed);
    const missed = weekStats.map(s => s.customersMissed);
    
    // Profit chart
    const profitCtx = document.getElementById('profit-chart').getContext('2d');
    new Chart(profitCtx, {
        type: 'line',
        data: {
            labels: days,
            datasets: [{
                label: 'Daily Profit',
                data: profits,
                borderColor: '#4CAF50',
                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Daily Profit Trend'
                }
            }
        }
    });
    
    // Inventory usage (simplified)
    const inventoryCtx = document.getElementById('inventory-chart').getContext('2d');
    new Chart(inventoryCtx, {
        type: 'bar',
        data: {
            labels: ['Lemons', 'Sugar', 'Cups'],
            datasets: [{
                label: 'Current Stock',
                data: [gameState.inventory.lemons, gameState.inventory.sugar, gameState.inventory.cups],
                backgroundColor: ['#FFD700', '#FFA500', '#87CEEB']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Current Inventory'
                }
            }
        }
    });
    
    // Customers chart
    const customersCtx = document.getElementById('customers-chart').getContext('2d');
    new Chart(customersCtx, {
        type: 'bar',
        data: {
            labels: days,
            datasets: [{
                label: 'Served',
                data: customers,
                backgroundColor: '#4CAF50'
            }, {
                label: 'Missed',
                data: missed,
                backgroundColor: '#FF9800'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Customer Service'
                }
            },
            scales: {
                x: { stacked: true },
                y: { stacked: true }
            }
        }
    });
    
    showScreen('weekly-screen');
}

// Continue from weekly recap
function continueFromWeekly() {
    // Advance day first
    gameState.day++;
    gameState.dayOfWeek = (gameState.dayOfWeek + 1) % 7;
    if (gameState.dayOfWeek === 0) {
        gameState.week++;
    }
    
    // Then check if game should end
    if (gameState.gameMode === 'scored' && gameState.day > 28) {
        showFinalScore();
        return;
    }
    
    updateHUD();
    showScreen('morning-screen');
    showMorningBriefing();
}

// Final score
function showFinalScore() {
    const avgProfit = gameState.dailyStats.reduce((sum, s) => sum + s.profit, 0) / gameState.dailyStats.length;
    const satisfactionRate = gameState.totalCustomersServed / (gameState.totalCustomersServed + gameState.totalCustomersMissed);
    
    // Calculate grade
    let score = 0;
    
    // Balance (40%)
    if (gameState.balance >= 200) score += 40;
    else if (gameState.balance >= 150) score += 35;
    else if (gameState.balance >= 100) score += 30;
    else if (gameState.balance >= 50) score += 20;
    else score += 10;
    
    // Average profit (30%)
    if (avgProfit >= 20) score += 30;
    else if (avgProfit >= 15) score += 25;
    else if (avgProfit >= 10) score += 20;
    else if (avgProfit >= 5) score += 15;
    else score += 5;
    
    // Satisfaction (30%)
    score += satisfactionRate * 30;
    
    let grade = 'F';
    if (score >= 90) grade = 'A+';
    else if (score >= 85) grade = 'A';
    else if (score >= 80) grade = 'B+';
    else if (score >= 75) grade = 'B';
    else if (score >= 70) grade = 'C+';
    else if (score >= 65) grade = 'C';
    else if (score >= 60) grade = 'D';
    
    document.getElementById('final-grade').textContent = grade;
    
    document.getElementById('final-stats').innerHTML = `
        <div class="stat-card">
            <div class="stat-label">Final Balance</div>
            <div class="stat-value">${gameState.balance.toFixed(2)}</div>
        </div>
        <div class="stat-card">
            <div class="stat-label">Average Daily Profit</div>
            <div class="stat-value">${avgProfit.toFixed(2)}</div>
        </div>
        <div class="stat-card">
            <div class="stat-label">Customer Satisfaction</div>
            <div class="stat-value">${(satisfactionRate * 100).toFixed(1)}%</div>
        </div>
        <div class="stat-card">
            <div class="stat-label">Total Days</div>
            <div class="stat-value">${gameState.day}</div>
        </div>
    `;
    
    showScreen('final-screen');
}

// Save game
function saveGame() {
    const saveData = JSON.stringify(gameState, null, 2);
    const blob = new Blob([saveData], { type: 'text/plain' });
    const fileName = `${gameState.companyName.replace(/\s+/g, '_')}_Day${gameState.day}.txt`;
    saveAs(blob, fileName);
}

// Help modal
function showHelp() {
    document.getElementById('help-modal').classList.add('active');
}

function closeHelp() {
    document.getElementById('help-modal').classList.remove('active');
}

// Close modal on outside click
document.getElementById('help-modal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeHelp();
    }
});

// Toggle lemon details dropdown
function toggleLemonDetails(event) {
    event.stopPropagation();
    const details = document.getElementById('lemon-details');
    details.classList.toggle('active');
    
    if (details.classList.contains('active')) {
        updateLemonDetails();
    }
}

// Update lemon details display
function updateLemonDetails() {
    const details = document.getElementById('lemon-details');
    details.innerHTML = '<h5>Lemon Inventory</h5>';
    
    if (gameState.inventory.lemonExpiry.length === 0 || gameState.inventory.lemons === 0) {
        details.innerHTML += '<div class="no-lemons">No lemons in stock</div>';
        return;
    }
    
    // Sort by expiry date (soonest first) and group by expiry day
    const sortedBatches = [...gameState.inventory.lemonExpiry].sort((a, b) => a.expiryDay - b.expiryDay);
    const groupedBatches = {};
    
    sortedBatches.forEach(batch => {
        const daysLeft = batch.expiryDay - gameState.day;
        if (daysLeft > 0 && batch.amount > 0) {
            if (!groupedBatches[daysLeft]) {
                groupedBatches[daysLeft] = 0;
            }
            groupedBatches[daysLeft] += batch.amount;
        }
    });
    
    // Display grouped batches
    Object.entries(groupedBatches).forEach(([daysLeft, amount]) => {
        const days = parseInt(daysLeft);
        const className = days === 1 ? 'expiry-warning' : '';
        details.innerHTML += `
            <div class="lemon-batch ${className}">
                <span>${amount} lemons</span>
                <span style="font-size: 12px; opacity: 0.8;">${days} day${days !== 1 ? 's' : ''}</span>
            </div>
        `;
    });
}

// Close lemon dropdown
function closeLemonDetails() {
    document.getElementById('lemon-details').classList.remove('active');
}

// Close lemon dropdown when clicking outside
document.addEventListener('click', function() {
    document.getElementById('lemon-details').classList.remove('active');
});

// Show journal
function showJournal() {
    const journalContent = document.getElementById('journal-content');
    journalContent.innerHTML = '';
    
    if (gameState.dailyStats.length === 0) {
        journalContent.innerHTML = '<p>No entries yet. Start playing to build your business history!</p>';
    } else {
        // Show most recent entries first
        const reversedStats = [...gameState.dailyStats].reverse();
        reversedStats.forEach(stat => {
            const profitClass = stat.profit >= 0 ? 'success' : 'warning';
            journalContent.innerHTML += `
                <div class="journal-entry">
                    <h4>${stat.dayOfWeek}, Day ${stat.day}</h4>
                    <p><i class="fas fa-cloud-sun"></i> Weather: ${stat.weather}</p>
                    <p><i class="fas fa-dollar-sign"></i> Price: ${stat.cupPrice.toFixed(2)}/cup</p>
                    <p><i class="fas fa-users"></i> Served ${stat.customersServed} customers${stat.customersMissed > 0 ? `, missed ${stat.customersMissed}` : ''}</p>
                    <p><i class="fas fa-chart-line"></i> Revenue: ${stat.revenue.toFixed(2)}</p>
                    <p style="color: var(--${profitClass})"><i class="fas fa-coins"></i> Profit: ${stat.profit.toFixed(2)}</p>
                    ${stat.event ? `<p><i class="fas fa-exclamation-circle"></i> Event: ${stat.event}</p>` : ''}
                </div>
            `;
        });
    }
    
    document.getElementById('journal-modal').classList.add('active');
}

// Close journal
function closeJournal() {
    document.getElementById('journal-modal').classList.remove('active');
}

// Load save file
function loadSaveFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const loadedState = JSON.parse(e.target.result);
            
            // Validate the save file
            if (!loadedState.companyName || typeof loadedState.day !== 'number') {
                alert('Invalid save file!');
                return;
            }
            
            // Load the game state
            gameState = loadedState;
            
            // Start the game with loaded state
            document.getElementById('hud').style.display = 'block';
            updateHUD();
            showScreen('morning-screen');
            showMorningBriefing();
            
        } catch (error) {
            alert('Error loading save file: ' + error.message);
        }
    };
    reader.readAsText(file);
}