document.addEventListener('DOMContentLoaded', () => {
    // ========== Menu Toggle (Mobile Navigation) ==========
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.querySelector('.nav_links');
    const icon = document.querySelector('#hamburger i');

    if (hamburger && navLinks && icon) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('show');
            // Ensure the icon class toggles correctly between menu and close (x)
            icon.classList.toggle('bx-menu');
            icon.classList.toggle('bx-x');
        });
    } else {
        console.error('Error: Hamburger, navLinks, or icon not found!');
    }

    // ========== Cart Functionality ==========
    const cartContainer = document.getElementById('cart-container');
    const totalPriceElement = document.getElementById('total-price');
    const cartCountBadge = document.getElementById('cart-count'); // Optional: Shows cart item count

    // Check if essential DOM elements exist for cart page
    // Make these checks conditional, only run cart logic if elements exist
    const isCartPage = cartContainer && totalPriceElement;

    // ✅ Event delegation for clicks (Add to Cart, Remove, Quantity)
    document.addEventListener('click', (e) => {
        // Add-to-cart handler
        if (e.target.classList.contains('add-to-cart')) {
            const button = e.target;
            const title = button.getAttribute('data-title');
            const price = button.getAttribute('data-price');
            const img = button.getAttribute('data-img');

            if (!title || !price || !img) {
                console.error('⛔ Missing data attributes on this button:', button);
                alert("Error: Missing item data. Please contact support.");
                return;
            }

            console.log('✅ Item Added:', { title, price, img });

            addToCart(title, parseFloat(price), img);
            // Only render/update cart display if on the cart page
            if (isCartPage) {
                renderCart();
            }
            updateCartCount(); // Update badge on any page
            alert(`${title} has been added to your cart!`);
        }

        // Handle remove item clicks (only if on cart page)
        if (isCartPage && e.target.classList.contains('remove-item')) {
            const title = e.target.getAttribute('data-title');
            removeItem(title);
            renderCart();
            updateCartCount();
        }

        // Handle quantity changes (only if on cart page)
        if (isCartPage && (e.target.classList.contains('quantity-up') || e.target.classList.contains('quantity-down'))) {
            // Find the closest cart-item ancestor to get the title
            const cartItemElement = e.target.closest('.cart-item');
            if (cartItemElement) {
                const titleElement = cartItemElement.querySelector('.cart-item-details h3');
                if (titleElement) {
                    const title = titleElement.textContent;
                    const isIncrease = e.target.classList.contains('quantity-up');
                    updateQuantity(title, isIncrease);
                    renderCart();
                    updateCartCount();
                } else {
                     console.error("Could not find title element within cart item for quantity change.");
                }
            } else {
                 console.error("Could not find parent cart item for quantity change button.");
            }
        }
    });

    // ========== Cart Helper Functions ==========
    function addToCart(title, price, img) {
        let cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const existingItemIndex = cart.findIndex(item => item.name === title);

        if (existingItemIndex !== -1) {
            // Increment quantity if item exists
            cart[existingItemIndex].quantity += 1;
        } else {
            // Add new item if it doesn't exist
            cart.push({
                name: title,
                price: price,
                imgSrc: img,
                quantity: 1
            });
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        console.log("Cart updated in localStorage:", cart); // Debug log
    }

    function removeItem(title) {
        let cart = JSON.parse(localStorage.getItem('cart') || '[]');
        cart = cart.filter(item => item.name !== title);
        localStorage.setItem('cart', JSON.stringify(cart));
        console.log("Item removed, cart updated:", cart); // Debug log
    }

    function updateQuantity(title, isIncrease) {
        let cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const itemIndex = cart.findIndex(item => item.name === title);

        if (itemIndex !== -1) {
            if (isIncrease) {
                cart[itemIndex].quantity += 1;
            } else {
                // Decrease quantity, remove if it reaches 0
                if (cart[itemIndex].quantity > 1) {
                    cart[itemIndex].quantity -= 1;
                } else {
                    // Use filter to remove the item instead of calling removeItem to avoid potential infinite loop if removeItem logic changes
                     cart = cart.filter(item => item.name !== title);
                }
            }
            localStorage.setItem('cart', JSON.stringify(cart));
            console.log("Quantity updated, cart updated:", cart); // Debug log
        }
    }

    // Function to render cart items (only runs if cartContainer exists)
    function renderCart() {
        // Ensure this only runs if cartContainer is present
        if (!cartContainer) return;

        const cartString = localStorage.getItem('cart') || '[]'; // Get the raw string
        console.log("Raw cart string from localStorage:", cartString); // Log raw string
        let cart = [];
        try {
             cart = JSON.parse(cartString); // Parse it
             console.log("Parsed cart object:", cart); // Log the parsed object
        } catch (error) {
             console.error("Error parsing cart JSON from localStorage:", error);
             cart = []; // Fallback to empty cart on error
        }

        console.log("Rendering cart with items:", cart); // Existing log
        cartContainer.innerHTML = ''; // Clear previous items

        if (cart.length === 0) {
            cartContainer.innerHTML = "<p>Your cart is empty!</p>";
            if (totalPriceElement) { // Check if totalPriceElement exists before updating
                 totalPriceElement.textContent = "Total: $0.00";
            }
            return;
        }

        cart.forEach(item => {
             // Check if item properties exist before trying to access them
             const name = item.name || 'Unnamed Item';
             const price = typeof item.price === 'number' ? item.price : 0;
             const imgSrc = item.imgSrc || 'path/to/default/image.jpg'; // Provide a default image path
             const quantity = typeof item.quantity === 'number' ? item.quantity : 0;

            const itemElement = document.createElement('div');
            itemElement.classList.add('cart-item');
            // Ensure data-title uses the potentially corrected name
            itemElement.innerHTML = `
                <div class="cart-item-img">
                    <img src="${imgSrc}" alt="${name}" loading="lazy">
                </div>
                <div class="cart-item-details">
                    <h3>${name}</h3>
                    <p class="price">$${price.toFixed(2)}</p>
                    <div class="quantity-control">
                        <button class="quantity-down" data-title="${name}">−</button>
                        <span>${quantity}</span>
                        <button class="quantity-up" data-title="${name}">+</button>
                    </div>
                    <button class="remove-item" data-title="${name}">Remove</button>
                </div>
            `;
            cartContainer.appendChild(itemElement);
        });

        updateTotalPrice(cart);
    }

    // Function to update total price (only runs if totalPriceElement exists)
    function updateTotalPrice(cart) {
         if (!totalPriceElement) return; // Ensure element exists

        const total = cart.reduce((sum, item) => {
             // Ensure price and quantity are numbers before calculation
             const price = typeof item.price === 'number' ? item.price : 0;
             const quantity = typeof item.quantity === 'number' ? item.quantity : 0;
             return sum + (price * quantity);
        }, 0);
        totalPriceElement.textContent = `Total: $${total.toFixed(2)}`;
    }

    // Function to update cart count badge (runs on any page if badge exists)
    function updateCartCount() {
        // Ensure cartCountBadge exists
        if (!cartCountBadge) {
             // console.log("Cart count badge element not found."); // Optional debug log
             return;
        }

        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const totalItems = cart.reduce((sum, item) => {
             // Ensure quantity is a number
             const quantity = typeof item.quantity === 'number' ? item.quantity : 0;
             return sum + quantity;
        }, 0);

        cartCountBadge.textContent = totalItems;
        // Show badge only if items > 0
        cartCountBadge.style.display = totalItems > 0 ? 'inline-block' : 'none'; // Use inline-block or block as appropriate for your CSS
        console.log("Cart count updated:", totalItems); // Debug log
    }

    // Initial setup when the DOM is loaded
    if (isCartPage) {
        renderCart(); // Render cart only if on the cart page
    }
    updateCartCount(); // Update count badge on any page load

    console.log("showcart.js loaded and initialized.");
});