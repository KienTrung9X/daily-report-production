# Technology Stack

## Programming Languages
- **JavaScript (Node.js)**: Backend server and API logic
- **JavaScript (ES6+)**: Frontend client application
- **HTML5**: Page structure via EJS templates
- **CSS3**: Styling and responsive design

## Backend Technologies

### Runtime & Framework
- **Node.js**: JavaScript runtime environment
- **Express.js v4.18.2**: Web application framework
  - Routing and middleware
  - Static file serving
  - RESTful API endpoints

### Template Engine
- **EJS v3.1.9**: Embedded JavaScript templates
  - Server-side rendering
  - Dynamic HTML generation

### Database & Data Access
- **node-adodb v5.0.3**: Access database connector
  - ADODB connection for legacy Access databases
  - SQL query execution
  - Windows-specific dependency

### Middleware
- **body-parser v1.20.2**: Request body parsing
  - JSON payload parsing
  - URL-encoded form data

### Development Tools
- **nodemon v3.0.1**: Development server with auto-reload
  - File watching
  - Automatic server restart on changes

## Frontend Technologies

### Core Technologies
- **Vanilla JavaScript**: No framework dependencies
- **Fetch API**: HTTP requests to backend
- **DOM Manipulation**: Direct DOM API usage

### UI Components
- Custom tab navigation system
- Dynamic table generation
- Calendar view rendering
- Modal dialogs for data entry

### Styling Approach
- Custom CSS (no frameworks)
- Sticky positioning for table headers/columns
- Responsive design patterns
- Color-coded status indicators

## Data Storage

### Primary Database
- **Microsoft Access Database**: Production data source
  - Legacy system integration
  - ADODB connection via COM

### File-based Storage
- **JSON Files**: Application data persistence
  - comments.json
  - est_qty.json
  - plan_data.json
  - work_days.json
  - holidays.json
  - production_data.json (cache)

## Development Setup

### Prerequisites
- Node.js (v14+ recommended)
- Windows OS (required for node-adodb)
- Microsoft Access Database Engine
- Access database file with production data

### Installation
```bash
npm install
```

### Configuration
1. Copy `config.js` to `user-config.js`
2. Update database path in `user-config.js`
3. Ensure Access database is accessible

### Running the Application

**Development Mode** (with auto-reload):
```bash
npm run dev
```

**Production Mode**:
```bash
npm start
```

Server starts on random available port (PORT=0), actual port logged to console.

### Project Scripts
- `npm start`: Run server with node
- `npm run dev`: Run server with nodemon (auto-reload)

## Dependencies

### Production Dependencies
```json
{
  "express": "^4.18.2",
  "body-parser": "^1.20.2",
  "ejs": "^3.1.9",
  "node-adodb": "^5.0.3"
}
```

### Development Dependencies
```json
{
  "nodemon": "^3.0.1"
}
```

## Build & Deployment

### No Build Step Required
- Pure Node.js application
- No transpilation or bundling
- Static assets served directly

### Deployment Considerations
- Windows server required (node-adodb dependency)
- Access database must be accessible
- File system write permissions for JSON files
- Port configuration via environment variable

## API Architecture

### RESTful Endpoints
- `GET /` - Main dashboard page
- `GET /api/production` - Production data with caching
- `GET /api/dashboard/calendar` - Calendar view data
- `GET /api/data` - Legacy production data endpoint
- `POST /api/est-qty` - Save manual estimated quantity
- `POST /api/plan-import` - Import plan data
- `GET /api/plan-data` - Retrieve plan data
- `GET /api/work-days` - Retrieve work days
- `GET /api/est-qty` - Retrieve estimated quantities
- `POST /api/comments` - Save comments
- `POST /api/plan-clear` - Clear all plan data
- `POST /api/plan-edit` - Edit plan quantity
- `POST /api/workday-edit` - Edit work days
- `POST /api/workdays-bulk` - Bulk edit work days
- `GET /api/holidays` - Retrieve holidays
- `POST /api/holidays` - Add holiday
- `DELETE /api/holidays/:date` - Delete holiday
- `GET /api/export-csv` - Export data to CSV

### Data Format
- Request: JSON or URL-encoded
- Response: JSON with data and summary objects
- Date format: YYYYMMDD (string)
- Month format: YYYYMM (string)

## Performance Optimizations

### Caching Strategy
- In-memory data cache (data-cache.js)
- Auto-refresh mechanism
- Cache-first data retrieval
- Reduces database query frequency

### Frontend Optimizations
- Minimal external dependencies
- Direct DOM manipulation
- Efficient table rendering
- Lazy loading of data

## Browser Compatibility
- Modern browsers (Chrome, Firefox, Edge, Safari)
- ES6+ JavaScript features
- Fetch API support required
- CSS Grid and Flexbox support
