/* =====================================================
   FashionStoreCloset | Product Offer Countdown
   Main Product + Related Products
   ===================================================== */

(function () {
  "use strict";

  function activateOfferCountdown() {
    const labels = ["Days", "Hours", "Minutes", "Seconds"];

    // Find every offer timer on the page
    const timerLists = document.querySelectorAll(".offer ul");

    timerLists.forEach(function (ul) {
      // Prevent duplicate activation
      if (ul.dataset.timerActivated === "true") return;

      const items = ul.querySelectorAll("li");

      // Timer must contain exactly four number elements
      if (items.length !== 4) return;

      ul.dataset.timerActivated = "true";
      ul.classList.add("offer-countdown");

      // Read original HTML values
      const values = Array.from(items).map(function (item) {
        return Math.max(0, parseInt(item.textContent.trim(), 10) || 0);
      });

      // Convert initial values to seconds
      let totalSeconds =
        values[0] * 86400 + values[1] * 3600 + values[2] * 60 + values[3];

      // Add labels to timer boxes
      items.forEach(function (item, index) {
        item.dataset.label = labels[index];
      });

      // Locate caption
      const caption = ul.parentElement.querySelector("p");

      function updateTimer() {
        const days = Math.floor(totalSeconds / 86400);

        const hours = Math.floor((totalSeconds % 86400) / 3600);

        const minutes = Math.floor((totalSeconds % 3600) / 60);

        const seconds = totalSeconds % 60;

        const displayValues = [days, hours, minutes, seconds];

        items.forEach(function (item, index) {
          item.textContent = String(displayValues[index]).padStart(2, "0");
        });

        // Offer expired
        if (totalSeconds <= 0) {
          ul.parentElement.classList.add("expired");

          if (caption) {
            caption.textContent = "Offer Expired";
          }

          return false;
        }

        return true;
      }

      // Initial rendering
      updateTimer();

      // Start countdown
      function tick() {
        if (totalSeconds <= 0) return;

        totalSeconds--;

        if (updateTimer()) {
          setTimeout(tick, 1000);
        }
      }

      if (totalSeconds > 0) {
        setTimeout(tick, 1000);
      }
    });
  }

  // Wait for HTML to load
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", activateOfferCountdown);
  } else {
    activateOfferCountdown();
  }
})();
