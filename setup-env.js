// setup-env.js
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('NeurOS Environment Setup');
console.log('-----------------------');
console.log('This script will help you set up your environment variables.');
console.log('');

rl.question('Enter your Google AI API key: ', (apiKey) => {
  const envContent = `# Google AI API key
GOOGLE_AI_API_KEY=${apiKey.trim()}

# Add other environment variables as needed
`;

  // Write to both .env and .env.local for flexibility
  try {
    fs.writeFileSync(path.join(__dirname, '.env'), envContent);
    console.log('✅ .env file created successfully');
  } catch (err) {
    console.error('Error creating .env file:', err);
  }
  
  try {
    fs.writeFileSync(path.join(__dirname, '.env.local'), envContent);
    console.log('✅ .env.local file created successfully');
  } catch (err) {
    console.error('Error creating .env.local file:', err);
  }

  console.log('\nSetup complete! You can now run your application.');
  rl.close();
}); 