import os
import logging
from flask import Flask, render_template, request, redirect, url_for, session, flash, jsonify
from datetime import datetime
import pandas as pd
from data_manager import DataManager
from pantry_manager import PantryManager

# Setup logging
logging.basicConfig(level=logging.DEBUG)

app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "default_secret_key_for_development")

# Initialize data manager
data_manager = DataManager()
pantry_manager = PantryManager()

@app.route('/')
def index():
    """Display product catalog"""
    try:
        products = data_manager.get_products()
        return render_template('index.html', products=products)
    except Exception as e:
        logging.error(f"Error loading products: {e}")
        flash('Error loading products. Please try again.', 'error')
        return render_template('index.html', products=[])

@app.route('/add_to_cart', methods=['POST'])
def add_to_cart():
    """Add product to cart"""
    try:
        product_id = int(request.form.get('product_id'))
        quantity = int(request.form.get('quantity', 1))
        
        # Get product details
        products = data_manager.get_products()
        product = next((p for p in products if p['id'] == product_id), None)
        
        if not product:
            flash('Product not found.', 'error')
            return redirect(url_for('index'))
        
        # Initialize cart if not exists
        if 'cart' not in session:
            session['cart'] = {}
        
        # Add or update product in cart
        cart = session['cart']
        if str(product_id) in cart:
            cart[str(product_id)]['quantity'] += quantity
        else:
            cart[str(product_id)] = {
                'id': product_id,
                'name': product['name'],
                'price': product['price'],
                'quantity': quantity
            }
        
        session['cart'] = cart
        session.modified = True
        
        flash(f'Added {product["name"]} to cart!', 'success')
        return redirect(url_for('index'))
    
    except Exception as e:
        logging.error(f"Error adding to cart: {e}")
        flash('Error adding product to cart.', 'error')
        return redirect(url_for('index'))

@app.route('/cart')
def view_cart():
    """Display shopping cart"""
    cart = session.get('cart', {})
    total = sum(item['price'] * item['quantity'] for item in cart.values())
    return render_template('cart.html', cart=cart, total=total)

@app.route('/update_cart', methods=['POST'])
def update_cart():
    """Update cart item quantity"""
    try:
        product_id = request.form.get('product_id')
        quantity = int(request.form.get('quantity'))
        
        if 'cart' not in session:
            session['cart'] = {}
        
        cart = session['cart']
        if quantity > 0:
            if product_id in cart:
                cart[product_id]['quantity'] = quantity
        else:
            # Remove item if quantity is 0
            cart.pop(product_id, None)
        
        session['cart'] = cart
        session.modified = True
        
        flash('Cart updated successfully!', 'success')
    except Exception as e:
        logging.error(f"Error updating cart: {e}")
        flash('Error updating cart.', 'error')
    
    return redirect(url_for('view_cart'))

@app.route('/remove_from_cart', methods=['POST'])
def remove_from_cart():
    """Remove item from cart"""
    try:
        product_id = request.form.get('product_id')
        
        if 'cart' in session and product_id in session['cart']:
            removed_item = session['cart'].pop(product_id)
            session.modified = True
            flash(f'Removed {removed_item["name"]} from cart!', 'success')
        
    except Exception as e:
        logging.error(f"Error removing from cart: {e}")
        flash('Error removing item from cart.', 'error')
    
    return redirect(url_for('view_cart'))

@app.route('/checkout', methods=['POST'])
def checkout():
    """Process checkout and create order"""
    try:
        cart = session.get('cart', {})
        
        if not cart:
            flash('Your cart is empty!', 'error')
            return redirect(url_for('view_cart'))
        
        # Calculate total
        total_amount = sum(item['price'] * item['quantity'] for item in cart.values())
        
        # Create order
        order_id = data_manager.create_order(cart)
        
        if order_id:
            # Store order details for confirmation page
            order_items = list(cart.values())
            
            # Add ordered items to pantry
            cart_items = []
            for product_name, item in cart.items():
                cart_items.append({
                    'product_name': product_name,
                    'quantity': item['quantity'],
                    'price': item['price'],
                    'image': item.get('image', '')
                })
            
            pantry_manager.add_order_items_to_pantry(cart_items)
            
            # Clear cart
            session['cart'] = {}
            session.modified = True
            
            return render_template('order_confirmation.html', 
                                 order_id=order_id, 
                                 order_items=order_items,
                                 total_amount=total_amount)
        else:
            flash('Error processing order. Please try again.', 'error')
            return redirect(url_for('view_cart'))
    
    except Exception as e:
        logging.error(f"Error during checkout: {e}")
        flash('Error processing order. Please try again.', 'error')
        return redirect(url_for('view_cart'))

@app.route('/orders')
def orders():
    """Display order history"""
    try:
        logging.debug("Attempting to get orders...")
        orders = data_manager.get_orders()
        logging.debug(f"Successfully retrieved {len(orders)} orders")
        return render_template('orders.html', orders=orders)
    except Exception as e:
        logging.error(f"Error loading orders: {e}")
        import traceback
        logging.error(traceback.format_exc())
        flash('Error loading orders. Please try again.', 'error')
        return render_template('orders.html', orders=[])

@app.route('/get_cart_count')
def get_cart_count():
    """Get cart item count for navbar"""
    cart = session.get('cart', {})
    count = sum(item['quantity'] for item in cart.values())
    return jsonify({'count': count})

@app.route('/pantry')
def pantry_dashboard():
    """Display pantry dashboard"""
    try:
        # Get data for dashboard
        logging.debug("Getting pantry items...")
        pantry_items = pantry_manager.get_pantry_items()
        logging.debug(f"Got {len(pantry_items)} pantry items")
        
        logging.debug("Getting expiring items...")
        expiring_items = pantry_manager.get_expiring_items(days=7)
        logging.debug(f"Got {len(expiring_items)} expiring items")
        
        logging.debug("Getting quick use items...")
        quick_use_items = pantry_manager.get_quick_use_items()
        logging.debug(f"Got {len(quick_use_items)} quick use items")
        
        logging.debug("Getting user allergens...")
        user_allergens = pantry_manager.get_user_allergens()
        logging.debug(f"Got {len(user_allergens)} user allergens")
        
        logging.debug("Getting warranty items...")
        warranty_items = pantry_manager.get_warranty_items()
        logging.debug(f"Got {len(warranty_items)} warranty items")
        
        # Get order history for restock suggestions and order selection
        logging.debug("Getting orders...")
        orders = data_manager.get_orders()
        logging.debug(f"Got {len(orders)} orders")
        
        logging.debug("Generating restock suggestions...")
        restock_suggestions = pantry_manager.generate_restock_suggestions(orders)
        logging.debug(f"Got {len(restock_suggestions)} restock suggestions")
        
        logging.debug("Getting nutrition highlights...")
        nutrition_highlights = pantry_manager.get_nutrition_highlights()
        logging.debug(f"Got {len(nutrition_highlights)} nutrition highlights")
        
        # Define storage tags
        storage_tags = ['Refrigerator', 'Freezer', 'Pantry', 'Counter', 'Cupboard', 'Cellar']
        
        logging.debug("Rendering template...")
        return render_template('pantry_dashboard.html',
                             pantry_items=pantry_items,
                             expiring_items=expiring_items,
                             quick_use_items=quick_use_items,
                             user_allergens=user_allergens,
                             warranty_items=warranty_items,
                             restock_suggestions=restock_suggestions,
                             nutrition_highlights=nutrition_highlights,
                             storage_tags=storage_tags,
                             orders=orders)
    except Exception as e:
        import traceback
        logging.error(f"Error loading pantry dashboard: {e}")
        logging.error(traceback.format_exc())
        flash('Error loading pantry dashboard.', 'error')
        return redirect(url_for('index'))

@app.route('/pantry/add_item', methods=['POST'])
def add_pantry_item():
    """Add item to pantry"""
    try:
        item_data = request.get_json()
        success = pantry_manager.add_pantry_item(item_data)
        return jsonify({'success': success})
    except Exception as e:
        logging.error(f"Error adding pantry item: {e}")
        return jsonify({'success': False})

@app.route('/pantry/filter_by_tag')
def filter_by_storage_tag():
    """Filter pantry items by storage tag"""
    try:
        tag = request.args.get('tag', '')
        items = pantry_manager.get_items_by_storage_tag(tag)
        return jsonify({'items': items})
    except Exception as e:
        logging.error(f"Error filtering by storage tag: {e}")
        return jsonify({'items': []})

@app.route('/pantry/add_allergen', methods=['POST'])
def add_allergen():
    """Add user allergen"""
    try:
        data = request.get_json()
        allergen = data.get('allergen', '')
        success = pantry_manager.add_allergen(allergen)
        return jsonify({'success': success})
    except Exception as e:
        logging.error(f"Error adding allergen: {e}")
        return jsonify({'success': False})

@app.route('/pantry/remove_allergen', methods=['POST'])
def remove_allergen():
    """Remove user allergen"""
    try:
        data = request.get_json()
        allergen = data.get('allergen', '')
        
        # Read current allergens and remove the specified one
        df = pd.read_excel(pantry_manager.allergens_file, engine='openpyxl')
        df = df[df['allergen'] != allergen]
        df.to_excel(pantry_manager.allergens_file, index=False, engine='openpyxl')
        
        return jsonify({'success': True})
    except Exception as e:
        logging.error(f"Error removing allergen: {e}")
        return jsonify({'success': False})

@app.route('/pantry/allergen_items')
def get_allergen_items():
    """Get pantry items that contain user allergens"""
    try:
        user_allergens = pantry_manager.get_user_allergens()
        pantry_items = pantry_manager.get_pantry_items()
        
        if not user_allergens:
            return jsonify({'items': []})
        
        # Create mapping for allergen variants
        allergen_mappings = {
            'milk': ['lactose', 'dairy', 'milk', 'casein', 'whey'],
            'wheat': ['gluten', 'wheat', 'flour', 'barley', 'rye'],
            'eggs': ['egg', 'eggs', 'albumin'],
            'peanuts': ['peanut', 'peanuts', 'groundnut'],
            'tree nuts': ['nuts', 'almond', 'walnut', 'cashew', 'pecan', 'hazelnut'],
            'soy': ['soy', 'soya', 'soybean', 'lecithin'],
            'fish': ['fish', 'salmon', 'tuna', 'cod'],
            'shellfish': ['shellfish', 'shrimp', 'crab', 'lobster', 'clam'],
            'sesame': ['sesame', 'tahini'],
            'corn': ['corn', 'maize', 'corn syrup'],
            'sulfites': ['sulfite', 'sulfites', 'sulphite'],
            'mustard': ['mustard'],
            'celery': ['celery'],
            'lupin': ['lupin', 'lupine']
        }
        
        # Get user allergen terms (expand to include variants)
        user_allergen_terms = set()
        for allergen_obj in user_allergens:
            user_allergen = allergen_obj['allergen'].lower().strip()
            user_allergen_terms.add(user_allergen)
            
            # Add mapped variants
            for main_allergen, variants in allergen_mappings.items():
                if user_allergen in variants or any(variant in user_allergen for variant in variants):
                    user_allergen_terms.update(variants)
        
        items_with_allergens = []
        
        for item in pantry_items:
            item_allergens = item.get('allergens', '')
            if pd.isna(item_allergens) or not item_allergens:
                continue
                
            item_allergens_str = str(item_allergens).lower().strip()
            
            # Check if any user allergen matches this item's allergens
            if any(allergen_term in item_allergens_str for allergen_term in user_allergen_terms):
                item_copy = item.copy()
                item_copy['matched_allergens'] = item_allergens
                items_with_allergens.append(item_copy)
        
        # Clean NaN values from items before JSON serialization
        cleaned_items = []
        for item in items_with_allergens:
            cleaned_item = {}
            for key, value in item.items():
                # Replace NaN, None, and 'nan' string values with appropriate defaults
                if pd.isna(value) or value is None or str(value).lower() == 'nan':
                    if key in ['price', 'quantity', 'restock_days']:
                        cleaned_item[key] = 0
                    elif key in ['barcode']:
                        cleaned_item[key] = None
                    else:
                        cleaned_item[key] = ''
                else:
                    cleaned_item[key] = value
            cleaned_items.append(cleaned_item)
        
        return jsonify({'items': cleaned_items})
    except Exception as e:
        logging.error(f"Error getting allergen items: {e}")
        return jsonify({'items': []})

@app.route('/pantry/search')
def search_pantry():
    """Search pantry items"""
    try:
        query = request.args.get('q', '').lower()
        pantry_items = pantry_manager.get_pantry_items()
        
        filtered_items = [
            item for item in pantry_items 
            if query in item.get('product_name', '').lower()
        ]
        
        return jsonify({'items': filtered_items})
    except Exception as e:
        logging.error(f"Error searching pantry: {e}")
        return jsonify({'items': []})

@app.route('/pantry/extend_warranty', methods=['POST'])
def extend_warranty():
    """Extend product warranty"""
    try:
        data = request.get_json()
        product_name = data.get('product_name', '')
        cost = data.get('cost', 0)
        
        # In a real implementation, this would process payment and extend warranty
        # For now, we'll just return success
        logging.info(f"Warranty extension requested for {product_name} at ${cost}")
        return jsonify({'success': True})
    except Exception as e:
        logging.error(f"Error extending warranty: {e}")
        return jsonify({'success': False})

@app.route('/pantry/all_items')
def get_all_pantry_items():
    """Get all pantry items for the sidebar view"""
    try:
        items = pantry_manager.get_pantry_items()
        
        # Clean NaN values from items before JSON serialization
        cleaned_items = []
        for item in items:
            cleaned_item = {}
            for key, value in item.items():
                # Replace NaN, None, and 'nan' string values with appropriate defaults
                if pd.isna(value) or value is None or str(value).lower() == 'nan':
                    if key in ['price', 'quantity', 'restock_days']:
                        cleaned_item[key] = 0
                    elif key in ['barcode']:
                        cleaned_item[key] = None
                    else:
                        cleaned_item[key] = ''
                else:
                    cleaned_item[key] = value
            cleaned_items.append(cleaned_item)
        
        return jsonify({'items': cleaned_items})
    except Exception as e:
        logging.error(f"Error getting all pantry items: {e}")
        return jsonify({'items': []})

@app.route('/pantry/remove_item', methods=['POST'])
def remove_pantry_item():
    """Remove item from pantry"""
    try:
        data = request.get_json()
        product_name = data.get('product_name', '')
        
        if not product_name:
            return jsonify({'success': False, 'message': 'Product name is required'})
        
        # Remove item from pantry
        success = pantry_manager.remove_pantry_item(product_name)
        
        if success:
            logging.info(f"Removed {product_name} from pantry")
            return jsonify({'success': True, 'message': f'Removed {product_name} from pantry'})
        else:
            return jsonify({'success': False, 'message': f'Item {product_name} not found in pantry'})
            
    except Exception as e:
        logging.error(f"Error removing pantry item: {e}")
        return jsonify({'success': False, 'message': str(e)})

@app.route('/pantry/order_items')
def get_order_items():
    """Get items from a specific order with storage tag filtering"""
    try:
        order_id = request.args.get('order_id', '')
        storage_tag = request.args.get('storage_tag', '')
        
        if not order_id:
            return jsonify({'items': []})
        
        # Get all orders
        orders = data_manager.get_orders()
        
        # Find the specific order
        order = next((o for o in orders if str(o.get('order_id')) == str(order_id)), None)
        
        if not order:
            return jsonify({'items': []})
        
        # Get items from the order
        order_items = order.get('items', [])
        
        # Add storage tags to items based on category
        items_with_storage = []
        for item in order_items:
            product_name = item.get('product_name', '')
            
            # Determine storage tag based on product name/category
            if any(keyword in product_name.lower() for keyword in ['milk', 'dairy', 'cheese', 'yogurt', 'vegetable', 'carrot', 'lettuce']):
                item_storage = 'Refrigerator'
            elif any(keyword in product_name.lower() for keyword in ['meat', 'chicken', 'beef', 'frozen']):
                item_storage = 'Freezer'
            elif any(keyword in product_name.lower() for keyword in ['fruit', 'apple', 'banana', 'bread']):
                item_storage = 'Counter'
            else:
                item_storage = 'Pantry'
            
            # Create item with storage info
            storage_item = {
                'product_name': product_name,
                'quantity': item.get('quantity', 1),
                'price': item.get('price', 0),
                'storage_tag': item_storage,
                'order_id': order_id
            }
            
            # Filter by storage tag if specified
            if not storage_tag or item_storage == storage_tag:
                items_with_storage.append(storage_item)
        
        return jsonify({'items': items_with_storage})
        
    except Exception as e:
        logging.error(f"Error getting order items: {e}")
        return jsonify({'items': []})

@app.route('/nutrition_highlights')
def get_nutrition_highlights():
    """Get nutrition highlights data for combined analysis"""
    try:
        logging.debug("Getting nutrition highlights for combined analysis")
        nutrition_highlights = pantry_manager.get_nutrition_highlights()
        return jsonify({'highlights': nutrition_highlights})
    except Exception as e:
        logging.error(f"Error getting nutrition highlights: {e}")
        return jsonify({'highlights': []})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
