# Technology Stack

## Programming Languages
- **JavaScript (Node.js)** - Backend server and API development
- **JavaScript (ES6+)** - Frontend client-side functionality
- **HTML5** - Markup structure
- **CSS3** - Styling and responsive design
- **EJS** - Server-side templating engine

## Backend Technologies
- **Node.js** - Runtime environment
- **Express.js ^4.18.2** - Web application framework
- **node-adodb ^5.0.3** - DB2 database connectivity
- **body-parser ^1.20.2** - HTTP request body parsing
- **EJS ^3.1.9** - Embedded JavaScript templating

## Database
- **IBM DB2** - Production data storage
- **JSON Files** - Configuration and user data storage
  - Comments, estimated quantities, plan data, holidays, work days

## Development Tools
- **nodemon ^3.0.1** - Development server with auto-restart
- **npm** - Package management

## Frontend Libraries
- **Vanilla JavaScript** - No external frameworks, pure JS implementation
- **CSS Grid & Flexbox** - Modern layout systems
- **Custom Chart Library** - Proprietary chart rendering system

## Build System
- **npm scripts** - Simple build and development commands
  - `npm start` - Production server start
  - `npm run dev` - Development server with auto-reload

## Development Commands

### Installation
```bash
npm install
```

### Development
```bash
npm run dev  # Start development server with nodemon
```

### Production
```bash
npm start    # Start production server
```

## Database Configuration
- **Provider**: IBMDA400.DataSource
- **Connection**: DB2 system via ODBC
- **Authentication**: Username/password based
- **Data Source**: WAVEDLIB database

## Performance Features
- **Data Caching**: Intelligent caching system with auto-refresh
- **Lazy Loading**: On-demand data loading for large datasets
- **Compression**: Efficient data transfer and storage
- **Connection Pooling**: Optimized database connections

## Security Considerations
- **Input Validation**: Server-side validation for all API inputs
- **SQL Injection Prevention**: Parameterized queries
- **File System Security**: Controlled file access and validation
- **Error Handling**: Comprehensive error management without data exposure