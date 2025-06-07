// === Lemonade Stand JS ===

let playerName = '';
let companyName = '';
let budget = 0;
let day = 1;
let week = 1;
let weatherToday = '';
let currentEvent = '';
let marketingCost = 0;
let totalCostToday = 0;
let rentCost = 5;

let inventory = { lemons: 0, sugar: 0, cups: 0 };
let currentPrices = { lemons: 0, sugar: 0, cups: 0 };

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('start-game-btn').addEventListener('click', startGame);
  document.getElementById('to-decision-btn').addEventListener('click', goToDecisionScreen);
  document.getElementById('sell-btn').addEventListener('click', sellLemonade);
  document.getElementById('next-day-btn').addEventListener('click', advanceToNextDay);
  ['buy-lemons', 'buy-sugar', 'buy-cups'].forEach(id => {
    document.getElementById(id).addEventListener('input', updateIngredientCost);
  });
  document.querySelectorAll('input[name="marketing"]').forEach(el => el.addEventListener('change', updateIngredientCost));
});

function startGame() {
  playerName = document.getElementById('player-name').value.trim();
  companyName = document.getElementById('company-name').value.trim();
  const budgetOption = document.querySelector('input[name="budget"]:checked');
  if (!playerName || !companyName || !budgetOption) return alert("Fill everything");
  budget = parseInt(budgetOption.value);

  document.getElementById('hud-player-name').textContent = playerName;
  document.getElementById('hud-company-name').textContent = companyName;
  updateHUD();

  document.getElementById('start-screen').style.display = 'none';
  document.getElementById('hud').style.display = 'flex';
  document.getElementById('morning-briefing').style.display = 'block';
  showMorningBriefing();
}

function showMorningBriefing() {
  const weatherOptions = ['Sunny', 'Hot', 'Cloudy', 'Cool', 'Rainy'];
  weatherToday = weatherOptions[Math.floor(Math.random() * weatherOptions.length)];
  document.getElementById('weather-text').textContent = weatherToday;
  document.getElementById('hud-weather').textContent = weatherToday;
  document.getElementById('day-number').textContent = day;

  currentPrices.lemons = +(Math.random() * 0.2 + 0.3).toFixed(2);
  currentPrices.sugar = +(Math.random() * 0.1 + 0.2).toFixed(2);
  currentPrices.cups = +(Math.random() * 0.05 + 0.05).toFixed(2);

  document.getElementById('price-lemons').textContent = currentPrices.lemons;
  document.getElementById('price-sugar').textContent = currentPrices.sugar;
  document.getElementById('price-cups').textContent = currentPrices.cups;
  document.getElementById('price-lemons-label').textContent = currentPrices.lemons;
  document.getElementById('price-sugar-label').textContent = currentPrices.sugar;
  document.getElementById('price-cups-label').textContent = currentPrices.cups;

  const headlines = [
    "Boy claims lemonade cured hiccups!",
    "Mayor jogs by, gives thumbs up!",
    "Dog becomes mascot for your stand!",
    "Grandma calls it the best ever!",
    "Line around the block today!"
  ];
  document.getElementById('news-text').textContent = headlines[Math.floor(Math.random() * headlines.length)];

  const events = [
    '',
    'Critic might visit today. (+3)',
    'Pollen spike! Thirsty town. (+5)',
    'Park event! More traffic. (+4)',
    'Rival closed! More customers!'
  ];
  currentEvent = events[Math.floor(Math.random() * events.length)];
  document.getElementById('event-text').textContent = currentEvent || 'None';

  const invText = `🍋 ${inventory.lemons} | 🧂 ${inventory.sugar} | 🥤 ${inventory.cups}`;
  document.getElementById('inventory-text').textContent = invText;
}

function updateIngredientCost() {
  const l = parseInt(document.getElementById('buy-lemons').value) || 0;
  const s = parseInt(document.getElementById('buy-sugar').value) || 0;
  const c = parseInt(document.getElementById('buy-cups').value) || 0;
  marketingCost = parseInt(document.querySelector('input[name="marketing"]:checked')?.value || 0);

  const ingredientCost = l * currentPrices.lemons + s * currentPrices.sugar + c * currentPrices.cups;
  totalCostToday = ingredientCost + marketingCost;

  document.getElementById('ingredient-cost').textContent = `$${ingredientCost.toFixed(2)}`;
  document.getElementById('estimated-cost').textContent = `$${(totalCostToday + rentCost).toFixed(2)}`;
}

function goToDecisionScreen() {
  document.getElementById('morning-briefing').style.display = 'none';
  document.getElementById('decision-screen').style.display = 'block';
  document.getElementById('decision-day-number').textContent = day;
  updateIngredientCost();
}

function sellLemonade() {
  const price = parseFloat(document.getElementById('price-per-cup').value);
  const cupsToMake = parseInt(document.getElementById('cups-to-make').value);
  const lemonsToBuy = parseInt(document.getElementById('buy-lemons').value);
  const sugarToBuy = parseInt(document.getElementById('buy-sugar').value);
  const cupsToBuy = parseInt(document.getElementById('buy-cups').value);

  inventory.lemons += lemonsToBuy;
  inventory.sugar += sugarToBuy;
  inventory.cups += cupsToBuy;

  if (inventory.lemons < cupsToMake || inventory.sugar < cupsToMake || inventory.cups < cupsToMake) {
    alert("Not enough ingredients");
    return;
  }

  inventory.lemons -= cupsToMake;
  inventory.sugar -= cupsToMake;
  inventory.cups -= cupsToMake;

  let demand = Math.floor(Math.random() * 10 + 15);
  if (weatherToday === 'Hot') demand += 10;
  if (weatherToday === 'Rainy') demand -= 5;
  if (price > 3) demand -= 10;
  else if (price < 1.5) demand += 5;

  demand += marketingCost === 10 ? 5 : (marketingCost === 25 ? 12 : 0);
  if (currentEvent.includes('+3')) demand += 3;
  if (currentEvent.includes('+4')) demand += 4;
  if (currentEvent.includes('+5')) demand += 5;
  if (demand < 0) demand = 0;

  const cupsSold = Math.min(demand, cupsToMake);
  const revenue = cupsSold * price;
  const expenses = totalCostToday + rentCost;
  const profit = revenue - expenses;
  budget += profit;

  document.getElementById('summary-day-number').textContent = day;
  document.getElementById('summary-weather').textContent = weatherToday;
  document.getElementById('summary-customers').textContent = demand;
  document.getElementById('summary-cups-sold').textContent = cupsSold;
  document.getElementById('summary-revenue').textContent = `$${revenue.toFixed(2)}`;
  document.getElementById('summary-expenses').textContent = `$${expenses.toFixed(2)}`;
  document.getElementById('summary-profit').textContent = `$${profit.toFixed(2)}`;
  document.getElementById('summary-budget').textContent = `$${budget.toFixed(2)}`;

  updateHUD();

  document.getElementById('decision-screen').style.display = 'none';
  if (budget < 0) {
    document.getElementById('failure-screen').style.display = 'block';
    document.getElementById('hud').style.display = 'none';
  } else {
    document.getElementById('sales-summary').style.display = 'block';
  }
}

function advanceToNextDay() {
  day++;
  if ((day - 1) % 7 === 0) week++;
  document.getElementById('sales-summary').style.display = 'none';
  document.getElementById('failure-screen').style.display = 'none';
  document.getElementById('morning-briefing').style.display = 'block';
  showMorningBriefing();
}

function updateHUD() {
  document.getElementById('hud-day').textContent = day;
  document.getElementById('hud-budget').textContent = `$${budget.toFixed(2)}`;
  document.getElementById('hud-lemons').textContent = inventory.lemons;
  document.getElementById('hud-sugar').textContent = inventory.sugar;
  document.getElementById('hud-cups').textContent = inventory.cups;
}
