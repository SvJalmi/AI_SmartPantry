# AI_SmartPantry
# E-Commerce Store

## Overview

This is a Flask-based e-commerce web application that allows users to browse products, add them to a shopping cart, and place orders. The application uses Excel files for data storage and provides a simple, responsive web interface built with Bootstrap.

## User Preferences

Preferred communication style: Simple, everyday language.
Product focus: Grocery and electronics items with visual product images.
Database preference: Excel files for easy data modification and inspection.

## System Architecture

### Frontend Architecture
- **Template Engine**: Jinja2 templates with Flask
- **CSS Framework**: Bootstrap 5 with dark theme
- **Icons**: Font Awesome 6.0
- **JavaScript**: Vanilla JavaScript for cart functionality and UI interactions
- **Responsive Design**: Mobile-first approach using Bootstrap grid system

### Backend Architecture
- **Web Framework**: Flask (Python)
- **Session Management**: Flask sessions for cart persistence
- **Data Layer**: Custom DataManager class for data operations
- **File Structure**: Modular approach with separate files for app logic, data management, and entry point

### Data Storage
- **Primary Storage**: Excel files (.xlsx format)
- **Data Processing**: Pandas library for Excel file operations
- **Files Used**:
  - `products.xlsx`: Product catalog with inventory
  - `orders.xlsx`: Order history and transaction records

## Key Components

### Application Core (`app.py`)
- Main Flask application with route handlers
- Session-based shopping cart management
- Error handling and logging
- Product catalog display and cart operations

### Data Management (`data_manager.py`)
- DataManager class for all data operations
- Excel file initialization with sample data
- CRUD operations for products and orders
- File-based persistence layer

### Templates
- **Base Template**: Common layout with navigation and Bootstrap integration
- **Index**: Product catalog with add-to-cart functionality
- **Cart**: Shopping cart view with quantity management
- **Orders**: Order history display

### Frontend Assets
- **JavaScript**: Cart count updates and UI interactions
- **Styling**: Bootstrap-based responsive design with dark theme

## Data Flow

1. **Product Display**: DataManager loads products from Excel → Flask routes serve data → Templates render product cards
2. **Cart Operations**: User actions → Flask session storage → Template updates → JavaScript cart count refresh
3. **Order Processing**: Cart data → DataManager writes to Excel → Order confirmation → Session cleanup
4. **Data Persistence**: All operations use Excel files as the primary data store via Pandas

## External Dependencies

### Python Packages
- **Flask**: Web framework and routing
- **Pandas**: Excel file operations and data manipulation
- **OpenPyXL**: Excel file format support (Pandas dependency)

### Frontend Libraries
- **Bootstrap 5**: CSS framework and components
- **Font Awesome 6**: Icon library
- **Bootstrap JavaScript**: Interactive components

### Development Tools
- **Logging**: Python logging module for debugging
- **Environment Variables**: OS environment for configuration

## Deployment Strategy

### Development Setup
- **Entry Point**: `main.py` runs Flask development server
- **Host Configuration**: 0.0.0.0:5000 for external access
- **Debug Mode**: Enabled for development with detailed error messages

### File Management
- **Data Files**: Excel files created automatically with sample data
- **Static Assets**: Served by Flask development server
- **Templates**: Jinja2 template rendering with Flask

### Session Management
- **Secret Key**: Environment variable or development default
- **Cart Persistence**: Server-side sessions for shopping cart state
- **Security**: Basic session-based state management

### Error Handling
- **Logging**: Comprehensive error logging throughout the application
- **User Feedback**: Flash messages for user notifications
- **Graceful Degradation**: Error recovery with empty states and retry options

## Recent Changes

### July 13, 2025
- **Smart Pantry Dashboard**: Implemented comprehensive pantry management system with:
  - Search and barcode scanning functionality (simulated camera)
  - Storage organization with tag-based filtering
  - Expiry tracking with use cases and disposal options
  - Allergen management and item highlighting
  - Warranty management for electronics with extension options
  - Restock suggestions based on order history
- **Automatic Pantry Integration**: Orders now automatically add items to pantry with smart expiry dates
- **Enhanced Product Data**: Extended product structure with photo, price, nutrition info, allergens, warranty details
- **Template Fixes**: Fixed Jinja2 template syntax errors and allergen data handling
- **View All Pantry Products Modal**: Added comprehensive modal with remove functionality and proper data cleaning
- **Order-Based Storage Organization**: Enhanced storage section with:
  - Order selection dropdown (defaults to latest order)
  - Smart product categorization by storage requirements
  - Filter by Refrigerator, Freezer, Pantry, Counter with visual icons
  - Automatic storage tag assignment based on product types
  - Educational storage tips instead of commercial elements
- **Use Quickly After Opening Section**: Added new dashboard section featuring:
  - Intelligent categorization of items requiring quick consumption
  - Category-based recommendations (Dairy: 3-5 days, Meat: 1-2 days, etc.)
  - Recipe ideas and storage tips for optimal freshness
  - Side-by-side layout with expiring items for better organization
- **Enhanced Expiring Items Visualization**: Improved expiry tracking with:
  - Visual progress bars showing time remaining until expiry
  - Urgency-based highlighting (critical ≤1 day, urgent ≤2 days)
  - Days remaining calculations with precise labeling
  - Color-coded badges and backgrounds for immediate recognition
  - Automatic sorting by urgency level
- **Comprehensive Allergy Management System**: Enhanced allergen selection and detection with:
  - Dropdown menu with 14 common allergens (Milk, Eggs, Peanuts, Tree Nuts, Soy, Wheat/Gluten, Fish, Shellfish, Sesame, Corn, Sulfites, Mustard, Celery, Lupin)
  - Custom allergen input option for unlisted allergens
  - Intelligent allergen matching with variant detection (e.g., "Milk" matches "Lactose", "Wheat" matches "Gluten")
  - Real-time pantry item highlighting for allergen-containing products
  - Improved user experience with automatic form reset and focus management

## Architecture Decisions

### Excel-Based Storage
- **Problem**: Need for simple data persistence without database complexity
- **Solution**: Excel files with Pandas for data operations
- **Pros**: Easy to inspect data, no database setup required, familiar format
- **Cons**: Limited scalability, no concurrent access protection, file locking issues

### Session-Based Cart
- **Problem**: Need to maintain cart state across requests
- **Solution**: Flask sessions for cart storage
- **Pros**: Simple implementation, no database required, automatic cleanup
- **Cons**: Server-side storage, limited to single server, session size limits

### Bootstrap Frontend
- **Problem**: Need responsive, modern UI without custom CSS development
- **Solution**: Bootstrap 5 with dark theme
- **Pros**: Rapid development, mobile responsive, consistent design
- **Cons**: Generic appearance, larger payload, dependency on CDN
