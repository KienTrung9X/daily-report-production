# Technology Stack

## Backend Technologies
- **Node.js**: JavaScript runtime environment
- **Express.js 4.18.2**: Web application framework for API and routing
- **EJS 3.1.9**: Embedded JavaScript templating engine for server-side rendering
- **node-adodb 5.0.3**: Database connectivity for Microsoft Access/SQL Server databases

## Frontend Technologies
- **Vanilla JavaScript**: Client-side scripting without frameworks
- **HTML5/CSS3**: Modern web standards for UI structure and styling
- **Chart.js/Canvas**: Data visualization and charting capabilities
- **Responsive CSS**: Mobile-first design approach

## Development Dependencies
- **nodemon 3.0.1**: Development server with automatic restart on file changes
- **body-parser 1.20.2**: HTTP request body parsing middleware

## Database Support
- **Microsoft Access**: Primary database connection via ADODB
- **SQL Server**: Enterprise database support through same connector
- **JSON Files**: Local data persistence for user configurations and overrides

## Development Commands

### Installation
```bash
npm install
```

### Development Mode
```bash
npm run dev
# Starts server with nodemon for auto-restart on changes
```

### Production Mode
```bash
npm start
# Starts server with node for production deployment
```

### Server Configuration
- **Port**: 3000 (configurable)
- **Static Files**: Served from `public/` directory
- **View Engine**: EJS templates from `views/` directory
- **Body Parsing**: JSON and URL-encoded form data support

## File System Requirements
- **Read/Write Access**: Required for JSON configuration files
- **Database Access**: ODBC connection to production database
- **Static Assets**: CSS, JavaScript, and image file serving

## Deployment Considerations
- **Windows Environment**: Optimized for Windows servers with Access database support
- **Network Access**: Requires database connectivity and web server ports
- **File Permissions**: Write access needed for configuration and data files