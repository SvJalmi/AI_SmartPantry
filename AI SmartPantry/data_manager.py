import pandas as pd
import os
from datetime import datetime
import logging

class DataManager:
    def __init__(self):
        self.products_file = 'products.xlsx'
        self.orders_file = 'orders.xlsx'
        self.initialize_files()
    
    def initialize_files(self):
        """Initialize Excel files with sample data if they don't exist"""
        try:
            # Initialize products file
            if not os.path.exists(self.products_file):
                products_data = {
                    'id': [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
                    'name': ['Organic Apples', 'Fresh Bananas', 'Whole Milk', 'Bread Loaf', 'Chicken Breast', 
                            'Laptop Computer', 'Smartphone', 'Wireless Headphones', 'Tablet', 'Smart TV'],
                    'price': [4.99, 2.99, 3.49, 2.79, 8.99, 899.99, 599.99, 149.99, 299.99, 499.99],
                    'description': [
                        'Fresh organic apples, perfect for snacking',
                        'Sweet ripe bananas, great source of potassium',
                        'Fresh whole milk, rich in calcium and vitamins',
                        'Freshly baked whole wheat bread loaf',
                        'Premium chicken breast, high in protein',
                        'High-performance laptop for work and gaming',
                        'Latest smartphone with advanced camera features',
                        'Premium wireless headphones with noise cancellation',
                        'Lightweight tablet perfect for reading and browsing',
                        '55-inch Smart TV with 4K Ultra HD display'
                    ],
                    'stock': [50, 40, 25, 30, 20, 8, 15, 12, 10, 5],
                    'image': ['apple.svg', 'banana.svg', 'milk.svg', 'bread.svg', 'chicken.svg',
                             'laptop.svg', 'smartphone.svg', 'headphones.svg', 'tablet.svg', 'tv.svg'],
                    'category': ['Grocery', 'Grocery', 'Grocery', 'Grocery', 'Grocery',
                                'Electronics', 'Electronics', 'Electronics', 'Electronics', 'Electronics']
                }
                df = pd.DataFrame(products_data)
                df.to_excel(self.products_file, index=False, engine='openpyxl')
                logging.info("Created products.xlsx with sample data")
            
            # Initialize orders file
            if not os.path.exists(self.orders_file):
                orders_data = {
                    'order_id': [],
                    'product_name': [],
                    'quantity': [],
                    'price': [],
                    'total': [],
                    'order_date': []
                }
                df = pd.DataFrame(orders_data)
                df.to_excel(self.orders_file, index=False, engine='openpyxl')
                logging.info("Created orders.xlsx")
                
        except Exception as e:
            logging.error(f"Error initializing files: {e}")
    
    def get_products(self):
        """Retrieve all products from Excel file"""
        try:
            df = pd.read_excel(self.products_file, engine='openpyxl')
            return df.to_dict('records')
        except Exception as e:
            logging.error(f"Error reading products: {e}")
            return []
    
    def get_orders(self):
        """Retrieve all orders from Excel file grouped by order_id"""
        try:
            logging.debug(f"Reading orders from {self.orders_file}")
            df = pd.read_excel(self.orders_file, engine='openpyxl')
            logging.debug(f"Read {len(df)} rows from orders file")
            
            if df.empty:
                logging.debug("Orders dataframe is empty")
                return []
            
            # Ensure order_id column exists and convert to numeric
            if 'order_id' not in df.columns:
                logging.error("order_id column not found in orders file")
                return []
                
            # Group orders by order_id
            orders = []
            order_groups = df.groupby('order_id')
            logging.debug(f"Found {len(order_groups)} unique orders")
            
            for order_id, group in order_groups:
                logging.debug(f"Processing order {order_id}")
                order_total = group['total'].sum()
                order_date = group['order_date'].iloc[0]
                
                items = []
                for _, item in group.iterrows():
                    items.append({
                        'product_name': item['product_name'],
                        'quantity': int(item['quantity']),
                        'price': float(item['price']),
                        'total': float(item['total'])
                    })
                
                orders.append({
                    'order_id': int(order_id),
                    'items': items,
                    'total': float(order_total),
                    'order_date': order_date
                })
            
            # Sort by order_id descending (newest first)
            orders.sort(key=lambda x: x['order_id'], reverse=True)
            logging.debug(f"Returning {len(orders)} orders")
            return orders
            
        except Exception as e:
            logging.error(f"Error reading orders: {e}")
            import traceback
            logging.error(traceback.format_exc())
            return []
    
    def create_order(self, cart):
        """Create a new order from cart items"""
        try:
            # Generate order ID
            existing_orders = self.get_orders()
            order_id = len(existing_orders) + 1
            
            # Read existing orders
            try:
                df = pd.read_excel(self.orders_file, engine='openpyxl')
            except:
                df = pd.DataFrame(columns=['order_id', 'product_name', 'quantity', 'price', 'total', 'order_date'])
            
            # Add cart items to orders
            order_date = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            
            for item in cart.values():
                new_row = {
                    'order_id': order_id,
                    'product_name': item['name'],
                    'quantity': item['quantity'],
                    'price': item['price'],
                    'total': item['price'] * item['quantity'],
                    'order_date': order_date
                }
                df = pd.concat([df, pd.DataFrame([new_row])], ignore_index=True)
            
            # Save to Excel
            df.to_excel(self.orders_file, index=False, engine='openpyxl')
            logging.info(f"Created order {order_id}")
            return order_id
            
        except Exception as e:
            logging.error(f"Error creating order: {e}")
            return None
