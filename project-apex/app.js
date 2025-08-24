// Application data
const appData = {
  user: {
    name: "Robert Scott",
    starkPoints: 1450,
    monthlyFuelSpend: 4250,
    monthlySavings: 850,
    currentStreak: 12,
    tier: "Road Warrior",
    transactionsThisMonth: 8
  },
  fuelStations: [
    {
      name: "BPCL - Central Plaza",
      brand: "BPCL",
      distance: 0.8,
      eta: "3 min",
      petrolPrice: 102.45,
      dieselPrice: 89.67,
      offer: "5% cashback with UPI",
      rating: 4.2,
      coordinates: [28.6139, 77.2090]
    },
    {
      name: "HPCL - Highway Station",
      brand: "HPCL",
      distance: 1.2,
      eta: "5 min", 
      petrolPrice: 101.89,
      dieselPrice: 89.23,
      offer: "3x Stark Points today",
      rating: 4.5,
      coordinates: [28.6089, 77.2140]
    },
    {
      name: "IndianOil - Express Point",
      brand: "IndianOil",
      distance: 1.5,
      eta: "6 min",
      petrolPrice: 102.12,
      dieselPrice: 89.45,
      offer: "Free car wash above ₹1000",
      rating: 4.0,
      coordinates: [28.6189, 77.2040]
    },
    {
      name: "Jio-bp - Smart Station",
      brand: "Jio-bp",
      distance: 2.1,
      eta: "8 min",
      petrolPrice: 101.75,
      dieselPrice: 88.90,
      offer: "Best price guaranteed",
      rating: 4.3,
      coordinates: [28.6239, 77.2190]
    }
  ]
};

// Application state
let currentScreen = 'home-screen';
let selectedStation = null;
let selectedFuel = 'petrol';
let paymentAmount = 0;
let qrTimer = null;

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
  console.log('Project Apex app initializing...');
  selectedStation = appData.fuelStations[0]; // Set default station
  
  initializeNavigation();
  initializePaymentScreen();
  initializeStationCards();
  initializeExpenseChart();
  initializeRewards();
  initializeFilters();
  updatePaymentSummary();
  
  // Animate progress bars after initial load
  setTimeout(animateProgressBars, 1000);
  
  console.log('Project Apex app initialized successfully');
});

// Navigation system
function initializeNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  
  navItems.forEach(item => {
    item.addEventListener('click', function(e) {
      e.preventDefault();
      const targetScreen = this.getAttribute('data-screen');
      
      if (targetScreen) {
        console.log('Switching to screen:', targetScreen);
        switchScreen(targetScreen);
        
        // Update active nav item
        navItems.forEach(nav => nav.classList.remove('active'));
        this.classList.add('active');
        
        // Special animations for certain screens
        if (targetScreen === 'home-screen') {
          setTimeout(animateProgressBars, 300);
        }
      }
    });
  });
}

function switchScreen(screenId) {
  const screens = document.querySelectorAll('.screen');
  const targetScreen = document.getElementById(screenId);
  
  if (!targetScreen) {
    console.error('Screen not found:', screenId);
    return;
  }
  
  // Hide all screens
  screens.forEach(screen => {
    screen.classList.remove('active');
  });
  
  // Show target screen
  targetScreen.classList.add('active');
  currentScreen = screenId;
  
  console.log('Switched to screen:', screenId);
}

// Station card interactions
function initializeStationCards() {
  const stationCards = document.querySelectorAll('.station-card');
  stationCards.forEach((card, index) => {
    card.addEventListener('click', function() {
      selectedStation = appData.fuelStations[index];
      console.log('Selected station:', selectedStation.name);
      updateSelectedStation();
      switchScreen('pay-screen');
      
      // Update nav
      const navItems = document.querySelectorAll('.nav-item');
      navItems.forEach(nav => nav.classList.remove('active'));
      const payNav = document.querySelector('[data-screen="pay-screen"]');
      if (payNav) {
        payNav.classList.add('active');
      }
    });
  });
}

function updateSelectedStation() {
  const stationDisplay = document.querySelector('.selected-station');
  if (stationDisplay && selectedStation) {
    const brandClass = selectedStation.brand.toLowerCase().replace('-', '').replace(' ', '');
    stationDisplay.innerHTML = `
      <div class="station-brand ${brandClass}">${selectedStation.brand.substring(0, 2).toUpperCase()}</div>
      <div>${selectedStation.name}</div>
    `;
  }
  
  // Update fuel prices
  updateFuelPrices();
}

function updateFuelPrices() {
  if (!selectedStation) return;
  
  const petrolOption = document.querySelector('[data-fuel="petrol"]');
  const dieselOption = document.querySelector('[data-fuel="diesel"]');
  
  if (petrolOption) {
    petrolOption.querySelector('.fuel-price-per-liter').textContent = `₹${selectedStation.petrolPrice}/L`;
  }
  
  if (dieselOption) {
    dieselOption.querySelector('.fuel-price-per-liter').textContent = `₹${selectedStation.dieselPrice}/L`;
  }
}

// Payment screen functionality
function initializePaymentScreen() {
  // Fuel selection
  const fuelOptions = document.querySelectorAll('.fuel-option');
  fuelOptions.forEach(option => {
    option.addEventListener('click', function() {
      fuelOptions.forEach(opt => opt.classList.remove('active'));
      this.classList.add('active');
      selectedFuel = this.getAttribute('data-fuel');
      updatePaymentSummary();
    });
  });
  
  // Amount input
  const amountInput = document.getElementById('payment-amount');
  if (amountInput) {
    amountInput.addEventListener('input', function() {
      paymentAmount = parseFloat(this.value) || 0;
      updatePaymentSummary();
    });
  }
  
  // Quick amount buttons
  const amountBtns = document.querySelectorAll('.amount-btn');
  amountBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const amount = parseInt(this.getAttribute('data-amount'));
      paymentAmount = amount;
      if (amountInput) {
        amountInput.value = amount;
      }
      updatePaymentSummary();
    });
  });
  
  // Generate QR button
  const generateQrBtn = document.getElementById('generate-qr-btn');
  if (generateQrBtn) {
    generateQrBtn.addEventListener('click', generateQRCode);
  }
}

function updatePaymentSummary() {
  if (!selectedStation) return;
  
  const pricePerLiter = selectedFuel === 'petrol' ? selectedStation.petrolPrice : selectedStation.dieselPrice;
  const estimatedLiters = paymentAmount / pricePerLiter;
  const starkPoints = Math.floor(paymentAmount * 0.03); // 3% of amount as points
  const cashback = Math.floor(paymentAmount * 0.05); // 5% cashback with UPI
  
  // Update displays
  const estimatedLitersDisplay = document.getElementById('estimated-liters');
  if (estimatedLitersDisplay) {
    estimatedLitersDisplay.textContent = estimatedLiters.toFixed(1);
  }
  
  const summaryAmount = document.getElementById('summary-amount');
  if (summaryAmount) {
    summaryAmount.textContent = `₹${paymentAmount}`;
  }
  
  const summaryPoints = document.getElementById('summary-points');
  if (summaryPoints) {
    summaryPoints.textContent = `${starkPoints} pts`;
  }
  
  const summaryCashback = document.getElementById('summary-cashback');
  if (summaryCashback) {
    summaryCashback.textContent = `₹${cashback}`;
  }
}

function generateQRCode() {
  if (paymentAmount <= 0) {
    alert('Please enter a valid amount');
    return;
  }
  
  const qrSection = document.getElementById('qr-section');
  const generateQrBtn = document.getElementById('generate-qr-btn');
  
  // Show QR section
  if (qrSection) {
    qrSection.classList.remove('hidden');
  }
  
  if (generateQrBtn) {
    generateQrBtn.textContent = 'Payment Pending...';
    generateQrBtn.disabled = true;
  }
  
  // Start countdown timer
  startPaymentTimer();
  
  // Simulate payment completion after 10 seconds
  setTimeout(() => {
    completePayment();
  }, 10000);
}

function startPaymentTimer() {
  let timeLeft = 300; // 5 minutes in seconds
  const timerDisplay = document.getElementById('timer');
  
  qrTimer = setInterval(() => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    
    if (timerDisplay) {
      timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    timeLeft--;
    
    if (timeLeft < 0) {
      clearInterval(qrTimer);
      resetPaymentScreen();
    }
  }, 1000);
}

function completePayment() {
  if (qrTimer) {
    clearInterval(qrTimer);
  }
  
  // Update user's Stark Points
  const pointsEarned = Math.floor(paymentAmount * 0.03);
  appData.user.starkPoints += pointsEarned;
  
  // Show success message
  alert(`Payment successful! You earned ${pointsEarned} Stark Points.`);
  
  // Update displays
  updateStarkPointsDisplay();
  
  // Reset payment screen
  resetPaymentScreen();
  
  // Switch to home screen
  switchScreen('home-screen');
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(nav => nav.classList.remove('active'));
  const homeNav = document.querySelector('[data-screen="home-screen"]');
  if (homeNav) {
    homeNav.classList.add('active');
  }
}

function resetPaymentScreen() {
  const qrSection = document.getElementById('qr-section');
  const generateQrBtn = document.getElementById('generate-qr-btn');
  const amountInput = document.getElementById('payment-amount');
  
  if (qrSection) {
    qrSection.classList.add('hidden');
  }
  
  if (generateQrBtn) {
    generateQrBtn.textContent = 'Generate Payment QR';
    generateQrBtn.disabled = false;
  }
  
  if (amountInput) {
    amountInput.value = '';
  }
  
  paymentAmount = 0;
  updatePaymentSummary();
}

function updateStarkPointsDisplay() {
  const pointsValue = document.querySelector('.points-value');
  if (pointsValue) {
    pointsValue.textContent = appData.user.starkPoints.toLocaleString();
  }
  
  const balanceAmount = document.querySelector('.balance-amount');
  if (balanceAmount) {
    balanceAmount.textContent = appData.user.starkPoints.toLocaleString();
  }
}

// Initialize expense chart
function initializeExpenseChart() {
  const canvas = document.getElementById('expenseChart');
  if (!canvas || !window.Chart) return;
  
  const ctx = canvas.getContext('2d');
  
  // Sample monthly data
  const monthlyData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
    datasets: [{
      label: 'Fuel Expenses (₹)',
      data: [3800, 4200, 3900, 4100, 4300, 4000, 4150, 4250],
      backgroundColor: '#1FB8CD',
      borderColor: '#1FB8CD',
      borderWidth: 2,
      tension: 0.4,
      fill: false
    }, {
      label: 'Savings (₹)',
      data: [200, 350, 275, 400, 500, 320, 650, 850],
      backgroundColor: '#B4413C',
      borderColor: '#B4413C',
      borderWidth: 2,
      tension: 0.4,
      fill: false
    }]
  };
  
  new Chart(ctx, {
    type: 'line',
    data: monthlyData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            usePointStyle: true,
            padding: 20
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return '₹' + value;
            }
          }
        }
      },
      elements: {
        point: {
          radius: 4,
          hoverRadius: 6
        }
      }
    }
  });
}

// Reward redemption functionality
function initializeRewards() {
  const redeemBtns = document.querySelectorAll('.reward-card .btn--primary');
  redeemBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const rewardCard = this.closest('.reward-card');
      const rewardName = rewardCard.querySelector('.reward-name').textContent;
      const costText = rewardCard.querySelector('.reward-cost').textContent;
      const pointsCost = parseInt(costText.match(/\d+/)[0]);
      
      if (appData.user.starkPoints >= pointsCost) {
        if (confirm(`Redeem ${rewardName} for ${pointsCost} points?`)) {
          appData.user.starkPoints -= pointsCost;
          updateStarkPointsDisplay();
          alert(`${rewardName} redeemed successfully!`);
          
          // Update reward availability
          updateRewardAvailability();
        }
      } else {
        alert('Insufficient Stark Points');
      }
    });
  });
}

function updateRewardAvailability() {
  const rewardCards = document.querySelectorAll('.reward-card');
  rewardCards.forEach(card => {
    const costText = card.querySelector('.reward-cost').textContent;
    const pointsCost = parseInt(costText.match(/\d+/)[0]);
    const btn = card.querySelector('.btn');
    
    if (appData.user.starkPoints >= pointsCost) {
      card.classList.add('affordable');
      if (btn.classList.contains('btn--outline')) {
        btn.classList.remove('btn--outline');
        btn.classList.add('btn--primary');
        btn.textContent = 'Redeem';
      }
    } else {
      card.classList.remove('affordable');
      if (btn.classList.contains('btn--primary')) {
        btn.classList.remove('btn--primary');
        btn.classList.add('btn--outline');
        const needed = pointsCost - appData.user.starkPoints;
        btn.textContent = `Need ${needed} more`;
      }
    }
  });
}

// Challenge progress animations
function animateProgressBars() {
  const progressBars = document.querySelectorAll('.progress-fill');
  progressBars.forEach(bar => {
    const width = bar.style.width;
    bar.style.width = '0%';
    setTimeout(() => {
      bar.style.width = width;
    }, 500);
  });
}

// Filter functionality for locate screen
function initializeFilters() {
  const filterBtn = document.getElementById('filter-btn');
  if (filterBtn) {
    filterBtn.addEventListener('click', function() {
      alert('Filter options:\n• By fuel type\n• By distance\n• By price\n• By offers\n\nFilters coming soon!');
    });
  }
}

// Utility functions
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(amount);
}

function formatDistance(distance) {
  return distance < 1 ? `${(distance * 1000).toFixed(0)}m` : `${distance.toFixed(1)}km`;
}

// Export functions for potential external use
window.ProjectApex = {
  switchScreen,
  updateStarkPointsDisplay,
  generateQRCode,
  appData
};