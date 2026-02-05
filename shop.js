let cart = JSON.parse(localStorage.getItem("cart")) || [];

async function fetchProducts() {
  const productContainer = document.getElementById("productGrid");
  if (!productContainer) return;

  try {
    const response = await fetch('https://fakestoreapi.com/products/?limit=9'); // Limit to 8 items
    const products = await response.json();
    console.log("Fetched Products:", products);

    productContainer.innerHTML = "";
    
    products.forEach(product => {
      // Map API data to your luxury design
      productContainer.innerHTML += `
        <div class="product">
          <img src="${product.image}" alt="${product.title}">
          <div class="product-content">
            <h3>${product.title}</h3>
            <p>${product.description.substring(0, 100)}...</p>
            <div class="product-foot">
              <div class="price">$${product.price}</div>
              <button type="button" onclick="addToCart('${product.title.replace(/'/g, "\\'")}', ${product.price}, this)">
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      `;
    });
  } catch (error) {
    productContainer.innerHTML = "<p>Failed to load products. Please try again later.</p>";
    console.error("API Error:", error);
  }
}

function addToCart(name, price, buttonElement) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  const existingItem = cart.find(item => item.name === name);
  
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ name, price, quantity: 1 });
  }
  
  saveAndUpdate();

  if (buttonElement) {
    const originalText = buttonElement.innerText;
    buttonElement.innerText = "Added! ✓";
    buttonElement.style.background = "#28a745";
    buttonElement.style.color = "#fff";

    setTimeout(() => {
      buttonElement.innerText = originalText;
      buttonElement.style.background = "transparent";
      buttonElement.style.color = "var(--gold)";
    }, 1000);
  }
}

function updateCartCount() {
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const badge = document.getElementById("cartBadge");
  
  if (badge) {
    badge.innerText = count;
    badge.style.display = count > 0 ? "block" : "none";
  }
}

function updateQuantity(name, delta) {
  const item = cart.find(i => i.name === name);
  if (item) {
    item.quantity += delta;
    if (item.quantity <= 0) {
      cart = cart.filter(i => i.name !== name);
    }
  }
  saveAndUpdate();
  renderCart();
}

function saveAndUpdate() {
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
} 

function goToCheckout() {
  if (cart.length === 0) {
    alert("Your cart is empty!");
    return;
  }

  window.location.href = "checkout.html";
}

function goBackToShop() {
  document.getElementById("checkoutPage").classList.remove("active");
  document.getElementById("shopPage").classList.add("active");
}
if (document.getElementById("orderForm")) {
  renderCheckout();

  document.getElementById("orderForm").addEventListener("submit", function(e) {
    e.preventDefault();
    const btn = document.getElementById("payBtn");
    btn.innerText = "Processing...";
    btn.disabled = true;

    setTimeout(() => {
      localStorage.removeItem("cart");
      document.getElementById("checkoutState").style.display = "none";
      document.getElementById("successState").style.display = "block";
    }, 2000);
  });
}

function renderCheckout() {
  const container = document.getElementById("cartItemsList");
  const subtotalEl = document.getElementById("subtotalPrice");
  const totalEl = document.getElementById("totalPrice");
  
  if (!container) return; 

  if (cart.length === 0) {
    container.innerHTML = "<p>Your cart is empty.</p>";
    subtotalEl.innerText = "$0";
    totalEl.innerText = "$0";
    return;
  }

  container.innerHTML = "";
  let total = 0;

  cart.forEach((item, index) => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;
    
    container.innerHTML += `
      <div class="cart-item" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; border-bottom: 1px solid #eee; padding-bottom: 10px;">
        <div style="flex: 1;">
          <strong style="display:block;">${item.name}</strong>
          <small style="color: #666;">$${item.price} each</small>
        </div>
        
        <div style="display: flex; align-items: center; gap: 10px; margin: 0 15px;">
          <button type="button" onclick="updateCheckoutQuantity(${index}, -1)" style="width:25px; height:25px; border-radius:50%; border:1px solid #ddd; cursor:pointer;">-</button>
          <span style="font-weight: 600; min-width: 20px; text-align: center;">${item.quantity}</span>
          <button type="button" onclick="updateCheckoutQuantity(${index}, 1)" style="width:25px; height:25px; border-radius:50%; border:1px solid #ddd; cursor:pointer;">+</button>
        </div>

        <div style="text-align: right;">
          <div style="font-weight: 600;">$${itemTotal}</div>
          <button type="button" onclick="removeFromCart(${index})" style="background:none; border:none; color: #ff4d4d; cursor:pointer; font-size: 12px; padding: 0;">Remove</button>
        </div>
      </div>
    `;
  });

  subtotalEl.innerText = `$${total}`;
  totalEl.innerText = `$${total}`;
}

function updateCheckoutQuantity(index, delta) {
  cart[index].quantity += delta;
  
  if (cart[index].quantity <= 0) {
    removeFromCart(index);
  } else {
    saveAndUpdate();
    renderCheckout();
  }
}

function removeFromCart(index) {
  cart.splice(index, 1);
  saveAndUpdate();
  renderCheckout();
}

function processCheckout(e) {
  e.preventDefault();
  const btn = e.target.querySelector('button');
  btn.innerText = "Processing...";
  btn.disabled = true;

  // Simulate Network Delay
  setTimeout(() => {
    document.getElementById("checkoutPage").classList.remove("active");
    document.getElementById("successPage").classList.add("active");
    localStorage.removeItem("cart");
    cart = [];
    updateCartCount();
  }, 2000);
}

document.addEventListener("DOMContentLoaded", () => {
  fetchProducts();
  updateCartCount();
})