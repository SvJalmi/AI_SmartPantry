// Update cart count in navbar
function updateCartCount() {
    fetch('/get_cart_count')
        .then(response => response.json())
        .then(data => {
            const cartCountElement = document.getElementById('cart-count');
            if (cartCountElement) {
                cartCountElement.textContent = data.count;
                // Show/hide badge based on count
                if (data.count > 0) {
                    cartCountElement.style.display = 'inline';
                } else {
                    cartCountElement.style.display = 'none';
                }
            }
        })
        .catch(error => {
            console.error('Error updating cart count:', error);
        });
}

// Update cart count on page load
document.addEventListener('DOMContentLoaded', function() {
    updateCartCount();
});

// Update cart count after adding items (for AJAX requests)
function refreshCartCount() {
    updateCartCount();
}

// Auto-dismiss alerts after 5 seconds
document.addEventListener('DOMContentLoaded', function() {
    const alerts = document.querySelectorAll('.alert');
    alerts.forEach(function(alert) {
        setTimeout(function() {
            const bsAlert = new bootstrap.Alert(alert);
            bsAlert.close();
        }, 5000);
    });
});
