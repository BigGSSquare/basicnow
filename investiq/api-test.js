// Simple debugging script to test API connection
const API_KEY = "BE5YYDDASQVMZ9ON";
const symbol = "AAPL"; // Test with a known symbol

// Construct the API URL exactly as shown in documentation
const API_URL = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`;

// Log the URL we're trying to access
console.log("Testing API URL:", API_URL);

// Make the fetch request
fetch(API_URL)
  .then((response) => {
    console.log("Response status:", response.status);
    console.log("Response headers:", [...response.headers.entries()]);
    return response.json();
  })
  .then((data) => {
    console.log("Complete API response:", data);

    // Check if the response has the expected structure
    if (data["Global Quote"] && Object.keys(data["Global Quote"]).length > 0) {
      console.log("SUCCESS: Valid Global Quote data received");
      console.log("Stock Price:", data["Global Quote"]["05. price"]);
      console.log(
        "Change Percent:",
        data["Global Quote"]["10. change percent"]
      );
    } else {
      console.log("ERROR: Invalid or empty Global Quote data");
      console.log("API returned:", data);

      // Check for specific error messages
      if (data.Note) {
        console.log("API limit message:", data.Note);
      } else if (data["Error Message"]) {
        console.log("API error message:", data["Error Message"]);
      }
    }
  })
  .catch((error) => {
    console.error("Fetch error:", error);
  });
