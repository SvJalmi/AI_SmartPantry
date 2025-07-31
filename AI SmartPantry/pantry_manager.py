import pandas as pd
import os
from datetime import datetime, timedelta
import logging

class PantryManager:
    def __init__(self):
        self.pantry_file = 'pantry_items.xlsx'
        self.allergens_file = 'user_allergens.xlsx'
        self.warranty_file = 'warranty_items.xlsx'
        self.initialize_files()
    
    def initialize_files(self):
        """Initialize Excel files for pantry management"""
        try:
            # Initialize pantry items file
            if not os.path.exists(self.pantry_file):
                # Add sample pantry items
                from datetime import datetime, timedelta
                
                # Create items with varying expiry dates
                today = datetime.now()
                pantry_data = {
                    'barcode': ['1234567890', '2345678901', '3456789012', '4567890123', '5678901234'],
                    'product_name': ['Organic Milk', 'Whole Wheat Bread', 'Cheddar Cheese', 'Fresh Apples', 'Chicken Breast'],
                    'photo': ['milk.svg', 'bread.svg', 'cheese.svg', 'apple.svg', 'chicken.svg'],
                    'price': [4.99, 3.50, 6.99, 2.99, 8.99],
                    'category': ['Dairy', 'Bakery', 'Dairy', 'Fruit', 'Meat'],
                    'storage_tags': ['Refrigerator', 'Pantry', 'Refrigerator', 'Counter', 'Freezer'],
                    'expiry_date': [
                        (today + timedelta(days=3)).strftime('%Y-%m-%d'),  # Expiring soon
                        (today + timedelta(days=5)).strftime('%Y-%m-%d'),  # Expiring soon
                        (today + timedelta(days=14)).strftime('%Y-%m-%d'),
                        (today + timedelta(days=7)).strftime('%Y-%m-%d'),
                        (today + timedelta(days=30)).strftime('%Y-%m-%d')
                    ],
                    'quantity': [1, 1, 1, 5, 2],
                    'unit': ['liter', 'loaf', 'block', 'pieces', 'lbs'],
                    'date_added': [today.strftime('%Y-%m-%d')] * 5,
                    'description': ['Fresh organic milk', 'Whole grain bread', 'Aged cheddar cheese', 'Crisp red apples', 'Free-range chicken breast'],
                    'nutrition_a': ['Calcium: 300mg', 'Fiber: 3g', 'Protein: 7g', 'Vitamin C: 14%', 'Protein: 25g'],
                    'nutrition_b': ['Protein: 8g', 'Protein: 4g', 'Fat: 9g', 'Fiber: 4g', 'Iron: 6%'],
                    'nutrition_c': ['Vitamin D: 25%', 'Iron: 10%', 'Calcium: 20%', 'Potassium: 6%', 'B6: 20%'],
                    'allergens': ['Lactose', 'Gluten', 'Lactose', '', ''],
                    'disposal_methods': ['Compost', 'Compost', 'Compost', 'Compost', 'Standard'],
                    'donate_option': ['Food bank', 'Food bank', 'Food bank', 'Food bank', 'Food bank'],
                    'warranty': ['', '', '', '', ''],
                    'restock_description': ['Essential dairy item', 'Daily bread staple', 'Popular cheese variety', 'Healthy snack option', 'Protein source'],
                    'restock_days': [3, 5, 14, 7, 10]
                }
                df = pd.DataFrame(pantry_data)
                df.to_excel(self.pantry_file, index=False, engine='openpyxl')
                logging.info("Created pantry_items.xlsx")
            
            # Initialize user allergens file
            if not os.path.exists(self.allergens_file):
                allergens_data = {
                    'allergen': [],
                    'severity': [],
                    'date_added': []
                }
                df = pd.DataFrame(allergens_data)
                df.to_excel(self.allergens_file, index=False, engine='openpyxl')
                logging.info("Created user_allergens.xlsx")
            
            # Initialize warranty file
            if not os.path.exists(self.warranty_file):
                warranty_data = {
                    'product_name': ['Laptop Computer', 'Smartphone', 'Smart TV'],
                    'purchase_date': ['2024-01-15', '2024-03-20', '2024-02-10'],
                    'warranty_expiry': ['2025-01-15', '2025-03-20', '2026-02-10'],
                    'warranty_type': ['Standard', 'Extended', 'Manufacturer'],
                    'can_extend': [True, False, True],
                    'extension_cost': [99.99, 0, 149.99]
                }
                df = pd.DataFrame(warranty_data)
                df.to_excel(self.warranty_file, index=False, engine='openpyxl')
                logging.info("Created warranty_items.xlsx")
                
        except Exception as e:
            logging.error(f"Error initializing pantry files: {e}")
    
    def add_pantry_item(self, item_data):
        """Add item to pantry"""
        try:
            df = pd.read_excel(self.pantry_file, engine='openpyxl')
            new_row = {
                'barcode': item_data.get('barcode', ''),
                'product_name': item_data.get('product_name', ''),
                'photo': item_data.get('photo', ''),
                'price': item_data.get('price', 0),
                'category': item_data.get('category', ''),
                'storage_tags': item_data.get('storage_tags', ''),
                'expiry_date': item_data.get('expiry_date', ''),
                'quantity': item_data.get('quantity', 1),
                'unit': item_data.get('unit', 'pcs'),
                'date_added': datetime.now().strftime('%Y-%m-%d'),
                'description': item_data.get('description', ''),
                'nutrition_a': item_data.get('nutrition_a', ''),
                'nutrition_b': item_data.get('nutrition_b', ''),
                'nutrition_c': item_data.get('nutrition_c', ''),
                'allergens': item_data.get('allergens', ''),
                'disposal_methods': item_data.get('disposal_methods', 'standard'),
                'donate_option': item_data.get('donate_option', ''),
                'warranty': item_data.get('warranty', ''),
                'restock_description': item_data.get('restock_description', ''),
                'restock_days': item_data.get('restock_days', 7)
            }
            df = pd.concat([df, pd.DataFrame([new_row])], ignore_index=True)
            df.to_excel(self.pantry_file, index=False, engine='openpyxl')
            return True
        except Exception as e:
            logging.error(f"Error adding pantry item: {e}")
            return False
    
    def get_pantry_items(self):
        """Get all pantry items"""
        try:
            df = pd.read_excel(self.pantry_file, engine='openpyxl')
            return df.to_dict('records')
        except Exception as e:
            logging.error(f"Error reading pantry items: {e}")
            return []
    
    def get_items_by_storage_tag(self, tag):
        """Get items filtered by storage tag"""
        try:
            df = pd.read_excel(self.pantry_file, engine='openpyxl')
            filtered = df[df['storage_tags'].str.contains(tag, na=False)]
            return filtered.to_dict('records')
        except Exception as e:
            logging.error(f"Error filtering by storage tag: {e}")
            return []
    
    def get_expiring_items(self, days=7):
        """Get items expiring within specified days"""
        try:
            df = pd.read_excel(self.pantry_file, engine='openpyxl')
            df['expiry_date'] = pd.to_datetime(df['expiry_date'])
            
            today = datetime.now()
            threshold = today + timedelta(days=days)
            
            expiring = df[df['expiry_date'] <= threshold]
            
            # Calculate days remaining and add progress information
            expiring_items = []
            for _, item in expiring.iterrows():
                item_dict = item.to_dict()
                days_remaining = (item['expiry_date'] - today).days
                
                # Calculate progress percentage (0% = expired, 100% = full time remaining)
                progress_percentage = max(0, min(100, (days_remaining / days) * 100))
                
                # Determine urgency level
                if days_remaining <= 0:
                    urgency = 'expired'
                    urgency_class = 'bg-dark'
                elif days_remaining <= 1:
                    urgency = 'critical'
                    urgency_class = 'bg-danger'
                elif days_remaining <= 2:
                    urgency = 'urgent'
                    urgency_class = 'bg-warning'
                else:
                    urgency = 'normal'
                    urgency_class = 'bg-info'
                
                item_dict.update({
                    'days_remaining': days_remaining,
                    'progress_percentage': progress_percentage,
                    'urgency': urgency,
                    'urgency_class': urgency_class,
                    'days_label': 'expired' if days_remaining <= 0 else f'{days_remaining} day{"s" if days_remaining != 1 else ""} left'
                })
                
                expiring_items.append(item_dict)
            
            # Sort by urgency (most urgent first)
            expiring_items.sort(key=lambda x: x['days_remaining'])
            
            return expiring_items
        except Exception as e:
            logging.error(f"Error getting expiring items: {e}")
            return []
    
    def get_quick_use_items(self):
        """Get items that need to be used quickly after opening"""
        try:
            df = pd.read_excel(self.pantry_file, engine='openpyxl')
            
            # Define items that need quick use after opening
            quick_use_categories = {
                'Dairy': 'Use within 3-5 days after opening',
                'Meat': 'Use within 1-2 days after opening',
                'Seafood': 'Use within 1 day after opening',
                'Beverage': 'Best consumed within 3-7 days after opening',
                'Condiments': 'Use within 30 days after opening',
                'Produce': 'Best consumed within 2-3 days after cutting/opening'
            }
            
            # Filter items based on categories that require quick use
            quick_use_items = []
            for _, item in df.iterrows():
                category = str(item.get('category', '')).strip()
                if category in quick_use_categories:
                    item_dict = item.to_dict()
                    item_dict['quick_use_note'] = quick_use_categories[category]
                    quick_use_items.append(item_dict)
            
            return quick_use_items
        except Exception as e:
            logging.error(f"Error getting quick use items: {e}")
            return []
    
    def get_user_allergens(self):
        """Get user's allergens"""
        try:
            df = pd.read_excel(self.allergens_file, engine='openpyxl')
            return df.to_dict('records')
        except Exception as e:
            logging.error(f"Error reading allergens: {e}")
            return []
    
    def add_allergen(self, allergen, severity='medium'):
        """Add user allergen"""
        try:
            df = pd.read_excel(self.allergens_file, engine='openpyxl')
            new_row = {
                'allergen': allergen,
                'severity': severity,
                'date_added': datetime.now().strftime('%Y-%m-%d')
            }
            df = pd.concat([df, pd.DataFrame([new_row])], ignore_index=True)
            df.to_excel(self.allergens_file, index=False, engine='openpyxl')
            return True
        except Exception as e:
            logging.error(f"Error adding allergen: {e}")
            return False
    
    def get_warranty_items(self):
        """Get warranty items"""
        try:
            df = pd.read_excel(self.warranty_file, engine='openpyxl')
            return df.to_dict('records')
        except Exception as e:
            logging.error(f"Error reading warranty items: {e}")
            return []
    
    def generate_restock_suggestions(self, order_history):
        """Generate restocking suggestions based on order history"""
        try:
            # Analyze order patterns and suggest restocking
            suggestions = []
            
            # Simple logic - can be enhanced with ML
            frequent_items = {}
            for order in order_history:
                for item in order.get('items', []):
                    product_name = item.get('product_name', '')
                    if product_name in frequent_items:
                        frequent_items[product_name] += 1
                    else:
                        frequent_items[product_name] = 1
            
            # Get top 5 frequently ordered items
            for item, count in sorted(frequent_items.items(), key=lambda x: x[1], reverse=True)[:5]:
                suggestions.append({
                    'product_name': item,
                    'frequency': count,
                    'suggestion': f'Consider restocking {item} (ordered {count} times)'
                })
            
            return suggestions
        except Exception as e:
            logging.error(f"Error generating restock suggestions: {e}")
            return []
    
    def get_nutrition_highlights(self):
        """Get nutrition-based product highlights and recommendations"""
        try:
            products_df = pd.read_excel('products.xlsx', engine='openpyxl')
            pantry_df = pd.read_excel(self.pantry_file, engine='openpyxl')
            
            # Define nutrition categories and their benefits
            nutrition_categories = {
                'High Protein': {
                    'keywords': ['protein'],
                    'benefits': 'Essential for muscle building and repair',
                    'recommendation': 'Great for post-workout recovery',
                    'icon': 'fas fa-dumbbell',
                    'color': 'success'
                },
                'Rich in Calcium': {
                    'keywords': ['calcium'],
                    'benefits': 'Supports strong bones and teeth',
                    'recommendation': 'Important for growing children and seniors',
                    'icon': 'fas fa-bone',
                    'color': 'primary'
                },
                'High Fiber': {
                    'keywords': ['fiber'],
                    'benefits': 'Aids digestion and heart health',
                    'recommendation': 'Helps maintain healthy weight',
                    'icon': 'fas fa-leaf',
                    'color': 'warning'
                },
                'Vitamin Rich': {
                    'keywords': ['vitamin'],
                    'benefits': 'Boosts immune system and energy',
                    'recommendation': 'Essential for daily wellness',
                    'icon': 'fas fa-shield-virus',
                    'color': 'info'
                },
                'Iron Source': {
                    'keywords': ['iron'],
                    'benefits': 'Prevents anemia and boosts energy',
                    'recommendation': 'Especially important for women',
                    'icon': 'fas fa-battery-full',
                    'color': 'danger'
                }
            }
            
            nutrition_highlights = []
            
            # Analyze pantry items for nutrition content
            for _, item in pantry_df.iterrows():
                item_dict = item.to_dict()
                
                # Check nutrition fields (nutrition_a, nutrition_b, nutrition_c)
                nutrition_text = ''
                for field in ['nutrition_a', 'nutrition_b', 'nutrition_c']:
                    if pd.notna(item.get(field)) and str(item.get(field)).strip():
                        nutrition_text += str(item.get(field)).lower() + ' '
                
                if nutrition_text:
                    for category, info in nutrition_categories.items():
                        for keyword in info['keywords']:
                            if keyword in nutrition_text:
                                highlight = {
                                    'product_name': item_dict.get('product_name', ''),
                                    'category': category,
                                    'benefits': info['benefits'],
                                    'recommendation': info['recommendation'],
                                    'icon': info['icon'],
                                    'color': info['color'],
                                    'nutrition_details': nutrition_text.strip(),
                                    'photo': item_dict.get('photo', ''),
                                    'description': item_dict.get('description', ''),
                                    'missing_nutrients': self._get_missing_nutrients(category, nutrition_text.strip())
                                }
                                nutrition_highlights.append(highlight)
                                break  # Only add one category per item
                        if len([h for h in nutrition_highlights if h['product_name'] == item_dict.get('product_name', '')]) > 0:
                            break  # Move to next item if already added
            
            # Limit to top 6 items to avoid overwhelming the user
            return nutrition_highlights[:6]
            
        except Exception as e:
            logging.error(f"Error getting nutrition highlights: {e}")
            return []
    
    def add_order_items_to_pantry(self, order_items):
        """Add ordered items to pantry automatically"""
        try:
            from datetime import datetime, timedelta
            
            for item in order_items:
                # Calculate expiry date based on product type
                product_name = item.get('product_name', '')
                category = 'Grocery'  # Default category
                
                # Determine category and default expiry
                if any(keyword in product_name.lower() for keyword in ['milk', 'dairy', 'cheese', 'yogurt']):
                    category = 'Dairy'
                    expiry_days = 7
                elif any(keyword in product_name.lower() for keyword in ['bread', 'bakery']):
                    category = 'Bakery'
                    expiry_days = 5
                elif any(keyword in product_name.lower() for keyword in ['meat', 'chicken', 'beef']):
                    category = 'Meat'
                    expiry_days = 3
                elif any(keyword in product_name.lower() for keyword in ['fruit', 'apple', 'banana']):
                    category = 'Fruit'
                    expiry_days = 7
                elif any(keyword in product_name.lower() for keyword in ['vegetable', 'carrot', 'lettuce']):
                    category = 'Vegetable'
                    expiry_days = 5
                else:
                    expiry_days = 30  # Default for non-perishables
                
                # Create pantry item data
                pantry_item = {
                    'barcode': '',
                    'product_name': product_name,
                    'photo': item.get('image', ''),
                    'price': item.get('price', 0),
                    'category': category,
                    'storage_tags': self._get_storage_tag(category),
                    'expiry_date': (datetime.now() + timedelta(days=expiry_days)).strftime('%Y-%m-%d'),
                    'quantity': item.get('quantity', 1),
                    'unit': 'pcs',
                    'description': f"Added from order",
                    'nutrition_a': '',
                    'nutrition_b': '',
                    'nutrition_c': '',
                    'allergens': '',
                    'disposal_methods': 'standard',
                    'donate_option': 'Food bank',
                    'warranty': '',
                    'restock_description': f"Popular item - {product_name}",
                    'restock_days': expiry_days
                }
                
                self.add_pantry_item(pantry_item)
                
            return True
        except Exception as e:
            logging.error(f"Error adding order items to pantry: {e}")
            return False

    def remove_pantry_item(self, product_name):
        """Remove item from pantry"""
        try:
            df = pd.read_excel(self.pantry_file, engine='openpyxl')
            
            # Find the item to remove
            item_index = df[df['product_name'] == product_name].index
            
            if len(item_index) == 0:
                return False  # Item not found
            
            # Remove the item (remove first occurrence if multiple exist)
            df = df.drop(item_index[0])
            
            # Save back to file
            df.to_excel(self.pantry_file, index=False, engine='openpyxl')
            
            return True
            
        except Exception as e:
            logging.error(f"Error removing pantry item: {e}")
            return False
    
    def _get_storage_tag(self, category):
        """Get appropriate storage tag based on category"""
        storage_map = {
            'Dairy': 'Refrigerator',
            'Meat': 'Freezer',
            'Fruit': 'Counter',
            'Vegetable': 'Refrigerator',
            'Bakery': 'Pantry',
            'Electronics': 'Shelf'
        }
        return storage_map.get(category, 'Pantry')
    
    def _get_missing_nutrients(self, category, nutrition_text):
        """Get missing nutrients based on nutrition category"""
        missing_nutrients_map = {
            'High Protein': {
                'beneficial': ['iron', 'b12', 'zinc', 'vitamin b6']
            },
            'Rich in Calcium': {
                'beneficial': ['magnesium', 'phosphorus', 'vitamin d', 'vitamin k']
            },
            'High Fiber': {
                'beneficial': ['prebiotics', 'potassium', 'magnesium', 'vitamin c']
            },
            'Vitamin Rich': {
                'beneficial': ['antioxidants', 'beta carotene', 'folate', 'omega-3']
            },
            'Iron Source': {
                'beneficial': ['vitamin c', 'b12', 'folate', 'copper']
            }
        }
        
        if category not in missing_nutrients_map:
            return ''
        
        category_nutrients = missing_nutrients_map[category]
        missing = []
        
        # Check for missing beneficial nutrients
        for nutrient in category_nutrients['beneficial']:
            if nutrient not in nutrition_text.lower():
                missing.append(nutrient.title())
        
        # Limit to 3 missing nutrients to keep display clean
        if missing:
            return ', '.join(missing[:3])
        
        return ''
