// Pantry Dashboard JavaScript

let cameraStream = null;

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    setupStorageTagFilters();
    updateAllergenCount();
    
    // Load allergen items with delay to ensure page is ready
    setTimeout(function() {
        loadAllergenItems();
    }, 500);
    
    // Auto-load latest order on page load
    const orderSelect = document.getElementById('orderSelect');
    if (orderSelect && orderSelect.value) {
        loadOrderItems();
    }
    
    // Add event listener for allergen dropdown
    const allergenSelect = document.getElementById('allergenSelect');
    if (allergenSelect) {
        allergenSelect.addEventListener('change', function() {
            const customDiv = document.getElementById('customAllergenDiv');
            if (this.value === 'other') {
                customDiv.style.display = 'block';
                document.getElementById('customAllergenInput').focus();
            } else {
                customDiv.style.display = 'none';
            }
        });
    }
});

// Search functionality
document.getElementById('searchBtn').addEventListener('click', function() {
    const searchTerm = document.getElementById('searchInput').value;
    if (searchTerm) {
        searchPantryItems(searchTerm);
    }
});

// Barcode scanning
document.getElementById('scanBtn').addEventListener('click', function() {
    openCamera();
});

// Storage tag filtering
function setupStorageTagFilters() {
    const tagButtons = document.querySelectorAll('.storage-tag');
    tagButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tag = this.getAttribute('data-tag');
            filterByStorageTag(tag);
            
            // Update button states
            tagButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

function filterByStorageTag(tag) {
    const orderSelect = document.getElementById('orderSelect');
    const orderId = orderSelect ? orderSelect.value : '';
    
    if (!orderId) {
        // If no order selected, filter pantry items
        fetch(`/pantry/filter_by_tag?tag=${tag}`)
            .then(response => response.json())
            .then(data => {
                displayStorageItems(data.items);
            })
            .catch(error => console.error('Error filtering items:', error));
    } else {
        // Filter order items by storage tag
        fetch(`/pantry/order_items?order_id=${orderId}&storage_tag=${tag}`)
            .then(response => response.json())
            .then(data => {
                displayOrderItems(data.items);
            })
            .catch(error => console.error('Error filtering order items:', error));
    }
}

function displayStorageItems(items) {
    const container = document.getElementById('storageItems');
    if (items.length === 0) {
        container.innerHTML = '<p class="text-muted">No items found for this storage tag.</p>';
        return;
    }
    
    let html = '<div class="row">';
    items.forEach(item => {
        html += `
            <div class="col-md-6 mb-2">
                <div class="card card-body">
                    <div class="d-flex justify-content-between">
                        <div>
                            <strong>${item.product_name}</strong><br>
                            <small class="text-muted">Qty: ${item.quantity} ${item.unit}</small>
                        </div>
                        <div class="text-end">
                            <small class="text-muted">${item.expiry_date}</small>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    html += '</div>';
    container.innerHTML = html;
}

// Camera functions
function openCamera() {
    const modal = new bootstrap.Modal(document.getElementById('cameraModal'));
    modal.show();
    
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then(stream => {
            cameraStream = stream;
            const video = document.getElementById('cameraVideo');
            video.srcObject = stream;
        })
        .catch(error => {
            console.error('Error accessing camera:', error);
            alert('Cannot access camera. Please ensure camera permissions are granted.');
        });
}

function captureBarcode() {
    const video = document.getElementById('cameraVideo');
    const canvas = document.getElementById('cameraCanvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);
    
    // In a real implementation, you would use a barcode scanning library here
    // For demonstration, we'll simulate a barcode scan
    const simulatedBarcode = '1234567890123';
    
    stopCamera();
    bootstrap.Modal.getInstance(document.getElementById('cameraModal')).hide();
    
    // Show add item modal with barcode
    showAddItemModal(simulatedBarcode);
}

function stopCamera() {
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        cameraStream = null;
    }
}

function showAddItemModal(barcode = '') {
    const modal = new bootstrap.Modal(document.getElementById('addItemModal'));
    modal.show();
    
    if (barcode) {
        // In a real implementation, you would lookup product info by barcode
        document.getElementById('itemName').value = `Product (${barcode})`;
    }
}

// Add item form submission
document.getElementById('addItemForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const itemData = {
        product_name: document.getElementById('itemName').value,
        category: document.getElementById('itemCategory').value,
        storage_tags: document.getElementById('itemTags').value,
        expiry_date: document.getElementById('itemExpiry').value,
        quantity: document.getElementById('itemQuantity').value
    };
    
    fetch('/pantry/add_item', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(itemData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            bootstrap.Modal.getInstance(document.getElementById('addItemModal')).hide();
            location.reload(); // Refresh to show new item
        } else {
            alert('Error adding item to pantry');
        }
    })
    .catch(error => {
        console.error('Error adding item:', error);
        alert('Error adding item to pantry');
    });
});

// Allergen management
function addAllergenFromSelect() {
    const allergenSelect = document.getElementById('allergenSelect');
    const selectedValue = allergenSelect.value;
    
    if (selectedValue === 'other') {
        // Show custom input field
        document.getElementById('customAllergenDiv').style.display = 'block';
        document.getElementById('customAllergenInput').focus();
        return;
    }
    
    if (selectedValue) {
        addAllergenToDatabase(selectedValue);
    } else {
        alert('Please select an allergen');
    }
}

function addCustomAllergen() {
    const customInput = document.getElementById('customAllergenInput');
    const allergen = customInput.value.trim();
    
    if (allergen) {
        addAllergenToDatabase(allergen);
    } else {
        alert('Please enter a custom allergen');
    }
}

function addAllergenToDatabase(allergen) {
    fetch('/pantry/add_allergen', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ allergen: allergen })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Reset form
            document.getElementById('allergenSelect').value = '';
            document.getElementById('customAllergenInput').value = '';
            document.getElementById('customAllergenDiv').style.display = 'none';
            location.reload();
        } else {
            alert('Error adding allergen');
        }
    })
    .catch(error => {
        console.error('Error adding allergen:', error);
        alert('Error adding allergen');
    });
}

// Legacy function for backward compatibility
function addAllergen() {
    addAllergenFromSelect();
}

function removeAllergen(allergen) {
    if (confirm(`Remove ${allergen} from your allergens?`)) {
        fetch('/pantry/remove_allergen', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ allergen: allergen })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                location.reload();
            } else {
                alert('Error removing allergen');
            }
        })
        .catch(error => {
            console.error('Error removing allergen:', error);
            alert('Error removing allergen');
        });
    }
}

function loadAllergenItems() {
    console.log('loadAllergenItems called');
    const container = document.getElementById('allergenItems');
    
    if (!container) {
        console.error('allergenItems container not found');
        return;
    }
    
    fetch('/pantry/allergen_items')
        .then(response => {
            console.log('Response status:', response.status);
            return response.json();
        })
        .then(data => {
            console.log('Allergen data received:', data);
            
            if (!data.items || data.items.length === 0) {
                container.innerHTML = '<p class="text-muted">No items with allergens found.</p>';
                console.log('No allergen items found');
                return;
            }
            
            let html = '';
            data.items.forEach(item => {
                const allergenInfo = item.matched_allergens || item.allergens || 'Unknown';
                html += `
                    <div class="alert alert-warning mb-2">
                        <strong>${item.product_name}</strong><br>
                        <small>Contains: ${allergenInfo}</small>
                    </div>
                `;
            });
            
            container.innerHTML = html;
            console.log('Allergen items displayed:', data.items.length);
        })
        .catch(error => {
            console.error('Error loading allergen items:', error);
            container.innerHTML = `
                <div class="alert alert-danger">
                    <p class="mb-2">Error loading allergen items.</p>
                    <button class="btn btn-sm btn-outline-danger" onclick="loadAllergenItems()">Try Again</button>
                </div>
            `;
        });
}

// Use cases and disposal options
function showUseCases(productName) {
    const useCases = {
        'Organic Apples': ['Make apple sauce', 'Bake apple pie', 'Add to salad', 'Make apple chips'],
        'Fresh Bananas': ['Make banana bread', 'Smoothie ingredient', 'Freeze for later', 'Make banana chips'],
        'Whole Milk': ['Make cheese', 'Bake with it', 'Make yogurt', 'Coffee creamer'],
        'default': ['Use in cooking', 'Share with neighbors', 'Food bank donation', 'Compost if organic']
    };
    
    const cases = useCases[productName] || useCases['default'];
    const casesList = cases.map(useCase => `<li>${useCase}</li>`).join('');
    
    const modalHtml = `
        <div class="modal fade" id="useCasesModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Use Cases for ${productName}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <ul>${casesList}</ul>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    const modal = new bootstrap.Modal(document.getElementById('useCasesModal'));
    modal.show();
}

function showDisposalOptions(productName) {
    const disposalOptions = {
        'organic': ['Compost', 'Food bank donation', 'Animal feed', 'Sell at discount'],
        'electronics': ['Recycle at center', 'Donate to charity', 'Sell online', 'Manufacturer takeback'],
        'default': ['Standard waste', 'Recycle if possible', 'Donate if usable', 'Proper disposal']
    };
    
    const options = disposalOptions['default']; // Can be enhanced based on category
    const optionsList = options.map(option => `<li>${option}</li>`).join('');
    
    const modalHtml = `
        <div class="modal fade" id="disposalModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Disposal Options for ${productName}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <ul>${optionsList}</ul>
                        <div class="alert alert-info mt-3">
                            <strong>Environmental Impact:</strong> Please consider eco-friendly disposal methods.
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    const modal = new bootstrap.Modal(document.getElementById('disposalModal'));
    modal.show();
}

// Warranty extension
function extendWarranty(productName, cost) {
    if (confirm(`Extend warranty for ${productName} for $${cost}?`)) {
        fetch('/pantry/extend_warranty', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ product_name: productName, cost: cost })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Warranty extended successfully!');
                location.reload();
            } else {
                alert('Error extending warranty');
            }
        })
        .catch(error => {
            console.error('Error extending warranty:', error);
            alert('Error extending warranty');
        });
    }
}

// Add to cart from restock suggestions
function addToCart(productName) {
    // This would integrate with your existing cart system
    fetch('/add_to_cart', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `product_name=${encodeURIComponent(productName)}&quantity=1`
    })
    .then(response => {
        if (response.ok) {
            alert(`${productName} added to cart!`);
            updateCartCount();
        } else {
            alert('Error adding to cart');
        }
    })
    .catch(error => {
        console.error('Error adding to cart:', error);
        alert('Error adding to cart');
    });
}

// Search pantry items
function searchPantryItems(searchTerm) {
    fetch(`/pantry/search?q=${encodeURIComponent(searchTerm)}`)
        .then(response => response.json())
        .then(data => {
            displaySearchResults(data.items);
        })
        .catch(error => console.error('Error searching items:', error));
}

function displaySearchResults(items) {
    // This would display search results in a modal or dedicated section
    console.log('Search results:', items);
}

// Show all pantry products - simplified version
function showAllPantryProducts() {
    console.log('showAllPantryProducts called');
    
    const modalElement = document.getElementById('allPantryModal');
    if (!modalElement) {
        alert('Modal not found');
        return;
    }
    
    // Show modal with manual DOM manipulation
    modalElement.setAttribute('style', 'display: block !important; z-index: 9999;');
    modalElement.classList.add('show');
    modalElement.classList.remove('fade');
    
    // Add backdrop
    let backdrop = document.querySelector('.modal-backdrop');
    if (!backdrop) {
        backdrop = document.createElement('div');
        backdrop.className = 'modal-backdrop fade show';
        backdrop.style.zIndex = '9998';
        document.body.appendChild(backdrop);
    }
    
    // Set content immediately
    const container = document.getElementById('allPantryContent');
    if (container) {
        container.innerHTML = '<div class="text-center"><h4>Loading pantry items...</h4><div class="spinner-border" role="status"></div></div>';
        
        // Load data
        fetch('/pantry/all_items')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('Received clean data:', data);
                
                if (data.items && data.items.length > 0) {
                    let html = '<div class="table-responsive"><table class="table table-striped table-hover"><thead class="table-dark"><tr>';
                    html += '<th>Product</th><th>Category</th><th>Quantity</th><th>Expiry Date</th><th>Storage</th><th>Actions</th>';
                    html += '</tr></thead><tbody>';
                    
                    data.items.forEach((item, index) => {
                        const name = item.product_name || 'Unknown Product';
                        const category = item.category || 'N/A';
                        const quantity = (item.quantity || 0) + ' ' + (item.unit || 'pcs');
                        const expiry = item.expiry_date || 'N/A';
                        const storage = item.storage_tags || 'N/A';
                        
                        // Calculate days to expiry for color coding
                        let expiryClass = '';
                        if (expiry !== 'N/A') {
                            const expiryDate = new Date(expiry);
                            const today = new Date();
                            const daysToExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
                            
                            if (daysToExpiry <= 3) expiryClass = 'text-danger fw-bold';
                            else if (daysToExpiry <= 7) expiryClass = 'text-warning fw-bold';
                        }
                        
                        html += `<tr id="pantry-row-${index}">
                            <td><strong>${name}</strong></td>
                            <td><span class="badge bg-secondary">${category}</span></td>
                            <td>${quantity}</td>
                            <td class="${expiryClass}">${expiry}</td>
                            <td><span class="badge bg-info">${storage}</span></td>
                            <td>
                                <button class="btn btn-sm btn-outline-danger" 
                                        onclick="removePantryItem('${name}', ${index})" 
                                        title="Remove from pantry">
                                    <i class="fas fa-trash"></i> Remove
                                </button>
                            </td>
                        </tr>`;
                    });
                    
                    html += '</tbody></table></div>';
                    container.innerHTML = html;
                } else {
                    container.innerHTML = '<div class="text-center"><h5>No pantry items found</h5><p class="text-muted">Start adding items to your pantry!</p></div>';
                }
            })
            .catch(error => {
                console.error('Error loading pantry items:', error);
                container.innerHTML = `<div class="alert alert-danger">
                    <h5>Error loading items</h5>
                    <p>${error.message}</p>
                    <button class="btn btn-outline-danger" onclick="showAllPantryProducts()">Retry</button>
                </div>`;
            });
    }
    
    // Close button functionality
    const closeBtn = modalElement.querySelector('.btn-close');
    const closeFooterBtn = modalElement.querySelector('.modal-footer .btn-secondary');
    
    function closeModal() {
        modalElement.style.display = 'none';
        modalElement.classList.remove('show');
        const existingBackdrop = document.querySelector('.modal-backdrop');
        if (existingBackdrop) {
            document.body.removeChild(existingBackdrop);
        }
    }
    
    if (closeBtn) {
        closeBtn.onclick = closeModal;
    }
    if (closeFooterBtn) {
        closeFooterBtn.onclick = closeModal;
    }
    
    // Close on backdrop click
    if (backdrop) {
        backdrop.onclick = closeModal;
    }
}

function displayAllPantryItems(items) {
    const container = document.getElementById('allPantryContent');
    console.log('Displaying items:', items);
    console.log('Container element:', container);
    
    if (!container) {
        console.error('Container element allPantryContent not found!');
        return;
    }
    
    if (!items || items.length === 0) {
        container.innerHTML = '<p class="text-muted">No items in pantry.</p>';
        console.log('Set empty message');
        return;
    }
    
    let html = '<div class="table-responsive"><table class="table table-striped"><thead><tr>';
    html += '<th>Product</th><th>Category</th><th>Quantity</th><th>Expiry</th><th>Storage</th><th>Price</th>';
    html += '</tr></thead><tbody>';
    
    items.forEach(item => {
        // Handle NaN and null values safely
        const productName = (item.product_name && item.product_name !== 'NaN') ? item.product_name : 'Unknown Product';
        const description = (item.description && item.description !== 'NaN') ? item.description : '';
        const category = (item.category && item.category !== 'NaN') ? item.category : 'N/A';
        const quantity = (item.quantity && !isNaN(item.quantity)) ? item.quantity : 0;
        const unit = (item.unit && item.unit !== 'NaN') ? item.unit : 'pcs';
        const expiryDate = (item.expiry_date && item.expiry_date !== 'NaN') ? item.expiry_date : 'N/A';
        const storageTag = (item.storage_tags && item.storage_tags !== 'NaN') ? item.storage_tags : 'N/A';
        const price = (item.price && !isNaN(item.price)) ? parseFloat(item.price) : 0;
        
        let expiryClass = '';
        let daysText = '';
        
        if (expiryDate !== 'N/A') {
            const expiry = new Date(expiryDate);
            const today = new Date();
            const daysToExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
            
            if (daysToExpiry <= 3) expiryClass = 'text-danger';
            else if (daysToExpiry <= 7) expiryClass = 'text-warning';
            
            if (daysToExpiry <= 7) {
                daysText = `<br><small>(${daysToExpiry} days)</small>`;
            }
        }
        
        html += `
            <tr>
                <td>
                    <strong>${productName}</strong><br>
                    <small class="text-muted">${description}</small>
                </td>
                <td><span class="badge bg-secondary">${category}</span></td>
                <td>${quantity} ${unit}</td>
                <td class="${expiryClass}">
                    ${expiryDate}
                    ${daysText}
                </td>
                <td><span class="badge bg-info">${storageTag}</span></td>
                <td>$${price.toFixed(2)}</td>
            </tr>
        `;
    });
    
    html += '</tbody></table></div>';
    container.innerHTML = html;
    console.log('HTML content set:', html.length, 'characters');
}

function updateAllergenCount() {
    fetch('/pantry/allergen_items')
        .then(response => response.json())
        .then(data => {
            const count = data.items.length;
            const badge = document.getElementById('allergenCount');
            if (badge) {
                badge.textContent = count;
            }
        })
        .catch(error => console.error('Error updating allergen count:', error));
}

// Remove pantry item
function removePantryItem(productName, rowIndex) {
    if (!confirm(`Are you sure you want to remove "${productName}" from your pantry?`)) {
        return;
    }
    
    // Send request to remove item
    fetch('/pantry/remove_item', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            product_name: productName
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Remove the row from the table
            const row = document.getElementById(`pantry-row-${rowIndex}`);
            if (row) {
                row.remove();
            }
            
            // Update pantry count in sidebar
            const pantryCountBadge = document.getElementById('pantryCount');
            if (pantryCountBadge) {
                const currentCount = parseInt(pantryCountBadge.textContent) || 0;
                pantryCountBadge.textContent = Math.max(0, currentCount - 1);
            }
            
            // Check if table is now empty
            const tableBody = document.querySelector('#allPantryContent tbody');
            if (tableBody && tableBody.children.length === 0) {
                document.getElementById('allPantryContent').innerHTML = 
                    '<div class="text-center"><h5>No pantry items found</h5><p class="text-muted">Start adding items to your pantry!</p></div>';
            }
            
            console.log(`Removed ${productName} from pantry`);
        } else {
            alert('Error removing item: ' + (data.message || 'Unknown error'));
        }
    })
    .catch(error => {
        console.error('Error removing pantry item:', error);
        alert('Error removing item: ' + error.message);
    });
}

// Test function to verify modal functionality
function testModal() {
    console.log('Testing modal...');
    alert('Test button clicked!');
    
    const container = document.getElementById('allPantryContent');
    const modalElement = document.getElementById('allPantryModal');
    
    console.log('Container:', container);
    console.log('Modal element:', modalElement);
    console.log('Bootstrap available:', typeof bootstrap !== 'undefined');
    
    if (!container) {
        alert('Container not found');
        return;
    }
    
    if (!modalElement) {
        alert('Modal not found');
        return;
    }
    
    container.innerHTML = '<h3>Test Content</h3><p>This is a test to verify the modal is working!</p>';
    
    try {
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
        console.log('Test modal shown successfully');
        alert('Modal should be visible now!');
    } catch (error) {
        console.error('Error showing modal:', error);
        alert('Error showing modal: ' + error.message);
    }
}

// Load order items when order is selected
function loadOrderItems() {
    const orderSelect = document.getElementById('orderSelect');
    const orderId = orderSelect ? orderSelect.value : '';
    const orderItemsDiv = document.getElementById('orderItems');
    
    if (!orderId) {
        if (orderItemsDiv) orderItemsDiv.style.display = 'none';
        const storageContainer = document.getElementById('storageItems');
        if (storageContainer) storageContainer.innerHTML = '';
        return;
    }
    
    // Show order items section
    if (orderItemsDiv) orderItemsDiv.style.display = 'block';
    
    // Load all items from selected order
    fetch(`/pantry/order_items?order_id=${orderId}`)
        .then(response => response.json())
        .then(data => {
            displayOrderItems(data.items);
        })
        .catch(error => {
            console.error('Error loading order items:', error);
        });
}

// Display order items
function displayOrderItems(items) {
    const container = document.getElementById('storageItems');
    if (!container) return;
    
    if (!items || items.length === 0) {
        container.innerHTML = '<p class="text-muted">No items found for the selected filters.</p>';
        return;
    }
    
    let html = '<div class="row">';
    
    items.forEach(item => {
        const storageIcon = getStorageIcon(item.storage_tag);
        const storageTips = getStorageTips(item.storage_tag);
        
        html += `
            <div class="col-md-6 col-lg-4 mb-3">
                <div class="card border-primary">
                    <div class="card-body">
                        <h6 class="card-title">${item.product_name}</h6>
                        <p class="card-text">
                            <span class="badge bg-info">${storageIcon} ${item.storage_tag}</span><br>
                            <small class="text-muted">Quantity: ${item.quantity}</small><br>
                            <small class="text-primary"><i class="fas fa-lightbulb"></i> ${storageTips}</small>
                        </p>
                    </div>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

// Get storage icon based on tag
function getStorageIcon(tag) {
    const icons = {
        'Refrigerator': '<i class="fas fa-snowflake"></i>',
        'Freezer': '<i class="fas fa-ice-cream"></i>',
        'Pantry': '<i class="fas fa-archive"></i>',
        'Counter': '<i class="fas fa-table"></i>',
        'Cupboard': '<i class="fas fa-box"></i>',
        'Cellar': '<i class="fas fa-wine-bottle"></i>'
    };
    return icons[tag] || '<i class="fas fa-box"></i>';
}

// Get storage tips based on tag
function getStorageTips(tag) {
    const tips = {
        'Refrigerator': 'Keep at 32-40°F (0-4°C). Store in sealed containers.',
        'Freezer': 'Maintain 0°F (-18°C). Use within 3-6 months for best quality.',
        'Pantry': 'Store in cool, dry place. Check expiration dates regularly.',
        'Counter': 'Keep at room temperature. Use within 2-3 days for freshness.',
        'Cupboard': 'Store in airtight containers. Keep away from heat and moisture.',
        'Cellar': 'Cool, dark environment. Ideal for long-term storage.'
    };
    return tips[tag] || 'Store in appropriate conditions for best quality.';
}

// Show storage tips for a product
function showStorageTips(productName) {
    alert(`Storage Tips for ${productName}:\n\n` +
          `• Store in appropriate temperature conditions\n` +
          `• Keep away from direct sunlight\n` +
          `• Use airtight containers to maintain freshness\n` +
          `• Check regularly for signs of spoilage\n` +
          `• Follow first-in-first-out rotation`);
}

// Show nutrition details modal
function showNutritionDetails(productName, nutritionDetails) {
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">
                        <i class="fas fa-chart-line me-2 text-success"></i>Nutrition Details
                    </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <h6 class="text-primary">${productName}</h6>
                    <hr>
                    <div class="nutrition-info">
                        <h6 class="text-success mb-3">
                            <i class="fas fa-leaf me-2"></i>Nutritional Content
                        </h6>
                        ${nutritionDetails.split(' ').map(item => {
                            if (item.trim()) {
                                return `<span class="badge bg-light text-dark me-2 mb-2">${item.trim()}</span>`;
                            }
                            return '';
                        }).join('')}
                    </div>
                    <div class="mt-3">
                        <small class="text-muted">
                            <i class="fas fa-info-circle me-1"></i>
                            Nutritional information helps you make healthier food choices and maintain a balanced diet.
                        </small>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
    
    // Remove modal from DOM when closed
    modal.addEventListener('hidden.bs.modal', function() {
        document.body.removeChild(modal);
    });
}

// Show nutrition highlights modal
function showNutritionHighlights() {
    console.log('Opening nutrition highlights modal...');
    
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.innerHTML = `
        <div class="modal-dialog modal-xl">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">
                        <i class="fas fa-heart me-2 text-success"></i>Nutrition Highlights
                    </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <p class="text-muted mb-4">Discover the health benefits of products in your pantry</p>
                    <div id="nutritionHighlightsContent">
                        <div class="text-center">
                            <div class="spinner-border text-primary" role="status">
                                <span class="visually-hidden">Loading...</span>
                            </div>
                            <p class="mt-2">Loading nutrition highlights...</p>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
    
    // Load nutrition highlights data
    loadNutritionHighlightsData();
    
    // Remove modal from DOM when closed
    modal.addEventListener('hidden.bs.modal', function() {
        document.body.removeChild(modal);
    });
}

// Load nutrition highlights data
function loadNutritionHighlightsData() {
    // Since we already have the data from the template, we'll create a simple API call
    // or use the data that's already available
    
    // For now, let's create a simple display of the nutrition categories
    const nutritionCategories = [
        {
            category: 'High Protein',
            icon: 'fas fa-dumbbell',
            color: 'success',
            benefits: 'Essential for muscle building and repair',
            recommendation: 'Great for post-workout recovery'
        },
        {
            category: 'Rich in Calcium',
            icon: 'fas fa-bone',
            color: 'primary',
            benefits: 'Supports strong bones and teeth',
            recommendation: 'Important for growing children and seniors'
        },
        {
            category: 'High Fiber',
            icon: 'fas fa-leaf',
            color: 'warning',
            benefits: 'Aids digestion and heart health',
            recommendation: 'Helps maintain healthy weight'
        },
        {
            category: 'Vitamin Rich',
            icon: 'fas fa-shield-virus',
            color: 'info',
            benefits: 'Boosts immune system and energy',
            recommendation: 'Essential for daily wellness'
        },
        {
            category: 'Iron Source',
            icon: 'fas fa-battery-full',
            color: 'danger',
            benefits: 'Prevents anemia and boosts energy',
            recommendation: 'Especially important for women'
        }
    ];
    
    let html = '<div class="row">';
    
    nutritionCategories.forEach(item => {
        html += `
            <div class="col-md-6 col-lg-4 mb-3">
                <div class="card border-${item.color} h-100">
                    <div class="card-body p-3">
                        <div class="d-flex align-items-start mb-2">
                            <i class="${item.icon} text-${item.color} me-2 mt-1 fs-4"></i>
                            <div class="flex-grow-1">
                                <h6 class="card-title mb-1 text-${item.color}">${item.category}</h6>
                            </div>
                        </div>
                        <p class="small text-muted mb-2">${item.benefits}</p>
                        <small class="text-success">${item.recommendation}</small>
                    </div>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    html += `
        <div class="mt-4 p-3 bg-light rounded">
            <h6 class="text-success mb-2">
                <i class="fas fa-info-circle me-2"></i>About Nutrition Highlights
            </h6>
            <p class="small mb-0">
                This feature analyzes the nutritional content of items in your pantry and highlights products 
                with significant health benefits. Use this information to make informed decisions about your diet 
                and ensure you're getting essential nutrients from the foods you have available.
            </p>
        </div>
    `;
    
    document.getElementById('nutritionHighlightsContent').innerHTML = html;
}

// Show combined nutrition analysis for entire pantry
function showCombinedNutritionAnalysis() {
    fetch('/nutrition_highlights')
        .then(response => response.json())
        .then(data => {
            const nutritionData = data.highlights || [];
            
            // Group nutrients by category
            const categories = {};
            const allNutrients = new Set();
            const missingNutrients = new Set();
            
            nutritionData.forEach(item => {
                if (!categories[item.category]) {
                    categories[item.category] = {
                        products: [],
                        color: item.color,
                        icon: item.icon,
                        benefits: item.benefits
                    };
                }
                categories[item.category].products.push(item.product_name);
                
                // Collect all nutrients
                if (item.nutrition_details) {
                    item.nutrition_details.split(' ').forEach(nutrient => {
                        if (nutrient.trim()) {
                            allNutrients.add(nutrient.trim());
                        }
                    });
                }
                
                // Collect missing nutrients
                if (item.missing_nutrients) {
                    item.missing_nutrients.split(',').forEach(nutrient => {
                        if (nutrient.trim()) {
                            missingNutrients.add(nutrient.trim());
                        }
                    });
                }
            });
            
            const modal = document.createElement('div');
            modal.className = 'modal fade';
            modal.innerHTML = `
                <div class="modal-dialog modal-xl">
                    <div class="modal-content">
                        <div class="modal-header bg-success text-white">
                            <h5 class="modal-title">
                                <i class="fas fa-chart-pie me-2"></i>Complete Pantry Nutrition Analysis
                            </h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="alert alert-success bg-light border-success mb-4">
                                <h6 class="alert-heading text-success">
                                    <i class="fas fa-leaf me-2"></i>Your Pantry Overview
                                </h6>
                                <p class="mb-0">Comprehensive nutritional analysis of all ${nutritionData.length} highlighted items in your pantry</p>
                            </div>
                            
                            <div class="row mb-4">
                                <div class="col-md-6">
                                    <div class="card border-success h-100">
                                        <div class="card-header bg-success text-white">
                                            <h6 class="mb-0">
                                                <i class="fas fa-check-circle me-2"></i>What Your Pantry Provides
                                            </h6>
                                        </div>
                                        <div class="card-body">
                                            <h6 class="text-success mb-3">
                                                <i class="fas fa-tags me-2"></i>Nutrition Categories (${Object.keys(categories).length})
                                            </h6>
                                            ${Object.entries(categories).map(([category, data]) => `
                                                <div class="mb-3 p-2 border rounded bg-light">
                                                    <div class="d-flex align-items-center mb-2">
                                                        <i class="${data.icon} text-${data.color} me-2"></i>
                                                        <strong class="text-${data.color}">${category}</strong>
                                                        <span class="badge bg-${data.color} ms-auto">${data.products.length} items</span>
                                                    </div>
                                                    <p class="small mb-2">${data.benefits}</p>
                                                    <div class="small text-muted">
                                                        <strong>Items:</strong> ${data.products.join(', ')}
                                                    </div>
                                                </div>
                                            `).join('')}
                                            
                                            <h6 class="text-success mb-2 mt-4">
                                                <i class="fas fa-atom me-2"></i>Available Nutrients (${allNutrients.size})
                                            </h6>
                                            <div class="nutrition-badges">
                                                ${Array.from(allNutrients).map(nutrient => 
                                                    `<span class="badge bg-success text-white me-1 mb-1">${nutrient}</span>`
                                                ).join('')}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="col-md-6">
                                    <div class="card border-warning h-100">
                                        <div class="card-header bg-warning text-dark">
                                            <h6 class="mb-0">
                                                <i class="fas fa-exclamation-triangle me-2"></i>Nutritional Gaps to Address
                                            </h6>
                                        </div>
                                        <div class="card-body">
                                            ${missingNutrients.size > 0 ? `
                                                <h6 class="text-warning mb-3">
                                                    <i class="fas fa-info-circle me-2"></i>Missing Nutrients (${missingNutrients.size})
                                                </h6>
                                                <p class="small text-muted mb-3">
                                                    Consider adding foods rich in these nutrients to optimize your pantry:
                                                </p>
                                                <div class="missing-nutrients mb-4">
                                                    ${Array.from(missingNutrients).map(nutrient => 
                                                        `<span class="badge bg-warning text-dark me-1 mb-1">${nutrient}</span>`
                                                    ).join('')}
                                                </div>
                                                
                                                <h6 class="text-info mb-2">
                                                    <i class="fas fa-lightbulb me-2"></i>Smart Shopping Suggestions
                                                </h6>
                                                <div class="recommendations">
                                                    ${Array.from(missingNutrients).slice(0, 4).map(nutrient => {
                                                        const suggestions = {
                                                            'Iron': 'Spinach, lentils, lean red meat',
                                                            'B12': 'Fish, eggs, fortified cereals',
                                                            'Zinc': 'Nuts, seeds, whole grains',
                                                            'Vitamin B6': 'Bananas, chickpeas, tuna',
                                                            'Magnesium': 'Dark chocolate, almonds, avocados',
                                                            'Phosphorus': 'Dairy products, salmon, turkey',
                                                            'Vitamin D': 'Fatty fish, fortified milk, mushrooms',
                                                            'Vitamin K': 'Kale, broccoli, Brussels sprouts',
                                                            'Prebiotics': 'Garlic, onions, bananas',
                                                            'Potassium': 'Potatoes, beans, tomatoes',
                                                            'Vitamin C': 'Citrus fruits, bell peppers, strawberries',
                                                            'Antioxidants': 'Berries, dark leafy greens, tea',
                                                            'Beta Carotene': 'Carrots, sweet potatoes, cantaloupe',
                                                            'Folate': 'Leafy greens, legumes, asparagus',
                                                            'Omega-3': 'Fatty fish, walnuts, flax seeds',
                                                            'Copper': 'Cashews, dark chocolate, lobster'
                                                        };
                                                        return `
                                                            <div class="small mb-2 p-2 bg-light rounded">
                                                                <strong class="text-warning">${nutrient}:</strong>
                                                                <span class="text-muted">${suggestions[nutrient] || 'Various food sources available'}</span>
                                                            </div>
                                                        `;
                                                    }).join('')}
                                                </div>
                                            ` : `
                                                <div class="text-center py-4">
                                                    <i class="fas fa-check-circle text-success fa-3x mb-3"></i>
                                                    <h6 class="text-success">Excellent Nutritional Balance!</h6>
                                                    <p class="small text-muted">
                                                        Your pantry has a well-rounded nutritional profile across all major categories.
                                                    </p>
                                                </div>
                                            `}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="bg-light p-4 rounded">
                                <h6 class="text-success mb-3">
                                    <i class="fas fa-heart me-2"></i>Overall Health Assessment
                                </h6>
                                <div class="row">
                                    <div class="col-md-4">
                                        <div class="text-center mb-3">
                                            <div class="bg-success text-white rounded-circle d-inline-flex align-items-center justify-content-center" style="width: 60px; height: 60px;">
                                                <span class="h4 mb-0">${Object.keys(categories).length}</span>
                                            </div>
                                            <div class="small text-muted mt-2">Nutrition Categories</div>
                                        </div>
                                    </div>
                                    <div class="col-md-4">
                                        <div class="text-center mb-3">
                                            <div class="bg-info text-white rounded-circle d-inline-flex align-items-center justify-content-center" style="width: 60px; height: 60px;">
                                                <span class="h4 mb-0">${allNutrients.size}</span>
                                            </div>
                                            <div class="small text-muted mt-2">Available Nutrients</div>
                                        </div>
                                    </div>
                                    <div class="col-md-4">
                                        <div class="text-center mb-3">
                                            <div class="bg-warning text-dark rounded-circle d-inline-flex align-items-center justify-content-center" style="width: 60px; height: 60px;">
                                                <span class="h4 mb-0">${missingNutrients.size}</span>
                                            </div>
                                            <div class="small text-muted mt-2">Potential Gaps</div>
                                        </div>
                                    </div>
                                </div>
                                <p class="small text-muted text-center mb-0">
                                    Your pantry provides a ${missingNutrients.size < 5 ? 'strong' : 'good'} nutritional foundation. 
                                    ${missingNutrients.size > 0 ? 'Consider the suggested additions to optimize your nutrition.' : 'Keep up the excellent variety!'}
                                </p>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            <button type="button" class="btn btn-primary" onclick="window.location.href='/'">
                                <i class="fas fa-shopping-cart me-2"></i>Shop for Missing Nutrients
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            const bsModal = new bootstrap.Modal(modal);
            bsModal.show();
            
            // Remove modal from DOM when closed
            modal.addEventListener('hidden.bs.modal', function() {
                document.body.removeChild(modal);
            });
        })
        .catch(error => {
            console.error('Error loading nutrition data:', error);
            alert('Unable to load nutrition analysis. Please try again.');
        });
}