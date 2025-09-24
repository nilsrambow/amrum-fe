# amrum-fe

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Run your unit tests
```
npm run test:unit
```

### Run your end-to-end tests
```
npm run test:e2e
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

## Authentication

The frontend now includes authentication and authorization features:

### Features
- **Login/Logout**: Secure authentication using bearer tokens
- **Route Protection**: All admin routes require authentication
- **Token Management**: Automatic token storage and refresh handling
- **Guest Access**: Guest booking routes remain accessible without authentication

### Authentication Flow
1. Users are redirected to `/login` if not authenticated
2. Login form submits credentials to `/auth/login` endpoint
3. Bearer token is stored in localStorage
4. All API requests include the token automatically
5. 401 responses trigger automatic logout and redirect

### API Integration
- **Login Endpoint**: `POST /auth/login` with `{username, password}`
- **Token Storage**: Bearer tokens stored in localStorage
- **Automatic Headers**: All requests include `Authorization: Bearer <token>`
- **Error Handling**: 401 responses clear tokens and redirect to login

### Components
- `LoginView.vue`: Login form with validation and error handling
- `useAuth.ts`: Composable for authentication state management
- `AuthService`: API service for login/logout operations
