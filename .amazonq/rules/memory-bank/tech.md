# Technology Stack

## Backend Technologies
- **Node.js**: JavaScript runtime environment
- **Express.js 4.18.2**: Web application framework
- **EJS 3.1.9**: Embedded JavaScript templating engine
- **body-parser 1.20.2**: HTTP request body parsing middleware
- **node-adodb 5.0.3**: Microsoft Access database connectivity

## Frontend Technologies
- **Vanilla JavaScript**: Core client-side functionality
- **CSS3**: Modern styling with Grid and Flexbox
- **HTML5**: Semantic markup structure
- **Chart Libraries**: Custom sparkline and chart implementations

## Development Tools
- **nodemon 3.0.1**: Development server with auto-restart
- **npm**: Package management and script execution

## Database
- **Microsoft Access**: Production data storage via ADODB connection

## File System
- **JSON**: Configuration and user data persistence
- **CSV**: Data export functionality

## Development Commands

### Installation
```bash
npm install
```

### Development Mode
```bash
npm run dev
# Starts server with nodemon for auto-restart on file changes
```

### Production Mode
```bash
npm start
# Starts server with node server.js
```

## Environment Configuration
- **PORT**: Server port (defaults to dynamic allocation if not set)
- **Database Connection**: Configured via config.js
- **Static Assets**: Served from public/ directory
- **Views**: EJS templates in views/ directory

## Performance Features
- **Data Caching**: Automatic cache refresh for current month data
- **Static File Serving**: Optimized asset delivery
- **JSON File Storage**: Fast configuration access
- **Lazy Loading**: On-demand data fetching for historical periods