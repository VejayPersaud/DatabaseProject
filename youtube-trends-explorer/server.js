const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize the database and start the server
async function startApp() {
  try {
    await db.initialize();
    console.log('Database connection pool initialized');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Error starting application:', err.message);
    process.exit(1);
  }
}

startApp();

// Trend Overview - Dynamic Time Aggregation
app.get('/trends', async (req, res) => {
  // Extract aggregation type from query params, default to 'daily'
  const { aggregation } = req.query;
  let truncFormat;

  // Set the truncation format based on the aggregation level
  switch (aggregation) {
    case 'weekly':
      truncFormat = 'IW'; // ISO week
      break;
    case 'monthly':
      truncFormat = 'MM'; // Month
      break;
    case 'daily':
    default:
      truncFormat = 'DD'; // Day
      break;
  }

  const query = `
    SELECT TRUNC(timestamp, '${truncFormat}') AS period, 
           AVG(views) AS avgViews, 
           AVG(likes) AS avgLikes, 
           AVG(dislikes) AS avgDislikes, 
           AVG(comments) AS avgComments
    FROM PerformanceMetrics
    GROUP BY TRUNC(timestamp, '${truncFormat}')
    ORDER BY TRUNC(timestamp, '${truncFormat}') ASC
    FETCH FIRST 100 ROWS ONLY
  `;

  try {
    console.log('Generated Query:', query);
    const result = await db.simpleExecute(query);
    console.log('Query Result:', result);

    if (result && result.rows && result.rows.length > 0) {
      res.json(result.rows);
    } else {
      res.status(404).json({ error: 'No data found in PerformanceMetrics' });
    }
  } catch (err) {
    console.error('Error fetching trend data:', err.message);
    res.status(500).json({ error: 'Failed to fetch trend data', details: err.message });
  }
});

// Graceful Shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received. Closing database pool...');
  await db.close();
  console.log('Database pool closed. Exiting...');
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT signal received. Closing database pool...');
  await db.close();
  console.log('Database pool closed. Exiting...');
  process.exit(0);
});
