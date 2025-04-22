document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Loaded");

    // Select all "Buy Now" buttons
    const buttons = document.querySelectorAll('.buy-button');
    console.log(buttons); // Log the buttons to check if they are correctly selected

    // Add event listeners for each button
    buttons.forEach(button => {
        button.addEventListener('click', function () {
            const productCard = button.closest('.product');
            const name = productCard.querySelector('h3').innerText;
            const price = productCard.querySelector('.price').innerText;
            const description = productCard.querySelector('.description')?.innerText || '';
            const imgSrc = productCard.querySelector('img').src;

            // Get the current cart from localStorage or initialize an empty array
            let cart = JSON.parse(localStorage.getItem('cart')) || [];

            // Check if the item is already in the cart, and update the quantity if it is
            const existingIndex = cart.findIndex(item => item.name === name);
            if (existingIndex > -1) {
                cart[existingIndex].quantity += 1;
            } else {
                // Add the new item to the cart
                cart.push({ name, price, description, imgSrc, quantity: 1 });
            }

            // Save the updated cart to localStorage
            localStorage.setItem('cart', JSON.stringify(cart));

            // Notify the user that the item was added to the cart
            alert(`${name} added to cart!`);
        });
    });
});
function toggleMenu() {
    const navLinks = document.querySelector('.nav_links');
    const icon = document.querySelector('#hamburger i');

    navLinks.classList.toggle('show');

    if (navLinks.classList.contains('show')) {
        icon.className = 'bx bx-x'; // cross icon
    } else {
        icon.className = 'bx bx-menu'; // menu icon
    }
}
$(document).ready(function(){
    $(".dropdown").hover(function(){
        $(this).find(".dropdown-content").stop(true, true).slideDown(200);
    }, function(){
        $(this).find(".dropdown-content").stop(true, true).slideUp(200);
    });
});