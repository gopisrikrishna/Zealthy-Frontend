# Zealthy Frontend

React frontend for:

- Mini EMR at `/admin`
- Patient portal at `/`, `/portal`

## Setup

Copy env config:

```powershell
Copy-Item .env.example .env.development
```

Install and run:

```powershell
npm install
npm start
```

## Environment Variables

`REACT_APP_API_BASE_URL`

- Example: `http://localhost:8080`
- Used by `src/services/httpClient.js`
- All relative API paths are prefixed with this URL

## Routes

- `/` patient login
- `/portal` patient summary
- `/portal/appointments` patient appointments (next 3 months)
- `/portal/prescriptions` patient prescriptions (next 3 months)
- `/admin` users CRUD list view
- `/admin/users/:id` patient record with appointments/prescriptions CRUD
