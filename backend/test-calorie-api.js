const axios = require('axios');

async function test() {
  try {
    const response = await axios.get('https://api.calorieapi.com/api/v1/search', {
      params: { q: 'apple' },
      headers: { 'X-API-Key': 'fn_7agp5S4c062CyUFrwqW1MkhufcobL9jVavK2e955kS0' }
    });
    console.log("SUCCESS");
    console.log(response.data);
  } catch (error) {
    console.log("ERROR");
    console.error(error.message);
    if (error.response) console.log(error.response.data);
  }
}
test();
