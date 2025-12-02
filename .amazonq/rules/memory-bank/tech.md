# Technology Stack

## Programming Languages
- **JavaScript (Node.js)**: Backend server and API development
- **HTML/CSS**: Frontend markup and styling
- **EJS**: Server-side templating engine
- **SQL**: Database queries and data manipulation

## Backend Technologies
- **Node.js**: Runtime environment
- **Express.js v4.18.2**: Web application framework
- **body-parser v1.20.2**: HTTP request body parsing middleware
- **node-adodb v5.0.3**: Microsoft Access database connectivity

## Frontend Technologies
- **EJS v3.1.9**: Embedded JavaScript templating
- **Vanilla JavaScript**: Client-side interactivity
- **CSS3**: Styling and responsive design
- **AJAX**: Asynchronous API communication

## Database
- **Microsoft Access**: Production data storage via ADODB connection
- **JSON Files**: Comment persistence and configuration storage

## Development Tools
- **nodemon v3.0.1**: Development server with auto-restart
- **npm**: Package management and script execution
- **Git**: Version control (configured with .gitignore)

## Build System & Dependencies
- **Package Manager**: npm with package-lock.json for dependency locking
- **Entry Point**: server.js as main application file
- **Static Assets**: Express static middleware for public folder serving

## Development Commands
```bash
# Start production server
npm start

# Start development server with auto-reload
npm run dev

# Run database export test
npm run test-export
```

## Environment Requirements
- Node.js runtime environment
- Microsoft Access database connectivity (Windows environment)
- Port 3000 availability for local development
- ADODB drivers for database access

## Configuration Management
- Environment-specific settings in config.js
- Database connection strings and paths
- Application port and middleware configuration