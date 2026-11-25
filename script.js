/* =========================================================
   FASHION STORE CLOSET
   Revised Frontend JavaScript
   Cart | Wishlist | Search | Swiper | Countdown | UI
   ========================================================= */

(() => {
  "use strict";

  /* =======================================================
     1. CONFIGURATION & STORAGE
     ======================================================= */

  const STORAGE = {
    cart: "fashionCloset_cart",
    wishlist: "fashionCloset_wishlist",
  };

  const readStorage = (key, fallback = []) => {
    try {
      const value = JSON.parse(localStorage.getItem(key));
      return Array.isArray(value) ? value : fallback;
    } catch {
      return fallback;
    }
  };

  const writeStorage = (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error("Local storage error:", error);
    }
  };

  let cart = readStorage(STORAGE.cart);
  let wishlist = readStorage(STORAGE.wishlist);

  const saveCart = () => writeStorage(STORAGE.cart, cart);
  const saveWishlist = () => writeStorage(STORAGE.wishlist, wishlist);

  /* =======================================================
     2. GENERAL HELPERS
     ======================================================= */

  const $ = (selector, parent = document) => parent.querySelector(selector);

  const $$ = (selector, parent = document) => [
    ...parent.querySelectorAll(selector),
  ];

  const getText = (element) => element?.textContent?.trim() || "";

  const getPrice = (value) => {
    const cleaned = String(value || "")
      .replace(/,/g, "")
      .replace(/[^\d.]/g, "");

    return Number(cleaned) || 0;
  };

  const escapeHTML = (value) =>
    String(value ?? "").replace(/[&<>"']/g, (character) => {
      const entities = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      };

      return entities[character];
    });

  const getCurrency = () => {
    const priceElement = $(".price .current, .product-price, .price");

    const text = getText(priceElement);

    if (text.includes("৳") || text.includes("Tk")) return "৳";
    if (text.includes("€")) return "€";
    if (text.includes("£")) return "£";

    return "$";
  };

  const formatPrice = (amount) =>
    `${getCurrency()}${Number(amount || 0).toFixed(2)}`;

  /* =======================================================
     3. PRODUCT INFORMATION
     ======================================================= */

  function getProductFromPage() {
    const titleElement = $(
      ".product-info h1, .product h1, .single-product h1, main h1, h1",
    );

    const imageElement = $(
      ".big-image .swiper-slide-active img, .big-image img, .single-product img, .product img, main img",
    );

    const priceElement = $(
      ".product-info .price .current, .price .current, .product-price .current, .single-product .price, .product-info .price, .price",
    );

    const title = getText(titleElement) || document.title;

    const price = getPrice(getText(priceElement));

    const image = imageElement?.currentSrc || imageElement?.src || "";

    const id = location.pathname.split("/").pop() || title;

    return {
      id,
      title,
      price,
      image,
      url: location.href,
    };
  }

  function getProductFromCard(card) {
    if (!card) return null;

    const titleElement = $(
      "h3 a, .content h3 a, .content h4 a, .title a, h3, h4",
      card,
    );

    const imageElement = $("img", card);

    const priceElement = $(".price .current, .current, .price", card);

    const linkElement = $("a[href]", card);

    const title = getText(titleElement);

    const url = linkElement?.href || location.href;

    return {
      id: url.split("/").pop() || title,
      title,
      price: getPrice(getText(priceElement)),
      image: imageElement?.currentSrc || imageElement?.src || "",
      url,
    };
  }

  /* =======================================================
     4. TOAST NOTIFICATION
     ======================================================= */

  function showToast(message) {
    let toast = $("#fs-toast");

    if (!toast) {
      toast = document.createElement("div");
      toast.id = "fs-toast";

      Object.assign(toast.style, {
        position: "fixed",
        bottom: "24px",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: "999999",
        padding: "12px 20px",
        background: "#222",
        color: "#fff",
        borderRadius: "8px",
        fontSize: "14px",
        maxWidth: "90%",
        textAlign: "center",
        opacity: "0",
        transition: "opacity .25s ease",
        pointerEvents: "none",
      });

      document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.style.opacity = "1";

    clearTimeout(toast._timeout);

    toast._timeout = setTimeout(() => {
      toast.style.opacity = "0";
    }, 2500);
  }

  /* =======================================================
     5. CART FUNCTIONALITY
     ======================================================= */

  function addToCart(product, quantity = 1) {
    if (!product || !product.title) {
      showToast("Unable to identify this product.");
      return;
    }

    const qty = Math.max(1, Number(quantity) || 1);

    const existing = cart.find((item) => item.id === product.id);

    if (existing) {
      existing.quantity = (Number(existing.quantity) || 1) + qty;
    } else {
      cart.push({
        ...product,
        quantity: qty,
      });
    }

    saveCart();
    updateCartCounters();
    renderMiniCart();
    renderCartPage();

    showToast(`${product.title} added to cart`);
  }

  function removeFromCart(id) {
    cart = cart.filter((item) => item.id !== id);

    saveCart();
    updateCartCounters();
    renderMiniCart();
    renderCartPage();

    showToast("Product removed from cart.");
  }

  function updateCartQuantity(id, quantity) {
    const item = cart.find((product) => product.id === id);

    if (!item) return;

    const qty = Number(quantity);

    if (!Number.isFinite(qty) || qty <= 0) {
      removeFromCart(id);
      return;
    }

    item.quantity = Math.max(1, Math.floor(qty));

    saveCart();
    updateCartCounters();
    renderMiniCart();
    renderCartPage();
  }

  function getCartTotal() {
    return cart.reduce(
      (total, item) =>
        total + (Number(item.price) || 0) * (Number(item.quantity) || 1),
      0,
    );
  }

  function getCartItemCount() {
    return cart.reduce(
      (total, item) => total + (Number(item.quantity) || 1),
      0,
    );
  }

  function updateCartCounters() {
    const totalItems = getCartItemCount();

    $$(".cart-count, .cart-quantity, .cart-number").forEach((element) => {
      element.textContent = totalItems;
    });

    $$(".cart-trigger").forEach((element) => {
      element.setAttribute(
        "aria-label",
        `Shopping cart with ${totalItems} items`,
      );
    });
  }

  /* =======================================================
     6. MINI CART
     ======================================================= */

  function renderMiniCart() {
    const miniCart = $(".mini-cart");

    if (!miniCart) return;

    let container = $(".fs-cart-content", miniCart);

    if (!container) {
      container = document.createElement("div");
      container.className = "fs-cart-content";
      miniCart.appendChild(container);
    }

    if (!cart.length) {
      container.innerHTML = `
        <div class="fs-empty-cart">
          <p>Your shopping cart is empty.</p>
          <a href="/index.html" class="primary-button">
            Continue Shopping
          </a>
        </div>
      `;

      return;
    }

    container.innerHTML = `
      <div class="fs-mini-cart-list">
        ${cart
          .map(
            (item) => `
          <div class="fs-mini-cart-item">
            <img
              src="${escapeHTML(item.image)}"
              alt="${escapeHTML(item.title)}"
              width="60"
            >

            <div class="fs-mini-cart-info">
              <strong>${escapeHTML(item.title)}</strong>

              <p>
                ${formatPrice(item.price)}
                × ${Number(item.quantity) || 1}
              </p>

              <button
                type="button"
                data-cart-remove="${escapeHTML(item.id)}"
              >
                Remove
              </button>
            </div>
          </div>
        `,
          )
          .join("")}
      </div>

      <div class="fs-mini-cart-total">
        <strong>Total:</strong>
        <strong>${formatPrice(getCartTotal())}</strong>
      </div>

      <a href="/cart.html" class="primary-button">
        View Cart
      </a>

      <a href="/checkout.html" class="primary-button">
        Checkout
      </a>
    `;
  }

  /* =======================================================
     7. CART PAGE
     ======================================================= */

  function renderCartPage() {
    const page = $(".page-cart, .cart-page, #cart-page");

    if (!page) return;

    let container = $(
      "#cart-items, .cart-items, .cart-list, .cart-content",
      page,
    );

    if (!container) {
      container = page;
    }

    let renderContainer = $(".fs-cart-render", container);

    if (!renderContainer) {
      renderContainer = document.createElement("div");
      renderContainer.className = "fs-cart-render";
      container.appendChild(renderContainer);
    }

    if (!cart.length) {
      renderContainer.innerHTML = `
        <div class="fs-empty-cart">
          <p>Your cart is currently empty.</p>

          <a href="/index.html" class="primary-button">
            Continue Shopping
          </a>
        </div>
      `;

      return;
    }

    renderContainer.innerHTML = `
      <div class="fs-cart-table">

        ${cart
          .map(
            (item) => `
          <div class="fs-cart-row">

            <div class="fs-cart-product">
              <img
                src="${escapeHTML(item.image)}"
                alt="${escapeHTML(item.title)}"
                width="100"
              >

              <div>
                <h3>${escapeHTML(item.title)}</h3>
                <p>${formatPrice(item.price)}</p>
              </div>
            </div>

            <div class="fs-cart-quantity">

              <button
                type="button"
                data-cart-decrease="${escapeHTML(item.id)}"
                aria-label="Decrease quantity"
              >−</button>

              <span>${Number(item.quantity) || 1}</span>

              <button
                type="button"
                data-cart-increase="${escapeHTML(item.id)}"
                aria-label="Increase quantity"
              >+</button>

            </div>

            <div class="fs-cart-subtotal">
              ${formatPrice(Number(item.price) * Number(item.quantity))}
            </div>

            <button
              type="button"
              data-cart-remove="${escapeHTML(item.id)}"
            >
              Remove
            </button>

          </div>
        `,
          )
          .join("")}

      </div>

      <div class="fs-cart-summary">
        <h3>Cart Total</h3>
        <p>${formatPrice(getCartTotal())}</p>

        <a href="/checkout.html" class="primary-button">
          Proceed to Checkout
        </a>
      </div>
    `;
  }

  /* =======================================================
     8. WISHLIST
     ======================================================= */

  function isInWishlist(id) {
    return wishlist.some((item) => item.id === id);
  }

  function toggleWishlist(product) {
    if (!product || !product.title) return;

    if (isInWishlist(product.id)) {
      wishlist = wishlist.filter((item) => item.id !== product.id);

      showToast("Removed from Wishlist");
    } else {
      wishlist.push(product);
      showToast("Added to Wishlist");
    }

    saveWishlist();
    updateWishlistUI();
  }

  function updateWishlistUI() {
    $$(".wish-share a, .hoverable a").forEach((link) => {
      const icon = $("i.ri-heart-line, i.ri-heart-fill", link);

      if (!icon) return;

      const card = link.closest(".item");

      const product = card ? getProductFromCard(card) : getProductFromPage();

      if (!product) return;

      const saved = isInWishlist(product.id);

      icon.classList.toggle("ri-heart-fill", saved);
      icon.classList.toggle("ri-heart-line", !saved);

      link.setAttribute(
        "aria-label",
        saved ? "Remove from Wishlist" : "Add to Wishlist",
      );
    });

    $$(".wishlist-count, .wishlist-number").forEach((element) => {
      element.textContent = wishlist.length;
    });
  }

  /* =======================================================
     9. SHARE PRODUCT
     ======================================================= */

  async function shareProduct(product) {
    if (!product) return;

    const shareData = {
      title: product.title,
      text: `Check out ${product.title}`,
      url: product.url || location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareData.url);
        showToast("Product link copied!");
      } else {
        showToast("Sharing is not supported in this browser.");
      }
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Share error:", error);
      }
    }
  }

  /* =======================================================
     10. MOBILE QUANTITY CONTROL
     ======================================================= */

  document.addEventListener("click", (event) => {
    const minus = event.target.closest(".qty-control .minus");

    const plus = event.target.closest(".qty-control .plus");

    if (!minus && !plus) return;

    const control = event.target.closest(".qty-control");
    const input = $("input", control);

    if (!input) return;

    const current = Math.max(1, parseInt(input.value, 10) || 1);

    input.value = minus ? Math.max(1, current - 1) : current + 1;

    input.dispatchEvent(new Event("change", { bubbles: true }));
  });

  /* =======================================================
     11. ADD TO CART / WISHLIST / CART EVENTS
     ======================================================= */

  document.addEventListener("click", (event) => {
    // Add to Cart
    const addButton = event.target.closest(
      [
        "[data-add-to-cart]",
        ".add-to-cart",
        ".button-cart .primary-button",
        ".button-cart button",
        ".button-cart a",
      ].join(","),
    );

    if (addButton) {
      event.preventDefault();

      const card = addButton.closest(".item");

      const product = card ? getProductFromCard(card) : getProductFromPage();

      const quantityInput = $(
        ".qty-control input, input[name='quantity'], input[type='number']",
      );

      const quantity = Math.max(1, parseInt(quantityInput?.value, 10) || 1);

      addToCart(product, quantity);
      return;
    }

    // Wishlist
    const wishlistLink = event.target.closest(".wish-share a, .hoverable a");

    if (wishlistLink) {
      const heart = $("i.ri-heart-line, i.ri-heart-fill", wishlistLink);

      if (heart) {
        event.preventDefault();

        const card = wishlistLink.closest(".item");

        const product = card ? getProductFromCard(card) : getProductFromPage();

        toggleWishlist(product);
        return;
      }
    }

    // Share
    const shareLink = event.target.closest(".wish-share a");

    if (shareLink) {
      const icon = $("i.ri-share-line", shareLink);

      if (icon) {
        event.preventDefault();
        shareProduct(getProductFromPage());
        return;
      }
    }

    // Remove cart item
    const removeButton = event.target.closest("[data-cart-remove]");

    if (removeButton) {
      removeFromCart(removeButton.dataset.cartRemove);
      return;
    }

    // Increase cart quantity
    const increaseButton = event.target.closest("[data-cart-increase]");

    if (increaseButton) {
      const id = increaseButton.dataset.cartIncrease;

      const item = cart.find((product) => product.id === id);

      if (item) {
        updateCartQuantity(id, item.quantity + 1);
      }

      return;
    }

    // Decrease cart quantity
    const decreaseButton = event.target.closest("[data-cart-decrease]");

    if (decreaseButton) {
      const id = decreaseButton.dataset.cartDecrease;

      const item = cart.find((product) => product.id === id);

      if (item) {
        if (item.quantity <= 1) {
          removeFromCart(id);
        } else {
          updateCartQuantity(id, item.quantity - 1);
        }
      }
    }
  });

  /* =======================================================
     12. PRODUCT SEARCH
     ======================================================= */

  $$(".search").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const input = $('input[type="search"], input', form);

      const query = input?.value.trim().toLowerCase();

      if (!query) return;

      let found = false;

      $$(".products .item").forEach((card) => {
        const product = getProductFromCard(card);

        const text =
          `${product?.title || ""} ${card.textContent}`.toLowerCase();

        const matches = text.includes(query);

        card.style.display = matches ? "" : "none";

        if (matches) found = true;
      });

      if (!found) {
        showToast("No matching products found.");
      }
    });
  });

  /* =======================================================
     13. MOBILE MENU
     ======================================================= */

  function copyMenu() {
    const source = $(".dpt-cat");
    const destination = $(".departments");

    if (source && destination) {
      destination.innerHTML = source.innerHTML;
    }

    const mainNav = $(".header-nav nav");
    const mobileNav = $(".off-canvas nav");

    if (mainNav && mobileNav) {
      mobileNav.innerHTML = mainNav.innerHTML;
    }

    const topNav = $(".header-top .wrapper");
    const mobileTopNav = $(".off-canvas .thetop-nav");

    if (topNav && mobileTopNav) {
      mobileTopNav.innerHTML = topNav.innerHTML;
    }
  }

  copyMenu();

  const site = $(".site");

  $(".trigger")?.addEventListener("click", () => {
    site?.classList.toggle("showmenu");
  });

  $(".t-close")?.addEventListener("click", () => {
    site?.classList.remove("showmenu");
  });

  // Mobile submenu — includes copied navigation
  document.addEventListener("click", (event) => {
    const submenuButton = event.target.closest(".has-child .icon-small");

    if (!submenuButton) return;

    event.preventDefault();

    const parent = submenuButton.closest(".has-child");

    if (!parent) return;

    const wasExpanded = parent.classList.contains("expand");

    $$(".has-child").forEach((item) => {
      item.classList.remove("expand");
    });

    if (!wasExpanded) {
      parent.classList.add("expand");
    }
  });

  /* =======================================================
     14. SEARCH PANEL
     ======================================================= */

  $(".t-search")?.addEventListener("click", () => {
    site?.classList.toggle("showsearch");
  });

  $(".search-close")?.addEventListener("click", () => {
    site?.classList.remove("showsearch");
  });

  /* =======================================================
     15. DEPARTMENT MENU
     ======================================================= */

  $(".dpt-cat .dpt-trigger")?.addEventListener("click", () => {
    site?.classList.toggle("showdpt");
  });

  /* =======================================================
     16. STOCK BAR
     ======================================================= */

  $$(".products .stock").forEach((stockElement) => {
    const total = Number(stockElement.dataset.stock);

    const soldElement = $(".qty-sold", stockElement);
    const bar = $(".available", stockElement);

    if (!total || !soldElement || !bar) return;

    const sold = getPrice(getText(soldElement));

    const percentage = Math.min(100, Math.max(0, (sold / total) * 100));

    bar.style.width = `${percentage}%`;
  });

  /* =======================================================
     17. SWIPER INITIALIZATION
     ======================================================= */

  function initSwiper() {
    if (typeof Swiper === "undefined") return;

    // Main website sliders
    $$(".myslider.swiper").forEach((element) => {
      if (element.swiper) return;

      const slides = $$(".swiper-slide", element).length;

      new Swiper(element, {
        loop: slides > 1,
        pagination: {
          el: $(".swiper-pagination", element),
          clickable: true,
        },
      });
    });

    // Product thumbnails
    $$(".small-image").forEach((element) => {
      if (element.swiper) return;

      const slides = $$(".swiper-slide", element).length;

      new Swiper(element, {
        loop: false,
        spaceBetween: 10,
        slidesPerView: Math.max(1, Math.min(3, slides)),
        freeMode: true,
        watchSlidesProgress: true,
        breakpoints: {
          481: {
            spaceBetween: 32,
          },
        },
      });
    });

    // Product main image
    $$(".big-image").forEach((element) => {
      if (element.swiper) return;

      new Swiper(element, {
        loop: false,
        autoHeight: true,
        navigation: {
          nextEl: $(".swiper-button-next", element),
          prevEl: $(".swiper-button-prev", element),
        },
      });
    });
  }

  /* =======================================================
     18. COUNTDOWN TIMER
     ======================================================= */

  // Change this date to your actual offer end date.
  const offerEndDate = new Date("2026-12-31T23:59:59");

  function startCountdown() {
    const timer = $("#countdown-timer");

    // Countdown is optional on other pages.
    if (!timer) return;

    const remaining = offerEndDate.getTime() - Date.now();

    if (remaining <= 0) {
      timer.innerHTML = `
        <li>00</li>
        <li>00</li>
        <li>00</li>
        <li>00</li>
      `;

      return;
    }

    const days = Math.floor(remaining / (1000 * 60 * 60 * 24));

    const hours = Math.floor(
      (remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
    );

    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));

    const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

    timer.innerHTML = `
      <li>${String(days).padStart(2, "0")}</li>
      <li>${String(hours).padStart(2, "0")}</li>
      <li>${String(minutes).padStart(2, "0")}</li>
      <li>${String(seconds).padStart(2, "0")}</li>
    `;
  }

  if ($("#countdown-timer")) {
    startCountdown();
    setInterval(startCountdown, 1000);
  }

  /* =======================================================
     19. MINI CART OPEN / CLOSE
     ======================================================= */

  const miniCart = $(".mini-cart");
  const cartTrigger = $(".cart-trigger");

  if (cartTrigger && miniCart) {
    cartTrigger.addEventListener("click", (event) => {
      event.preventDefault();
      miniCart.classList.toggle("show");
    });

    document.addEventListener("click", (event) => {
      const clickedInsideCart = event.target.closest(".mini-cart");

      const clickedTrigger = event.target.closest(".cart-trigger");

      if (
        !clickedInsideCart &&
        !clickedTrigger &&
        miniCart.classList.contains("show")
      ) {
        miniCart.classList.remove("show");
      }
    });
  }

  /* =======================================================
     20. MODAL
     ======================================================= */

  $(".modalclose")?.addEventListener("click", () => {
    site?.classList.remove("showmodal");
  });

  // No automatic modal popup.
  // Enable it separately if your design requires it.

  /* =======================================================
     21. SIGNUP FORM VALIDATION
     ======================================================= */

  const signupForm = $("#signup-form");

  signupForm?.addEventListener("submit", (event) => {
    event.preventDefault();

    const username = $("#username");
    const email = $("#email");
    const password = $("#password");
    const confirmPassword = $("#confirm-password");
    const errorMessage = $("#error-msg");

    const showError = (message) => {
      if (errorMessage) {
        errorMessage.textContent = message;
        errorMessage.style.display = "block";
      } else {
        showToast(message);
      }
    };

    if (!username || !email || !password || !confirmPassword) {
      showError("Required form fields are missing.");
      return;
    }

    if (
      !username.value.trim() ||
      !email.value.trim() ||
      !password.value ||
      !confirmPassword.value
    ) {
      showError("All fields are required.");
      return;
    }

    if (password.value !== confirmPassword.value) {
      showError("Passwords do not match.");
      return;
    }

    showToast("Form validation successful.");

    // Frontend validation only.
    // Actual registration requires an authentication backend.

    signupForm.reset();

    if (errorMessage) {
      errorMessage.style.display = "none";
    }
  });

  /* =======================================================
     22. INITIALIZE APPLICATION
     ======================================================= */

  function initialize() {
    copyMenu();

    updateCartCounters();
    updateWishlistUI();

    renderMiniCart();
    renderCartPage();

    initSwiper();
    startCountdown();

    console.info("Fashion Store Closet initialized.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize, { once: true });
  } else {
    initialize();
  }
})();
