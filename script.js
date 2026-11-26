/* =========================================================
   FASHION STORE CLOSET — Fully Functional Frontend
   Cart • Wishlist • Search • Swiper • Countdown • UI
   ========================================================= */

(() => {
  "use strict";

  // ===== CONFIG & STORAGE =====
  const STORAGE = {
    cart: "fashionCloset_cart",
    wishlist: "fashionCloset_wishlist",
  };

  const readStorage = (key, fallback = []) => {
    try {
      const val = JSON.parse(localStorage.getItem(key));
      return Array.isArray(val) ? val : fallback;
    } catch {
      return fallback;
    }
  };

  const writeStorage = (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error("Storage error:", e);
    }
  };

  let cart = readStorage(STORAGE.cart);
  let wishlist = readStorage(STORAGE.wishlist);
  const saveCart = () => writeStorage(STORAGE.cart, cart);
  const saveWishlist = () => writeStorage(STORAGE.wishlist, wishlist);

  // ===== HELPERS =====
  const $ = (sel, parent = document) => parent.querySelector(sel);
  const $$ = (sel, parent = document) => [...parent.querySelectorAll(sel)];
  const getText = (el) => el?.textContent?.trim() || "";
  const getPrice = (val) =>
    Number(String(val || "").replace(/[^\d.]/g, "")) || 0;
  const escapeHTML = (str) =>
    String(str ?? "").replace(
      /[&<>"']/g,
      (m) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[m],
    );

  // ===== TOAST =====
  function showToast(msg) {
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
        background: "#172033",
        color: "#fff",
        borderRadius: "8px",
        fontSize: "14px",
        maxWidth: "90%",
        textAlign: "center",
        opacity: "0",
        transition: "opacity .25s",
        pointerEvents: "none",
        boxShadow: "0 8px 24px rgba(0,0,0,.2)",
      });
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.style.opacity = "1";
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
      toast.style.opacity = "0";
    }, 2500);
  }

  // ===== PRODUCT INFO (page & card) =====
  function getProductFromPage() {
    const title = getText($("main h1")) || document.title;
    const img = $(
      ".big-image img, .product-image img, main .item .big-image img",
    );
    const priceText = getText($(".price .current, .price"));
    const url = location.href;
    return {
      id: url.split("/").pop() || title,
      title,
      price: getPrice(priceText),
      image: img?.src || "",
      url,
    };
  }

  function getProductFromCard(card) {
    if (!card) return null;
    const titleEl = $("h3 a, .content h3, .content h4, .title", card);
    const imgEl = $("img", card);
    const priceEl = $(".price .current, .current, .price", card);
    const linkEl = $("a[href]", card);
    return {
      id: (linkEl?.href || "").split("/").pop() || getText(titleEl),
      title: getText(titleEl),
      price: getPrice(getText(priceEl)),
      image: imgEl?.src || "",
      url: linkEl?.href || location.href,
    };
  }

  // ===== CART =====
  function addToCart(product, quantity = 1) {
    if (!product?.title) return showToast("Product not found.");
    const qty = Math.max(1, Number(quantity) || 1);
    const existing = cart.find((i) => i.id === product.id);
    if (existing) existing.quantity += qty;
    else cart.push({ ...product, quantity: qty });
    saveCart();
    updateCartUI();
    showToast(`${product.title} added to cart`);
  }

  function removeFromCart(id) {
    cart = cart.filter((i) => i.id !== id);
    saveCart();
    updateCartUI();
    showToast("Removed from cart.");
  }

  function updateCartQuantity(id, qty) {
    const item = cart.find((i) => i.id === id);
    if (!item) return;
    const n = Math.floor(Number(qty));
    if (n <= 0) return removeFromCart(id);
    item.quantity = n;
    saveCart();
    updateCartUI();
  }

  const getCartTotal = () =>
    cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const getCartItemCount = () => cart.reduce((sum, i) => sum + i.quantity, 0);

  function updateCartUI() {
    // Update fly items and cart total
    $$(".cart-trigger, .iscart a, .menu-bottom a[href*='cart']").forEach(
      (el) => {
        const badge = $(".fly-item .item-number, .cart-count", el);
        if (badge) badge.textContent = getCartItemCount();
      },
    );

    const totalEl = $(".cart-total");
    if (totalEl) totalEl.textContent = `$${getCartTotal().toFixed(2)}`;

    renderMiniCart();
    renderCartPage();
  }

  // ===== MINI CART =====
  function renderMiniCart() {
    const mini = $(".mini-cart .cart-body");
    if (!mini) return;

    if (!cart.length) {
      mini.innerHTML = `<p class="fs-empty" style="padding:1em;text-align:center;color:#666">Your cart is empty.</p>`;
      return;
    }

    mini.innerHTML = cart
      .map(
        (item) => `
      <li class="item" data-id="${escapeHTML(item.id)}">
        <div class="thumbnail object-cover">
          <a href="${escapeHTML(item.url)}"><img src="${escapeHTML(item.image)}" alt=""></a>
        </div>
        <div class="item-content">
          <p><a href="${escapeHTML(item.url)}">${escapeHTML(item.title)}</a></p>
          <span class="price">
            <span>$${(item.price * item.quantity).toFixed(2)}</span>
            <span class="fly-item"><span>${item.quantity}x</span></span>
          </span>
        </div>
        <a href="#" class="item-remove" data-remove="${escapeHTML(item.id)}"><i class="ri-close-line"></i></a>
      </li>
    `,
      )
      .join("");

    const subtotal = $(".mini-cart .subtotal p:last-child strong");
    if (subtotal) subtotal.textContent = `$${getCartTotal().toFixed(2)}`;
  }

  // ===== CART PAGE =====
  function renderCartPage() {
    const tbody = $("#cart-table tbody");
    if (!tbody) return;

    if (!cart.length) {
      tbody.innerHTML = `<tr><td colspan="5" style="padding:2em;text-align:center">Your cart is empty. <a href="/index.html">Continue shopping</a></td></tr>`;
      return;
    }

    tbody.innerHTML = cart
      .map(
        (item) => `
      <tr data-id="${escapeHTML(item.id)}">
        <td class="flexitem">
          <div class="thumbnail object-cover">
            <a href="${escapeHTML(item.url)}"><img src="${escapeHTML(item.image)}" alt=""></a>
          </div>
          <div class="content">
            <strong><a href="${escapeHTML(item.url)}">${escapeHTML(item.title)}</a></strong>
          </div>
        </td>
        <td>$${item.price.toFixed(2)}</td>
        <td>
          <div class="qty-control flexitem">
            <button class="minus" data-dec="${escapeHTML(item.id)}">-</button>
            <input type="text" value="${item.quantity}" readonly>
            <button class="plus" data-inc="${escapeHTML(item.id)}">+</button>
          </div>
        </td>
        <td>$${(item.price * item.quantity).toFixed(2)}</td>
        <td><a href="#" class="item-remove" data-remove="${escapeHTML(item.id)}"><i class="ri-close-line"></i></a></td>
      </tr>
    `,
      )
      .join("");

    // Update summary totals
    const subtotalEl = document.querySelector(
      ".cart-summary .subtotal p:last-child strong, .cart-total td:first-of-type + td",
    );
    if (subtotalEl) subtotalEl.textContent = `$${getCartTotal().toFixed(2)}`;
  }

  // ===== WISHLIST =====
  const isInWishlist = (id) => wishlist.some((i) => i.id === id);

  function toggleWishlist(product) {
    if (!product?.title) return;
    if (isInWishlist(product.id)) {
      wishlist = wishlist.filter((i) => i.id !== product.id);
      showToast("Removed from wishlist");
    } else {
      wishlist.push(product);
      showToast("Added to wishlist");
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
    });
  }

  // ===== INIT SWIPER =====
  function initSwiper() {
    if (typeof Swiper === "undefined") return;

    // Main hero slider
    $$(".myslider.swiper").forEach((el) => {
      if (el.swiper) return;
      new Swiper(el, {
        loop: true,
        pagination: { el: $(".swiper-pagination", el), clickable: true },
        autoplay: { delay: 5000, disableOnInteraction: false },
      });
    });

    // Product thumbnails
    $$(".small-image").forEach((el) => {
      if (el.swiper) return;
      new Swiper(el, {
        loop: false,
        spaceBetween: 10,
        slidesPerView: 3,
        freeMode: true,
        watchSlidesProgress: true,
        breakpoints: { 481: { spaceBetween: 32 } },
      });
    });

    // Product big image
    $$(".big-image").forEach((el) => {
      if (el.swiper) return;
      const thumb = $(".small-image", el.closest(".flexwrap"))?.swiper;
      new Swiper(el, {
        loop: false,
        autoHeight: true,
        navigation: {
          nextEl: $(".swiper-button-next", el),
          prevEl: $(".swiper-button-prev", el),
        },
        thumbs: thumb ? { swiper: thumb } : undefined,
      });
    });
  }

  // ===== COUNTDOWN =====
  const offerEndDate = new Date("2026-12-31T23:59:59");
  function startCountdown() {
    const timer = $("#countdown-timer");
    if (!timer) return;
    const remaining = offerEndDate - Date.now();
    if (remaining <= 0) {
      timer.innerHTML = `<li>00</li><li>00</li><li>00</li><li>00</li>`;
      return;
    }
    const d = Math.floor(remaining / 864e5);
    const h = Math.floor((remaining % 864e5) / 36e5);
    const m = Math.floor((remaining % 36e5) / 6e4);
    const s = Math.floor((remaining % 6e4) / 1000);
    timer.innerHTML = [d, h, m, s]
      .map((n) => `<li>${String(n).padStart(2, "0")}</li>`)
      .join("");
  }

  // ===== STOCK BAR =====
  function initStockBars() {
    $$(".products .stock").forEach((el) => {
      const total = Number(el.dataset.stock);
      const soldEl = $(".qty-sold", el);
      const bar = $(".available", el);
      if (!total || !soldEl || !bar) return;
      const sold = getPrice(getText(soldEl));
      bar.style.width = `${Math.min(100, (sold / total) * 100)}%`;
    });
  }

  // ===== MOBILE MENU =====
  function copyMenu() {
    const dpt = $(".dpt-cat");
    const dptPlace = $(".departments");
    if (dpt && dptPlace) dptPlace.innerHTML = dpt.innerHTML;

    const nav = $(".header-nav nav");
    const navPlace = $(".off-canvas nav");
    if (nav && navPlace) navPlace.innerHTML = nav.innerHTML;

    const top = $(".header-top .wrapper");
    const topPlace = $(".off-canvas .thetop-nav");
    if (top && topPlace) topPlace.innerHTML = top.innerHTML;
  }

  document.addEventListener("click", (e) => {
    // Mobile menu trigger
    if (e.target.closest(".trigger")) {
      e.preventDefault();
      $(".site")?.classList.toggle("showmenu");
    }
    if (e.target.closest(".t-close")) {
      $(".site")?.classList.remove("showmenu");
    }

    // Submenu toggle (mobile)
    const submenuBtn = e.target.closest(".has-child .icon-small");
    if (submenuBtn) {
      e.preventDefault();
      const parent = submenuBtn.closest(".has-child");
      const wasOpen = parent.classList.contains("expand");
      $$(".has-child.expand").forEach((el) => el.classList.remove("expand"));
      if (!wasOpen) parent.classList.add("expand");
    }

    // Search toggle
    if (e.target.closest(".t-search")) {
      e.preventDefault();
      $(".site")?.classList.add("showsearch");
    }
    if (e.target.closest(".search-close")) {
      e.preventDefault();
      $(".site")?.classList.remove("showsearch");
    }

    // Department menu toggle
    if (e.target.closest(".dpt-trigger")) {
      e.preventDefault();
      $(".site")?.classList.toggle("showdpt");
    }
  });

  // ===== ADD TO CART / WISHLIST / REMOVE (Event Delegation) =====
  document.addEventListener("click", (e) => {
    // Add to cart (button or product page)
    const addBtn = e.target.closest(
      ".button-cart button, .add-to-cart, [data-add-to-cart]",
    );
    if (addBtn) {
      e.preventDefault();
      const card = addBtn.closest(".item");
      const product = card ? getProductFromCard(card) : getProductFromPage();
      const qtyInput = $(
        ".qty-control input",
        addBtn.closest(".products") || document,
      );
      const qty = Math.max(1, parseInt(qtyInput?.value, 10) || 1);
      addToCart(product, qty);
      return;
    }

    // Wishlist toggle
    const wishBtn = e.target.closest(
      ".hoverable a .ri-heart-line, .hoverable a .ri-heart-fill, .wish-share a .ri-heart-line, .wish-share a .ri-heart-fill",
    );
    if (wishBtn) {
      e.preventDefault();
      const link = wishBtn.closest("a");
      const card = link.closest(".item");
      const product = card ? getProductFromCard(card) : getProductFromPage();
      toggleWishlist(product);
      return;
    }

    // Remove from cart
    const removeBtn = e.target.closest("[data-remove]");
    if (removeBtn) {
      e.preventDefault();
      removeFromCart(removeBtn.dataset.remove);
      return;
    }

    // Quantity increase (cart page)
    const incBtn = e.target.closest("[data-inc]");
    if (incBtn) {
      e.preventDefault();
      const item = cart.find((i) => i.id === incBtn.dataset.inc);
      if (item) updateCartQuantity(item.id, item.quantity + 1);
      return;
    }

    // Quantity decrease
    const decBtn = e.target.closest("[data-dec]");
    if (decBtn) {
      e.preventDefault();
      const item = cart.find((i) => i.id === decBtn.dataset.dec);
      if (item) {
        if (item.quantity <= 1) removeFromCart(item.id);
        else updateCartQuantity(item.id, item.quantity - 1);
      }
      return;
    }

    // Quantity control (product page)
    const qtyMinus = e.target.closest(".qty-control .minus");
    const qtyPlus = e.target.closest(".qty-control .plus");
    if (qtyMinus || qtyPlus) {
      e.preventDefault();
      const input = $("input", (qtyMinus || qtyPlus).closest(".qty-control"));
      if (input) {
        const current = parseInt(input.value, 10) || 1;
        input.value = qtyMinus ? Math.max(1, current - 1) : current + 1;
      }
    }

    // Mini cart open/close
    if (e.target.closest(".cart-trigger")) {
      e.preventDefault();
      $(".mini-cart")?.classList.toggle("show");
    }
    if (!e.target.closest(".mini-cart") && !e.target.closest(".cart-trigger")) {
      $(".mini-cart")?.classList.remove("show");
    }
  });

  // ===== SEARCH =====
  $$(".search").forEach((form) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const query = $("input", form)?.value.trim().toLowerCase();
      if (!query) return;

      let found = false;
      $$(".products .item, .trending .item").forEach((card) => {
        const title = getText($("h3, h4", card)).toLowerCase();
        const match = title.includes(query);
        card.style.display = match ? "" : "none";
        if (match) found = true;
      });

      if (!found) showToast("No matching products found.");
    });
  });

  // ===== MODAL =====
  if (window.location.pathname.includes("index")) {
    // Optionally show modal on first visit only
    if (!sessionStorage.getItem("modalShown")) {
      setTimeout(() => {
        $(".sites, .site")?.classList.add("showmodal");
        sessionStorage.setItem("modalShown", "1");
      }, 3000);
    }
    $(".modalclose")?.addEventListener("click", (e) => {
      e.preventDefault();
      $(".sites, .site")?.classList.remove("showmodal");
    });
  }

  // ===== SIGNUP FORM =====
  const signupForm = $("#signup-form");
  signupForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const fields = {
      username: $("#username")?.value.trim(),
      email: $("#email")?.value.trim(),
      password: $("#password")?.value,
      confirm: $("#confirm-password")?.value,
    };
    const errorEl = $("#error-msg");
    const showError = (msg) => {
      if (errorEl) {
        errorEl.textContent = msg;
        errorEl.style.display = "block";
      } else showToast(msg);
    };

    if (Object.values(fields).some((v) => !v))
      return showError("All fields are required.");
    if (fields.password !== fields.confirm)
      return showError("Passwords do not match.");

    showToast("Account created successfully!");
    signupForm.reset();
    if (errorEl) errorEl.style.display = "none";
  });

  // ===== INIT =====
  function init() {
    copyMenu();
    updateCartUI();
    updateWishlistUI();
    initSwiper();
    startCountdown();
    initStockBars();
    setInterval(startCountdown, 1000);
    console.info("FashionStoreCloset ready ✅");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
