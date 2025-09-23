# Production Deployment Security Guide

## Security Fixes Applied ✅

All critical security vulnerabilities have been fixed:

1. **✅ Debug Mode**: Now environment-based (`DEBUG=False` in production)
2. **✅ JWT Cookie Security**: Environment-based secure settings
3. **✅ Debug Endpoint**: Commented out (can be uncommented for local dev)
4. **✅ CORS Configuration**: Environment-based origins
5. **✅ JWT Fallback Secret**: Removed, now required
6. **✅ Console Logs**: Commented out in frontend
7. **✅ Database URL Logging**: Commented out
8. **✅ Production Config**: Created separate config classes

## Environment Variables for Production

Create a `.env` file in your backend directory with these variables:

```bash
# Flask Configuration
DEBUG=False
FLASK_ENV=production

# Security Keys (REQUIRED - Generate strong random strings)
SECRET_KEY=your-super-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-key-here

# JWT Cookie Security (Production settings)
JWT_COOKIE_SECURE=True

# Database Configuration
DATABASE_URL=postgresql://username:password@host:port/database_name

# CORS Configuration (Set to your production frontend domain)
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
SOCKETIO_CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# OpenAI Configuration
OPENAI_API_KEY=your-openai-api-key

# Plaid Configuration
PLAID_CLIENT_ID=your-plaid-client-id
PLAID_SECRET=your-plaid-secret
PLAID_ENV=production
PLAID_WEBHOOK_URL=https://yourdomain.com/plaid/webhook

# Server Configuration
PORT=5001
```

## Local Development Environment Variables

For local development, use these settings:

```bash
# Flask Configuration
DEBUG=True
FLASK_ENV=development

# Security Keys
SECRET_KEY=your-dev-secret-key
JWT_SECRET_KEY=your-dev-jwt-secret-key

# JWT Cookie Security (Development settings)
JWT_COOKIE_SECURE=False

# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/database_name

# CORS Configuration (Local development)
CORS_ORIGINS=http://localhost:5173
SOCKETIO_CORS_ORIGINS=*

# OpenAI Configuration
OPENAI_API_KEY=your-openai-api-key

# Plaid Configuration
PLAID_CLIENT_ID=your-plaid-client-id
PLAID_SECRET=your-plaid-secret
PLAID_ENV=sandbox
PLAID_WEBHOOK_URL=http://localhost:5001/plaid/webhook

# Server Configuration
PORT=5001
```

## Configuration Classes

The app now supports different configuration classes:

- **`Config`**: Base configuration (environment-based)
- **`ProductionConfig`**: Production settings with enhanced security
- **`DevelopmentConfig`**: Development settings with relaxed security

## Security Checklist for Production

- [ ] Set `DEBUG=False`
- [ ] Set `JWT_COOKIE_SECURE=True`
- [ ] Set `CORS_ORIGINS` to your production domain
- [ ] Set `SOCKETIO_CORS_ORIGINS` to your production domain
- [ ] Use strong, unique `SECRET_KEY` and `JWT_SECRET_KEY`
- [ ] Set `PLAID_ENV=production`
- [ ] Use HTTPS in production
- [ ] Set up proper database with SSL
- [ ] Enable rate limiting
- [ ] Set up monitoring and logging
- [ ] Configure backup and recovery

## Switching Between Environments

### For Local Development:

- Use the development environment variables above
- Debug endpoint is commented out (uncomment if needed)
- Console logs are commented out (uncomment if needed)

### For Production:

- Use the production environment variables above
- Debug endpoint remains commented out
- Console logs remain commented out
- All security settings are enabled

## Additional Security Recommendations

1. **Use HTTPS**: Always use HTTPS in production
2. **Rate Limiting**: Implement rate limiting for API endpoints
3. **Input Validation**: Add comprehensive input validation
4. **Error Handling**: Implement generic error responses in production
5. **Monitoring**: Set up application monitoring and alerting
6. **Backup**: Regular database backups
7. **Updates**: Keep dependencies updated
8. **Secrets Management**: Use proper secrets management (AWS Secrets Manager, etc.)

## Debug Endpoint (Local Development Only)

If you need the debug endpoint for local development, uncomment it in:
`backend/app/plaid/routes.py` around line 434

```python
# Uncomment these lines for local development:
# @plaid_bp.route('/debug-transactions', methods=['GET'])
# @jwt_required()
# def debug_transactions():
#     # ... debug code ...
```

## Console Logs (Local Development Only)

If you need console logs for local development, uncomment them in the frontend files:

- `frontend/MintMind/src/components/onboarding/FinancialSlide.jsx`
- `frontend/MintMind/src/components/SignupModal.jsx`
- `frontend/MintMind/src/components/TransactionTable.jsx`
- `frontend/MintMind/src/services/api.js`
