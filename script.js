

// Copy menu for mobile
function copyMenu() {
  const dptCategory = document.querySelector('.dpt-cat');
  const dptPlace = document.querySelector('.departments');
  if (dptCategory && dptPlace) {
    dptPlace.innerHTML = dptCategory.innerHTML;
  }
  
  const mainNav = document.querySelector('.header-nav nav');
  const navPlace = document.querySelector('.off-canvas nav');
  if (mainNav && navPlace) {
    navPlace.innerHTML = mainNav.innerHTML;
  }
  
  const topNav = document.querySelector('.header-top .wrapper');
  const topPlace = document.querySelector('.off-canvas .thetop-nav');
  if (topNav && topPlace) {
    topPlace.innerHTML = topNav.innerHTML;
  }
}
copyMenu();

// Show mobile menu
const menuButton = document.querySelector('.trigger');
const closeButton = document.querySelector('.t-close');
const addClass = document.querySelector('.site');

if (menuButton && closeButton && addClass) {
  menuButton.addEventListener('click', () => {
    addClass.classList.toggle('showmenu');
  });

  closeButton.addEventListener('click', () => {
    addClass.classList.remove('showmenu');
  });
}

// Show sub-menu on mobile
const submenu = document.querySelectorAll('.has-child .icon-small');
submenu.forEach(menu => menu.addEventListener('click', toggle));

function toggle(e) {
  e.preventDefault();
  submenu.forEach(item => item.closest('.has-child').classList.remove('expand'));
  this.closest('.has-child').classList.toggle('expand');
}

// Initialize Swiper
document.addEventListener('DOMContentLoaded', () => {
  const swiper = new Swiper('.swiper', {
    loop: true,
    pagination: {
      el: '.swiper-pagination',
    },
  });

  // Product image slider
  const productThumb = new Swiper('.small-image', {
    loop: true,
    spaceBetween: 10,
    slidesPerView: 3,
    freeMode: true,
    watchSlidesProgress: true,
    breakpoints: {
      481: {
        spaceBetween: 32,
      }
    }
  });

  const productBig = new Swiper('.big-image', {
    loop: true,
    autoHeight: true,
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
    thumbs: {
      swiper: productThumb,
    }
  });
});

// Show search
const searchButton = document.querySelector('.t-search');
const tClose = document.querySelector('.search-close');
const showClass = document.querySelector('.site');

if (searchButton && tClose && showClass) {
  searchButton.addEventListener('click', () => {
    showClass.classList.toggle('showsearch');
  });

  tClose.addEventListener('click', () => {
    showClass.classList.remove('showsearch');
  });
}

// Show department menu
const dptButton = document.querySelector('.dpt-cat .dpt-trigger');

if (dptButton && showClass) {
  dptButton.addEventListener('click', () => {
    showClass.classList.toggle('showdpt');
  });
}

// Stock products bar width percentage
const stocks = document.querySelectorAll('.products .stock');
stocks.forEach(stockElem => {
  const stock = stockElem.dataset.stock;
  const available = stockElem.querySelector('.qty-available');
  const sold = stockElem.querySelector('.qty-sold');

  if (available && sold) {
    const percent = (parseInt(sold.innerHTML) * 100) / stock;
    stockElem.querySelector('.available').style.width = `${percent}%`;
  }
});

// Countdown Timer
const offerEndDate = new Date('2025-06-31T00:00:00');

function startCountdown() {
  const now = new Date();
  const timeRemaining = offerEndDate - now;

  if (timeRemaining > 0) {
    const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

    // Update the countdown UI
    const countdownTimer = document.getElementById("countdown-timer");
    countdownTimer.innerHTML = `
      <li>${String(days).padStart(2, '0')}</li>
      <li>${String(hours).padStart(2, '0')}</li>
      <li>${String(minutes).padStart(2, '0')}</li>
      <li>${String(seconds).padStart(2, '0')}</li>
    `;
  } else {
    // Offer has ended
    document.getElementById("countdown-timer").innerHTML = `<li>00</li><li>00</li><li>00</li><li>00</li>`;
  }
}

// Start the countdown and update every second
setInterval(startCountdown, 1000);

// Show cart on click
const divtoShow = '.mini-cart';
const divPopup = document.querySelector(divtoShow);
const divTrigger = document.querySelector('.cart-trigger');

if (divTrigger && divPopup) {
  divTrigger.addEventListener('click', () => {
    setTimeout(() => {
      if (!divPopup.classList.contains('show')) {
        divPopup.classList.add('show');
      }
    }, 250);
  });

  // Close by click outside
  document.addEventListener('click', (e) => {
    const isClosest = e.target.closest(divtoShow);
    if (!isClosest && divPopup.classList.contains('show')) {
      divPopup.classList.remove('show');
    }
  });
}

// Show modal onload
window.onload = () => {
  document.querySelector('.sites').classList.toggle('showmodal');
};

// Close modal when the close button is clicked
document.querySelector('.modalclose')?.addEventListener('click', () => {
  document.querySelector('.sites').classList.remove('showmodal');
});

// Select form and error message elements
const form = document.getElementById('signup-form');
const errorMsg = document.getElementById('error-msg');

// Add event listener for form submission
form?.addEventListener('submit', (e) => {
  e.preventDefault(); // Prevent the form from submitting normally
  
  // Get form field values
  const username = document.getElementById('username').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
  const confirmPassword = document.getElementById('confirm-password').value.trim();

  // Basic validation
  if (username === '' || email === '' || password === '' || confirmPassword === '') {
    showError('All fields are required.');
    return;
  }

  if (password !== confirmPassword) {
    showError('Passwords do not match.');
    return;
  }

  // If all validations pass, simulate form submission
  alert('Form submitted successfully!');
  form.reset(); // Clear form fields
  errorMsg.style.display = 'none'; // Hide error message
});

// Show error message function
function showError(message) {
  errorMsg.innerText = message;
  errorMsg.style.display = 'block';
}
