const express = require('express');
const cors = require('cors');
const db = require('./db'); // Import the database connection functions

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Function to start the app and initialize the database
async function startApp() {
  try {
    await db.initialize(); // Initialize database connection pool
    console.log('Database connection pool initialized');

    // Start the server only after the database is connected
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Error starting application', err);
    process.exit(1); // Exit if there's a connection issue
  }
}

startApp();

// Route to fetch general trends data or specific video trends data
app.get('/trends', async (req, res) => {
  const { aggregation, ytvideoid } = req.query;

  // Validate time aggregation parameter
  if (!['daily', 'weekly', 'monthly'].includes(aggregation)) {
    return res.status(400).json({ error: 'Invalid time aggregation' });
  }

  // Build query dynamically based on aggregation type
  let aggregationFormat;
  switch (aggregation) {
    case 'daily':
      aggregationFormat = `TRUNC(timestamp, 'DD')`;
      break;
    case 'weekly':
      aggregationFormat = `TRUNC(timestamp, 'IW')`;
      break;
    case 'monthly':
      aggregationFormat = `TRUNC(timestamp, 'MM')`;
      break;
  }

  // If a specific video ID is provided, filter by that video ID
  const videoCondition = ytvideoid ? `WHERE ytvideoid = :ytvideoid` : '';

  const query = `
    SELECT ${aggregationFormat} AS PERIOD,
           AVG(views) AS AVGVIEWS,
           AVG(likes) AS AVGLIKES,
           AVG(dislikes) AS AVGDISLIKES,
           AVG(comments) AS AVGCOMMENTS
    FROM "VPERSAUD1".PerformanceMetrics
    ${videoCondition}
    GROUP BY ${aggregationFormat}
    ORDER BY ${aggregationFormat}
  `;

  try {
    const binds = ytvideoid ? [ytvideoid] : [];
    const result = await db.simpleExecute(query, binds);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching trend data:', error);
    res.status(500).json({
      error: 'Failed to fetch trend data',
      details: error.message,
    });
  }
});

// Route to fetch top videos data
app.get('/top-videos', async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  const query = `
    SELECT ytvideoid,
           MAX(views) AS VIEWS,
           MAX(likes) AS LIKES,
           MAX(dislikes) AS DISLIKES,
           MAX(comments) AS COMMENTS
    FROM (
      SELECT ytvideoid, views, likes, dislikes, comments,
             ROW_NUMBER() OVER (PARTITION BY ytvideoid ORDER BY timestamp DESC) AS rn
      FROM "VPERSAUD1".PerformanceMetrics
    ) 
    WHERE rn = 1
    GROUP BY ytvideoid
    ORDER BY VIEWS DESC
    OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY
  `;

  try {
    const binds = {
      offset: parseInt(offset, 10),
      limit: parseInt(limit, 10),
    };
    const result = await db.simpleExecute(query, binds);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching top videos data:', error);
    res.status(500).json({
      error: 'Failed to fetch top videos data',
      details: error.message,
    });
  }
});

// Route for top growth videos
app.get('/top-growth', async (req, res) => {
  const query = `
    SELECT ytvideoid, 
           (MAX(views) - MIN(views)) AS GROWTH
    FROM "VPERSAUD1".PerformanceMetrics
    GROUP BY ytvideoid
    ORDER BY GROWTH DESC
    FETCH FIRST 10 ROWS ONLY
  `;

  try {
    const result = await db.simpleExecute(query, []);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching top growth data:', error);
    res.status(500).json({
      error: 'Failed to fetch top growth data',
      details: error.message,
    });
  }
});

// Route for video comparison data (optional for now, not fully implemented)
app.get('/compare-videos', async (req, res) => {
  const { ytvideoids } = req.query;
  if (!ytvideoids) {
    return res.status(400).json({ error: 'You must provide video IDs for comparison' });
  }

  const videoIdsArray = ytvideoids.split(',');

  const query = `
    SELECT ytvideoid,
           timestamp,
           views,
           likes,
           dislikes,
           comments
    FROM "VPERSAUD1".PerformanceMetrics
    WHERE ytvideoid IN (${videoIdsArray.map((_, i) => `:${i}`).join(', ')})
    ORDER BY timestamp
  `;

  try {
    const binds = videoIdsArray;
    const result = await db.simpleExecute(query, binds);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching comparison data:', error);
    res.status(500).json({
      error: 'Failed to fetch comparison data',
      details: error.message,
    });
  }
});

// Route to fetch most engaging videos
app.get('/most-engaging', async (req, res) => {
  const query = `
    SELECT ytvideoid,
           (MAX(likes) + MAX(comments)) AS ENGAGEMENT
    FROM "VPERSAUD1".PerformanceMetrics
    GROUP BY ytvideoid
    ORDER BY ENGAGEMENT DESC
    FETCH FIRST 10 ROWS ONLY
  `;

  try {
    const result = await db.simpleExecute(query, []);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching most engaging videos:', error);
    res.status(500).json({
      error: 'Failed to fetch most engaging videos',
      details: error.message,
    });
  }
});
