// JavaScript for accessories section

document.addEventListener('DOMContentLoaded', function() {
    // Handle quantity controls
    const quantityControls = document.querySelectorAll('.quantity-controls');

    quantityControls.forEach(control => {
        const minusBtn = control.querySelector('.minus');
        const plusBtn = control.querySelector('.plus');
        const quantitySpan = control.querySelector('.quantity');

        minusBtn.addEventListener('click', function() {
            let quantity = parseInt(quantitySpan.textContent);
            if (quantity > 1) {
                quantitySpan.textContent = quantity - 1;
            }
        });

        plusBtn.addEventListener('click', function() {
            let quantity = parseInt(quantitySpan.textContent);
            quantitySpan.textContent = quantity + 1;
        });
    });

    // Handle add to cart buttons
    const addToCartButtons = document.querySelectorAll('.add-to-cart');

    addToCartButtons.forEach(button => {
        button.addEventListener('click', function() {
            const card = button.closest('.card');
            const title = card.querySelector('.card-title').textContent;
            const price = card.querySelector('.price').textContent;
            const quantity = card.querySelector('.quantity').textContent;

            // For now, just alert. In a real app, this would add to cart
            alert(`Añadido al carrito: ${quantity} x ${title} - ${price}`);
        });
    });
});