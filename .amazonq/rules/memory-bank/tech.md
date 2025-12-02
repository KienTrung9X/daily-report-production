# Technology Stack

## Programming Languages
- **JavaScript (Node.js)**: Server-side application development
- **HTML/CSS**: Frontend markup and styling
- **EJS**: Server-side templating engine
- **SQL**: Database queries for DB2 integration

## Backend Technologies

### Runtime Environment
- **Node.js**: JavaScript runtime for server-side execution
- **Express.js 4.18.2**: Web application framework for API and routing

### Database Integration
- **IBM DB2**: Production database system
- **node-adodb 5.0.3**: DB2 connectivity driver for Node.js
- **IBMDA400.DataSource**: OLE DB provider for DB2 access

### Middleware & Utilities
- **body-parser 1.20.2**: HTTP request body parsing
- **path**: File system path utilities
- **fs**: File system operations for JSON data persistence

## Frontend Technologies

### Template Engine
- **EJS 3.1.9**: Embedded JavaScript templates for dynamic HTML

### Client-Side Libraries
- **Vanilla JavaScript**: DOM manipulation and AJAX requests
- **CSS3**: Modern styling with flexbox and grid layouts
- **Responsive Design**: Mobile-friendly interface design

## Development Tools

### Package Management
- **npm**: Node.js package manager
- **package.json**: Dependency management and scripts
- **package-lock.json**: Exact dependency version locking

### Development Scripts
```json
{
  "start": "node server.js",
  "dev": "nodemon server.js"
}
```

### Development Dependencies
- **nodemon 3.0.1**: Automatic server restart during development

## Database Configuration

### Connection Parameters
- **Provider**: IBMDA400.DataSource (IBM DB2 OLE DB provider)
- **Hostname**: 10.247.194.1 (Production DB2 server)
- **Database**: WAVEDLIB (Production database schema)
- **Authentication**: Username/password based access

### Query Optimization
- **Row Limiting**: Configurable maximum record retrieval (default: 10M)
- **Date Filtering**: Month-based data partitioning
- **Line Filtering**: Production line specific queries

## File System Architecture

### Static Assets
- **public/css/**: Stylesheet organization
- **public/js/**: Client-side JavaScript modules

### Data Persistence
- **JSON Files**: Local file-based storage for:
  - comments.json: User comments and notes
  - est_qty.json: Manual quantity estimations
  - plan_data.json: Imported production plans
  - work_days.json: Working day configurations

### Configuration Management
- **config.js**: Database connection settings
- **user-config.js**: User-configurable application parameters

## Development Commands

### Installation
```bash
npm install                 # Install all dependencies
```

### Development
```bash
npm run dev                # Start with nodemon (auto-restart)
npm start                  # Production start
```

### Server Configuration
- **Port**: 3000 (configurable)
- **Static Files**: Served from /public directory
- **View Engine**: EJS with /views directory

## API Architecture

### RESTful Endpoints
- **GET /api/production**: Main production data API
- **GET /api/dashboard/calendar**: Calendar view data
- **POST /api/est-qty**: Manual quantity estimation updates
- **POST /api/plan-import**: Production plan data import
- **POST /api/comments**: Comment management

### Response Format
```javascript
{
  data: [...],           // Main data array
  summary: {             // Aggregated statistics
    totalPlan: "...",
    totalAct: "...",
    totalPercent: "..."
  }
}
```

## Performance Considerations

### Database Optimization
- Configurable row limits to prevent memory issues
- Date-based query filtering for efficient data retrieval
- Connection pooling through node-adodb

### Frontend Optimization
- Static asset caching through Express
- Minimal JavaScript dependencies
- Efficient DOM manipulation patterns

### Memory Management
- JSON file-based persistence for lightweight data storage
- Streaming data processing for large datasets
- Garbage collection friendly object patterns