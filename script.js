// ======================================================
// FASHION STORE CLOSET — FUNCTIONAL FRONTEND
// Design-preserving enhancement
// ======================================================

(() => {
  "use strict";

  const STORAGE = {
    cart: "fashionCloset_cart",
    wishlist: "fashionCloset_wishlist",
  };

  const readStorage = (key, fallback = []) => {
    try {
      return JSON.parse(localStorage.getItem(key)) ?? fallback;
    } catch {
      return fallback;
    }
  };

  const writeStorage = (key, data) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error("Storage error:", error);
    }
  };

  let cart = readStorage(STORAGE.cart);
  let wishlist = readStorage(STORAGE.wishlist);

  const saveCart = () => writeStorage(STORAGE.cart, cart);
  const saveWishlist = () => writeStorage(STORAGE.wishlist, wishlist);

  // ------------------------------------------------------
  // GENERAL HELPERS
  // ------------------------------------------------------

  const getText = (element) => element?.textContent?.trim() || "";

  const getPrice = (text) => {
    const cleaned = String(text || "").replace(/[^0-9.]/g, "");
    return Number(cleaned) || 0;
  };

  const formatPrice = (amount, currency = "$") =>
    `${currency}${Number(amount).toFixed(2)}`;

  const getProductFromPage = () => {
    const titleElement =
      document.querySelector(".product h1") ||
      document.querySelector(".single-product h1") ||
      document.querySelector(".product-info h1") ||
      document.querySelector("main h1") ||
      document.querySelector("h1");

    const imageElement =
      document.querySelector(".big-image img") ||
      document.querySelector(".single-product img") ||
      document.querySelector(".product img") ||
      document.querySelector("main img");

    const priceElement =
      document.querySelector(".price .current") ||
      document.querySelector(".product-price .current") ||
      document.querySelector(".single-product .price");

    const title = getText(titleElement) || document.title;

    const price = getPrice(getText(priceElement));

    const image = imageElement?.src || "";

    const id = location.pathname.split("/").pop() || title;

    return {
      id,
      title,
      price,
      image,
      url: location.href,
    };
  };

  const getProductFromCard = (card) => {
    const titleElement =
      card.querySelector("h3 a") ||
      card.querySelector(".content h3 a") ||
      card.querySelector(".content h4 a") ||
      card.querySelector(".title a");

    const imageElement = card.querySelector("img");

    const priceElement =
      card.querySelector(".price .current") ||
      card.querySelector(".current") ||
      card.querySelector(".price");

    const linkElement = card.querySelector("a[href]");

    const title =
      getText(titleElement) ||
      getText(card.querySelector("h3")) ||
      getText(card.querySelector("h4"));

    const image = imageElement?.src || "";

    const url = linkElement?.href || location.href;

    const price = getPrice(getText(priceElement));

    return {
      id: url.split("/").pop() || title,
      title,
      price,
      image,
      url,
    };
  };

  const getProductCards = () => document.querySelectorAll(".products .item");

  // ------------------------------------------------------
  // CART
  // ------------------------------------------------------

  function addToCart(product, quantity = 1) {
    if (!product.title) return;

    const qty = Math.max(1, Number(quantity) || 1);

    const existing = cart.find((item) => item.id === product.id);

    if (existing) {
      existing.quantity += qty;
    } else {
      cart.push({
        ...product,
        quantity: qty,
      });
    }

    saveCart();
    updateCartCounters();

    showToast(`${product.title} added to cart`);

    renderMiniCart();
  }

  function removeFromCart(id) {
    cart = cart.filter((item) => item.id !== id);

    saveCart();
    updateCartCounters();
    renderMiniCart();
    renderCartPage();
  }

  function updateCartQuantity(id, quantity) {
    const item = cart.find((product) => product.id === id);

    if (!item) return;

    item.quantity = Math.max(1, Number(quantity) || 1);

    saveCart();
    updateCartCounters();
    renderMiniCart();
    renderCartPage();
  }

  function getCartTotal() {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  }

  function updateCartCounters() {
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);

    document
      .querySelectorAll(".cart-count, .cart-quantity, .cart-number")
      .forEach((element) => {
        element.textContent = totalItems;
      });

    document.querySelectorAll(".cart-trigger").forEach((trigger) => {
      trigger.setAttribute(
        "aria-label",
        `Shopping cart with ${totalItems} items`,
      );
    });
  }

  // ------------------------------------------------------
  // MINI CART
  // ------------------------------------------------------

  function renderMiniCart() {
    const miniCart = document.querySelector(".mini-cart");

    if (!miniCart) return;

    let container = miniCart.querySelector(".fs-cart-content");

    if (!container) {
      container = document.createElement("div");
      container.className = "fs-cart-content";
      miniCart.appendChild(container);
    }

    if (!cart.length) {
      container.innerHTML = `
        <div class="fs-empty-cart">
          <p>Your shopping cart is empty.</p>
          <a href="/" class="primary-button">Continue Shopping</a>
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
                × ${item.quantity}
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

  // ------------------------------------------------------
  // CART PAGE
  // ------------------------------------------------------

  function renderCartPage() {
    const page = document.querySelector(".page-cart");

    if (!page) return;

    const container =
      document.querySelector("#cart-items") ||
      document.querySelector(".cart-items") ||
      document.querySelector(".cart-list") ||
      document.querySelector(".cart-content");

    if (!container) return;

    let cartContainer = container.querySelector(".fs-cart-render");

    if (!cartContainer) {
      cartContainer = document.createElement("div");
      cartContainer.className = "fs-cart-render";
      container.appendChild(cartContainer);
    }

    if (!cart.length) {
      cartContainer.innerHTML = `
        <p>Your cart is currently empty.</p>
        <a href="/" class="primary-button">
          Continue Shopping
        </a>
      `;
      return;
    }

    cartContainer.innerHTML = `
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
              >−</button>

              <span>${item.quantity}</span>

              <button
                type="button"
                data-cart-increase="${escapeHTML(item.id)}"
              >+</button>
            </div>

            <div class="fs-cart-subtotal">
              ${formatPrice(item.price * item.quantity)}
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

  // ------------------------------------------------------
  // WISHLIST
  // ------------------------------------------------------

  function isInWishlist(id) {
    return wishlist.some((item) => item.id === id);
  }

  function toggleWishlist(product) {
    if (!product.title) return;

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
    document.querySelectorAll(".wish-share a, .hoverable a").forEach((link) => {
      const icon = link.querySelector("i.ri-heart-line, i.ri-heart-fill");

      if (!icon) return;

      const card = link.closest(".item");

      const product = card ? getProductFromCard(card) : getProductFromPage();

      const saved = isInWishlist(product.id);

      icon.classList.toggle("ri-heart-fill", saved);
      icon.classList.toggle("ri-heart-line", !saved);

      link.setAttribute(
        "aria-label",
        saved ? "Remove from Wishlist" : "Add to Wishlist",
      );
    });

    document
      .querySelectorAll(".wishlist-count, .wishlist-number")
      .forEach((element) => {
        element.textContent = wishlist.length;
      });
  }

  // ------------------------------------------------------
  // SHARE
  // ------------------------------------------------------

  async function shareProduct(product) {
    const shareData = {
      title: product.title,
      text: `Check out ${product.title}`,
      url: product.url || location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareData.url);

        showToast("Product link copied!");
      } else {
        showToast("Sharing is not supported.");
      }
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Share error:", error);
      }
    }
  }

  // ------------------------------------------------------
  // QUANTITY CONTROL
  // ------------------------------------------------------

  document.addEventListener("click", (event) => {
    const minus = event.target.closest(".qty-control .minus");
    const plus = event.target.closest(".qty-control .plus");

    if (!minus && !plus) return;

    const control = event.target.closest(".qty-control");
    const input = control?.querySelector("input");

    if (!input) return;

    const value = Math.max(1, parseInt(input.value, 10) || 1);

    input.value = minus ? Math.max(1, value - 1) : value + 1;
  });

  // ------------------------------------------------------
  // EVENT DELEGATION
  // ------------------------------------------------------

  document.addEventListener("click", (event) => {
    // ADD TO CART — PRODUCT PAGE
    const addButton = event.target.closest(".button-cart .primary-button");

    if (addButton) {
      event.preventDefault();

      const product = getProductFromPage();

      const qtyInput = document.querySelector(".qty-control input");

      const quantity = Math.max(1, parseInt(qtyInput?.value, 10) || 1);

      addToCart(product, quantity);
      return;
    }

    // WISHLIST
    const wishlistLink = event.target.closest(".wish-share a, .hoverable a");

    if (wishlistLink) {
      const heart = wishlistLink.querySelector(
        "i.ri-heart-line, i.ri-heart-fill",
      );

      if (heart) {
        event.preventDefault();

        const card = wishlistLink.closest(".item");

        const product = card ? getProductFromCard(card) : getProductFromPage();

        toggleWishlist(product);
        return;
      }
    }

    // SHARE
    const shareLink = event.target.closest(".wish-share a");

    if (shareLink) {
      const icon = shareLink.querySelector("i.ri-share-line");

      if (icon) {
        event.preventDefault();
        shareProduct(getProductFromPage());
      }
    }

    // REMOVE CART ITEM
    const removeButton = event.target.closest("[data-cart-remove]");

    if (removeButton) {
      removeFromCart(removeButton.dataset.cartRemove);
    }

    // INCREASE CART ITEM
    const increaseButton = event.target.closest("[data-cart-increase]");

    if (increaseButton) {
      const id = increaseButton.dataset.cartIncrease;

      const item = cart.find((product) => product.id === id);

      if (item) {
        updateCartQuantity(id, item.quantity + 1);
      }
    }

    // DECREASE CART ITEM
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

  // ------------------------------------------------------
  // PRODUCT SEARCH
  // ------------------------------------------------------

  document.querySelectorAll(".search").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const input = form.querySelector('input[type="search"], input');

      const query = input?.value.trim().toLowerCase();

      if (!query) return;

      let found = false;

      getProductCards().forEach((card) => {
        const product = getProductFromCard(card);

        const searchableText =
          `${product.title} ${card.textContent}`.toLowerCase();

        const matches = searchableText.includes(query);

        card.style.display = matches ? "" : "none";

        if (matches) found = true;
      });

      if (!found) {
        showToast("No matching products found");
      }
    });
  });

  // ------------------------------------------------------
  // MOBILE MENU
  // ------------------------------------------------------

  function copyMenu() {
    const source = document.querySelector(".dpt-cat");
    const destination = document.querySelector(".departments");

    if (source && destination) {
      destination.innerHTML = source.innerHTML;
    }

    const nav = document.querySelector(".header-nav nav");
    const mobileNav = document.querySelector(".off-canvas nav");

    if (nav && mobileNav) {
      mobileNav.innerHTML = nav.innerHTML;
    }

    const topNav = document.querySelector(".header-top .wrapper");

    const mobileTopNav = document.querySelector(".off-canvas .thetop-nav");

    if (topNav && mobileTopNav) {
      mobileTopNav.innerHTML = topNav.innerHTML;
    }
  }

  copyMenu();

  const site = document.querySelector(".site");

  document
    .querySelector(".trigger")
    ?.addEventListener("click", () => site?.classList.toggle("showmenu"));

  document
    .querySelector(".t-close")
    ?.addEventListener("click", () => site?.classList.remove("showmenu"));

  // ------------------------------------------------------
  // SEARCH PANEL
  // ------------------------------------------------------

  document
    .querySelector(".t-search")
    ?.addEventListener("click", () => site?.classList.toggle("showsearch"));

  document
    .querySelector(".search-close")
    ?.addEventListener("click", () => site?.classList.remove("showsearch"));

  // ------------------------------------------------------
  // DEPARTMENT MENU
  // ------------------------------------------------------

  document
    .querySelector(".dpt-cat .dpt-trigger")
    ?.addEventListener("click", () => {
      site?.classList.toggle("showdpt");
    });

  // ------------------------------------------------------
  // STOCK BAR
  // ------------------------------------------------------

  document.querySelectorAll(".products .stock").forEach((stockElement) => {
    const total = Number(stockElement.dataset.stock);

    const soldElement = stockElement.querySelector(".qty-sold");

    const bar = stockElement.querySelector(".available");

    if (!total || !soldElement || !bar) return;

    const sold = getPrice(getText(soldElement));

    const percent = Math.min(100, Math.max(0, (sold / total) * 100));

    bar.style.width = `${percent}%`;
  });

  // ------------------------------------------------------
  // SWIPER INITIALIZATION
  // ------------------------------------------------------

  function initSwiper() {
    if (typeof Swiper === "undefined") return;

    document.querySelectorAll(".myslider.swiper").forEach((element) => {
      if (element.swiper) return;

      new Swiper(element, {
        loop: true,
        pagination: {
          el: element.querySelector(".swiper-pagination"),
          clickable: true,
        },
      });
    });

    document.querySelectorAll(".small-image").forEach((element) => {
      if (element.swiper) return;

      new Swiper(element, {
        loop: true,
        spaceBetween: 10,
        slidesPerView: 3,
        freeMode: true,
        watchSlidesProgress: true,
      });
    });

    document.querySelectorAll(".big-image").forEach((element) => {
      if (element.swiper) return;

      new Swiper(element, {
        loop: true,
        autoHeight: true,
        navigation: {
          nextEl: element.querySelector(".swiper-button-next"),
          prevEl: element.querySelector(".swiper-button-prev"),
        },
      });
    });
  }

  // ------------------------------------------------------
  // MODAL — NO AUTOMATIC POPUP
  // ------------------------------------------------------

  document.querySelector(".modalclose")?.addEventListener("click", () => {
    document.querySelector(".site")?.classList.remove("showmodal");
  });

  // ------------------------------------------------------
  // SIGNUP FORM — BASIC FRONTEND VALIDATION
  // ------------------------------------------------------

  const signupForm = document.getElementById("signup-form");

  signupForm?.addEventListener("submit", (event) => {
    event.preventDefault();

    const username = document.getElementById("username");
    const email = document.getElementById("email");
    const password = document.getElementById("password");
    const confirmPassword = document.getElementById("confirm-password");

    const errorMessage = document.getElementById("error-msg");

    if (!username || !email || !password || !confirmPassword) {
      return;
    }

    if (
      !username.value.trim() ||
      !email.value.trim() ||
      !password.value ||
      !confirmPassword.value
    ) {
      showError("All fields are required.", errorMessage);
      return;
    }

    if (password.value !== confirmPassword.value) {
      showError("Passwords do not match.", errorMessage);
      return;
    }

    showToast("Form validation successful.");

    // This is NOT actual account registration.
    // Connect an authentication backend for real registration.

    signupForm.reset();

    if (errorMessage) {
      errorMessage.style.display = "none";
    }
  });

  function showError(message, element) {
    if (!element) {
      showToast(message);
      return;
    }

    element.textContent = message;
    element.style.display = "block";
  }

  // ------------------------------------------------------
  // TOAST MESSAGE
  // ------------------------------------------------------

  function showToast(message) {
    let toast = document.getElementById("fs-toast");

    if (!toast) {
      toast = document.createElement("div");
      toast.id = "fs-toast";

      Object.assign(toast.style, {
        position: "fixed",
        bottom: "24px",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: "99999",
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

  // ------------------------------------------------------
  // SAFE HTML ESCAPE
  // ------------------------------------------------------

  function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, (char) => {
      const entities = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      };

      return entities[char];
    });
  }

  // ------------------------------------------------------
  // INITIALIZE
  // ------------------------------------------------------

  function initialize() {
    updateCartCounters();
    updateWishlistUI();
    renderMiniCart();
    renderCartPage();
    initSwiper();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize, { once: true });
  } else {
    initialize();
  }
})();
