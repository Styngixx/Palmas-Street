// JavaScript for accessories section

document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('accessorySearch');
    const searchButton = document.getElementById('searchButton');
    const noResultsMessage = document.getElementById('noResultsMessage');
    const cards = document.querySelectorAll('.cartas-grid .card');

    function filterCards() {
        const query = searchInput.value.trim().toLowerCase();
        let matchCount = 0;

        cards.forEach(card => {
            const title = card.querySelector('.card-title')?.textContent.toLowerCase() || '';
            const brand = card.querySelector('.brand')?.textContent.toLowerCase() || '';
            const description = card.querySelector('.card-text')?.textContent.toLowerCase() || '';
            const price = card.querySelector('.price')?.textContent.toLowerCase() || '';
            const searchText = `${title} ${brand} ${description} ${price}`;
            const isVisible = query === '' || searchText.includes(query);

            card.style.display = isVisible ? '' : 'none';
            if (isVisible) {
                matchCount++;
            }
        });

        if (noResultsMessage) {
            noResultsMessage.style.display = matchCount === 0 ? 'block' : 'none';
        }
    }

    const searchForm = document.getElementById('searchForm');

    if (searchForm) {
        searchForm.addEventListener('submit', function(event) {
            event.preventDefault();
            filterCards();
        });
    }

    if (searchButton) {
        searchButton.addEventListener('click', function(event) {
            event.preventDefault();
            filterCards();
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', filterCards);
    }

    // Run once at start
    filterCards();

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

            alert(`Añadido al carrito: ${quantity} x ${title} - ${price}`);
        });
    });
});


