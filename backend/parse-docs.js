const https = require('https');

https.get('https://calorieapi.com/docs', (res) => {
  let data = '';
  res.on('data', chunk => {
    data += chunk;
  });
  res.on('end', () => {
    // Find all strings looking like URLs or endpoints
    const regex = /https:\/\/[^\s"'<>]+/g;
    const urls = data.match(regex) || [];
    const uniqueUrls = [...new Set(urls)];
    
    console.log("URLs found in docs:");
    uniqueUrls.filter(u => u.includes('api')).forEach(u => console.log(u));
    
    // Also look for endpoint paths
    const pathRegex = /\/api\/v[0-9]\/[a-zA-Z0-9\/\-]+/g;
    const paths = data.match(pathRegex) || [];
    const uniquePaths = [...new Set(paths)];
    
    console.log("\nPaths found:");
    uniquePaths.forEach(p => console.log(p));
  });
}).on('error', err => {
  console.error("Error fetching docs:", err);
});
