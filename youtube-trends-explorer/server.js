const express = require('express');
const db = require('./db');  // Import the db module
const cors = require('cors');

const app = express();
const PORT = 5000;  // Port number where the backend server will run

// Middleware to handle CORS
app.use(cors());

// Function to start the app and initialize the database
async function startApp() {
  try {
    await db.initialize();  // Initialize database connection
    console.log('Database connection pool initialized');

    // Start the server only after the database is connected
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Error starting application', err);
    process.exit(1);  // Exit if there’s a connection issue
  }
}

startApp();  // Call this function to start the app

// Route to fetch trend data
app.get('/trends', async (req, res) => {
  const aggregation = req.query.aggregation;

  let query = '';
  if (aggregation === 'daily') {
    query = `SELECT TO_CHAR(timestamp, 'YYYY-MM-DD') AS PERIOD, 
                    AVG(views) AS AVGVIEWS, 
                    AVG(likes) AS AVGLIKES, 
                    AVG(dislikes) AS AVGDISLIKES, 
                    AVG(comments) AS AVGCOMMENTS 
             FROM PerformanceMetrics 
             GROUP BY TO_CHAR(timestamp, 'YYYY-MM-DD')
             ORDER BY TO_CHAR(timestamp, 'YYYY-MM-DD')`;
  } else if (aggregation === 'weekly') {
    query = `SELECT TO_CHAR(TRUNC(timestamp, 'IW'), 'YYYY-IW') AS PERIOD, 
                    AVG(views) AS AVGVIEWS, 
                    AVG(likes) AS AVGLIKES, 
                    AVG(dislikes) AS AVGDISLIKES, 
                    AVG(comments) AS AVGCOMMENTS 
             FROM PerformanceMetrics 
             GROUP BY TO_CHAR(TRUNC(timestamp, 'IW'), 'YYYY-IW')
             ORDER BY TO_CHAR(TRUNC(timestamp, 'IW'), 'YYYY-IW')`;
  } else if (aggregation === 'monthly') {
    query = `SELECT TO_CHAR(timestamp, 'YYYY-MM') AS PERIOD, 
                    AVG(views) AS AVGVIEWS, 
                    AVG(likes) AS AVGLIKES, 
                    AVG(dislikes) AS AVGDISLIKES, 
                    AVG(comments) AS AVGCOMMENTS 
             FROM PerformanceMetrics 
             GROUP BY TO_CHAR(timestamp, 'YYYY-MM')
             ORDER BY TO_CHAR(timestamp, 'YYYY-MM')`;
  }

  try {
    const result = await db.simpleExecute(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching trend data:', error);
    res.status(500).json({ error: 'Failed to fetch trend data', details: error.message });
  }
});

// Revised Route to fetch top videos data without nested aggregate function
app.get('/top-videos', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = 10;  // Number of records per page
  const offset = (page - 1) * pageSize;

  // Use a subquery to simplify aggregation and ordering
  const query = `
    SELECT ytvideoid, views, likes, dislikes, comments
    FROM (
      SELECT ytvideoid, 
             SUM(views) AS views, 
             SUM(likes) AS likes, 
             SUM(dislikes) AS dislikes, 
             SUM(comments) AS comments,
             RANK() OVER (ORDER BY SUM(views) DESC) AS rank
      FROM PerformanceMetrics
      GROUP BY ytvideoid
    ) WHERE rank BETWEEN :offset + 1 AND :offset + :pageSize
  `;

  try {
    const result = await db.simpleExecute(query, { offset, pageSize });
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching top videos data:', error);
    res.status(500).json({ error: 'Failed to fetch top videos data', details: error.message });
  }
});

// Route to fetch data from Video table for debugging
app.get('/check-video-table', async (req, res) => {
  const query = `SELECT * FROM Video FETCH FIRST 10 ROWS ONLY`;

  try {
    const result = await db.simpleExecute(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching video table data:', error);
    res.status(500).json({ error: 'Failed to fetch video table data', details: error.message });
  }
});

// Close the database connection pool when the application ends
process.on('SIGINT', async () => {
  try {
    await db.close();
    console.log('Database connection pool closed');
    process.exit(0);
  } catch (err) {
    console.error('Error closing database pool', err);
    process.exit(1);
  }
});
