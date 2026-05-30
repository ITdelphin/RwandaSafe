// Set required environment variables for tests
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.JWT_SECRET = 'test-jwt-secret-that-is-at-least-32-chars!!';
process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret-32-chars!!!!!';
process.env.NODE_ENV = 'test';
