const mode = process.argv.includes('--production') ? 'production' : process.env.NODE_ENV || 'development';

const requiredForProduction = ['VITE_API_URL'];
const missing = mode === 'production'
  ? requiredForProduction.filter((name) => !process.env[name] || process.env[name].includes('your-'))
  : [];

if (missing.length > 0) {
  console.error(`Missing required production client env vars: ${missing.join(', ')}`);
  process.exit(1);
}

if (process.env.VITE_API_URL && !/^https?:\/\/.+\/api\/?$/.test(process.env.VITE_API_URL)) {
  console.error('VITE_API_URL must be an absolute URL ending with /api');
  process.exit(1);
}

console.log(`Client env check passed for ${mode}`);
