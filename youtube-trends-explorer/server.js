const express = require('express');
const db = require('./db');  //Import the db module

const app = express();
const PORT = 5000;  //Port number where the backend server will run

//Function to start the app and initialize the database
async function startApp() {
  try {
    await db.initialize();  //Initialize database connection
    console.log('Database connection initialized');
    
    //Start the server only after the database is connected
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Error starting application', err);
    process.exit(1);  //Exit if there’s a connection issue
  }
}

startApp();  //Call this function to start the app

//Test route to verify database connection
app.get('/test-db', async (req, res) => {
  try {
    //Simple query to test the database connection
    const result = await db.simpleExecute('SELECT * FROM PerformanceMetrics FETCH FIRST 50 ROWS ONLY');
    res.json(result.rows);  //Send the result back as JSON
  } catch (error) {
    console.error('Error executing query:', error);
    res.status(500).json({ error: 'Database connection failed' });
  }
});
