import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Input } from './components/ui/input';
import { Button } from './components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';

const YouTubeTrendsApp: React.FC = () => {
  const [timeAggregation, setTimeAggregation] = useState<string>('daily');
  const [topVideosPage, setTopVideosPage] = useState<number>(1);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [topVideosData, setTopVideosData] = useState<any[]>([]);
  const [topGrowthData, setTopGrowthData] = useState<any[]>([]);
  const [mostEngagingData, setMostEngagingData] = useState<any[]>([]);
  const [compareIds, setCompareIds] = useState<string>('');
  const [compareData, setCompareData] = useState<any[]>([]);

  const [hoveredTrendData, setHoveredTrendData] = useState<any | null>(null);
  const [hoveredTopVideosData, setHoveredTopVideosData] = useState<any | null>(null);
  const [hoveredTopGrowthData, setHoveredTopGrowthData] = useState<any | null>(null);
  const [hoveredMostEngagingData, setHoveredMostEngagingData] = useState<any | null>(null);

  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [selectedVideos, setSelectedVideos] = useState<string[]>([]); // Array to store selected video IDs
  const [topMetric, setTopMetric] = useState<string>('VIEWS'); // Metric for top videos chart

  // Fetch general trend data or specific video trends
  useEffect(() => {
    const fetchTrends = async () => {
      try {
        let url = `http://localhost:5000/trends?aggregation=${timeAggregation}`;
        if (selectedVideoId) {
          url += `&ytvideoid=${selectedVideoId}`;
        }
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to fetch trend data');
        }
        const data = await response.json();
        setTrendData(data);
      } catch (error) {
        console.error('Error fetching trend data:', error);
      }
    };

    fetchTrends();
  }, [timeAggregation, selectedVideoId]);

  // Fetch top videos data whenever the page or metric changes
  useEffect(() => {
    const fetchTopVideos = async () => {
      try {
        const response = await fetch(`http://localhost:5000/top-videos?page=${topVideosPage}`);
        if (!response.ok) {
          throw new Error('Failed to fetch top videos data');
        }
        const data = await response.json();
        // Sort data based on the selected metric in descending order
        const sortedData = data.sort((a: any, b: any) => b[topMetric] - a[topMetric]);
        setTopVideosData(sortedData);
      } catch (error) {
        console.error('Error fetching top videos data:', error);
      }
    };

    fetchTopVideos();
  }, [topVideosPage, topMetric]);

  // Fetch the Top Growth data
  useEffect(() => {
    const fetchTopGrowth = async () => {
      try {
        const response = await fetch('http://localhost:5000/top-growth');
        if (!response.ok) {
          throw new Error('Failed to fetch top growth data');
        }
        const data = await response.json();
        setTopGrowthData(data);
      } catch (error) {
        console.error('Error fetching top growth data:', error);
      }
    };

    fetchTopGrowth();
  }, []);

  // Fetch most engaging videos data
  useEffect(() => {
    const fetchMostEngaging = async () => {
      try {
        const response = await fetch('http://localhost:5000/most-engaging');
        if (!response.ok) {
          throw new Error('Failed to fetch most engaging videos');
        }
        const data = await response.json();
        setMostEngagingData(data);
      } catch (error) {
        console.error('Error fetching most engaging videos:', error);
      }
    };

    fetchMostEngaging();
  }, []);

  // Handle video selection from charts
  const handleVideoSelect = (data: any) => {
    const videoId = data.payload?.YTVIDEOID;
    if (videoId) {
      setSelectedVideos((prevSelectedVideos) => {
        if (prevSelectedVideos.includes(videoId)) {
          return prevSelectedVideos.filter((id) => id !== videoId); // Deselect if selected
        } else if (prevSelectedVideos.length < 3) {
          return [...prevSelectedVideos, videoId]; // Select up to 3
        }
        return prevSelectedVideos; // If already have 3 selected, do nothing
      });
    }
  };

  // Fetch and display compare videos data
  const handleCompareFetch = async () => {
    if (!compareIds) return;
    try {
      const response = await fetch(`http://localhost:5000/compare-videos?ytvideoids=${compareIds}`);
      if (!response.ok) {
        throw new Error('Failed to fetch comparison data');
      }
      const data = await response.json();
      setCompareData(data);
    } catch (error) {
      console.error('Error fetching comparison data:', error);
    }
  };

  return (
    <div className="p-4">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>YouTube Trends Explorer</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Selected Videos Section */}
          <div className="mb-4">
            <h2>Selected Videos (Click on IDs to view on YouTube)</h2>
            <div>
              {selectedVideos.length > 0 ? (
                <ul>
                  {selectedVideos.map((videoId) => (
                    <li key={videoId}>
                      <a
                        href={`https://www.youtube.com/watch?v=${videoId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {videoId}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No videos selected. Select videos from the tabs below.</p>
              )}
            </div>
          </div>

          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Trend Overview</TabsTrigger>
              <TabsTrigger value="top-videos">Top Videos</TabsTrigger>
              <TabsTrigger value="top-growth">Top Growth</TabsTrigger>
              <TabsTrigger value="most-engaging">Most Engaging</TabsTrigger>
              <TabsTrigger value="compare">Compare Videos</TabsTrigger>
            </TabsList>

            {/* Trend Overview Tab */}
            <TabsContent value="overview">
              <Card>
                <CardHeader>
                  <CardTitle>{selectedVideoId ? `Trends for Video ID: ${selectedVideoId}` : "Overall Trends"}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <Select onValueChange={setTimeAggregation} value={timeAggregation}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select time aggregation" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', marginLeft: "50px" }}>
                    <LineChart
                      width={1000}
                      height={390}
                      data={trendData}
                      margin={{ left: 20 }}
                      onMouseMove={(state) => {
                        if (state && state.activePayload && state.activePayload.length > 0) {
                          setHoveredTrendData(state.activePayload[0].payload);
                        } else {
                          setHoveredTrendData(null);
                        }
                      }}
                      onMouseLeave={() => setHoveredTrendData(null)}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="PERIOD" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Legend />
                      <Line yAxisId="left" type="monotone" dataKey="AVGVIEWS" stroke="#8884d8" name="Avg Views" />
                      <Line yAxisId="right" type="monotone" dataKey="AVGLIKES" stroke="#82ca9d" name="Avg Likes" />
                      <Line yAxisId="right" type="monotone" dataKey="AVGDISLIKES" stroke="#ff7300" name="Avg Dislikes" />
                      <Line yAxisId="right" type="monotone" dataKey="AVGCOMMENTS" stroke="#ffc658" name="Avg Comments" />
                    </LineChart>

                    {/* Custom Data Display */}
                    <div style={{ marginLeft: '20px', maxWidth: '400px' }}>
                      <h3>Hovered Data Details:</h3>
                      {hoveredTrendData ? (
                        <ul>
                          <li>
                            <strong>Period:</strong> {hoveredTrendData.PERIOD ? new Date(hoveredTrendData.PERIOD).toLocaleString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                              second: "2-digit"
                            }) : 'N/A'}
                          </li>
                          <li>
                            <strong>Average Views:</strong> {hoveredTrendData.AVGVIEWS?.toLocaleString() ?? 'N/A'}
                          </li>
                          <li>
                            <strong>Average Likes:</strong> {hoveredTrendData.AVGLIKES?.toLocaleString() ?? 'N/A'}
                          </li>
                          <li>
                            <strong>Average Dislikes:</strong> {hoveredTrendData.AVGDISLIKES?.toLocaleString() ?? 'N/A'}
                          </li>
                          <li>
                            <strong>Average Comments:</strong> {hoveredTrendData.AVGCOMMENTS?.toLocaleString() ?? 'N/A'}
                          </li>
                        </ul>
                      ) : (
                        <p>Hover over a point to see details</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Top Videos Tab */}
            <TabsContent value="top-videos">
              <Card>
                <CardHeader>
                  <CardTitle>Top Trending Videos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <Select onValueChange={setTopMetric} value={topMetric}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Metric" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="VIEWS">Views</SelectItem>
                        <SelectItem value="LIKES">Likes</SelectItem>
                        <SelectItem value="DISLIKES">Dislikes</SelectItem>
                        <SelectItem value="COMMENTS">Comments</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <BarChart
                    width={600}
                    height={300}
                    data={topVideosData}
                    onMouseMove={(state) => {
                      if (state && state.activePayload && state.activePayload.length > 0) {
                        setHoveredTopVideosData(state.activePayload[0].payload);
                      } else {
                        setHoveredTopVideosData(null);
                      }
                    }}
                    onMouseLeave={() => setHoveredTopVideosData(null)}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="ytvideoid" />
                    <YAxis />
                    <Legend />
                    <Bar dataKey={topMetric} fill="#8884d8" onClick={(data) => handleVideoSelect(data)} />
                  </BarChart>

                  {/* Custom Data Display for Top Videos */}
                  <div style={{ marginLeft: '20px', maxWidth: '300px' }}>
                    <h3>Hovered Video Data:</h3>
                    {hoveredTopVideosData ? (
                      <ul>
                        <li>
                          <strong>Video ID:</strong> {hoveredTopVideosData.YTVIDEOID}
                        </li>
                        <li>
                          <strong>{topMetric}:</strong> {hoveredTopVideosData[topMetric]?.toLocaleString() ?? 'N/A'}
                        </li>
                      </ul>
                    ) : (
                      <p>Hover over a bar to see details</p>
                    )}
                  </div>

                  {/* Pagination Buttons */}
                  <div className="mt-4 flex justify-between">
                    <Button onClick={() => setTopVideosPage((prev) => Math.max(1, prev - 1))}>Previous</Button>
                    <Button onClick={() => setTopVideosPage((prev) => prev + 1)}>Next</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Top Growth Tab */}
            <TabsContent value="top-growth">
              <Card>
                <CardHeader>
                  <CardTitle>Top Growth in Video Views (Absolute Growth)</CardTitle>
                </CardHeader>
                <CardContent>
                  <BarChart
                    width={600}
                    height={300}
                    data={topGrowthData}
                    onMouseMove={(state) => {
                      if (state && state.activePayload && state.activePayload.length > 0) {
                        setHoveredTopGrowthData(state.activePayload[0].payload);
                      } else {
                        setHoveredTopGrowthData(null);
                      }
                    }}
                    onMouseLeave={() => setHoveredTopGrowthData(null)}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="YTVIDEOID" />
                    <YAxis />
                    <Legend />
                    <Bar dataKey="GROWTH" fill="#82ca9d" onClick={(data) => handleVideoSelect(data)} />
                  </BarChart>

                  {/* Custom Data Display for Top Growth */}
                  <div style={{ marginLeft: '20px', maxWidth: '300px' }}>
                    <h3>Hovered Growth Data:</h3>
                    {hoveredTopGrowthData ? (
                      <ul>
                        <li>
                          <strong>Video ID:</strong> {hoveredTopGrowthData.YTVIDEOID}
                        </li>
                        <li>
                          <strong>Growth:</strong> {hoveredTopGrowthData.GROWTH?.toLocaleString() ?? 'N/A'}
                        </li>
                      </ul>
                    ) : (
                      <p>Hover over a bar to see details</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Most Engaging Tab */}
            <TabsContent value="most-engaging">
              <Card>
                <CardHeader>
                  <CardTitle>Most Engaging Videos (Likes + Comments)</CardTitle>
                </CardHeader>
                <CardContent>
                  <BarChart
                    width={600}
                    height={300}
                    data={mostEngagingData}
                    onMouseMove={(state) => {
                      if (state && state.activePayload && state.activePayload.length > 0) {
                        setHoveredMostEngagingData(state.activePayload[0].payload);
                      } else {
                        setHoveredMostEngagingData(null);
                      }
                    }}
                    onMouseLeave={() => setHoveredMostEngagingData(null)}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="YTVIDEOID" />
                    <YAxis />
                    <Legend />
                    <Bar dataKey="ENGAGEMENT" fill="#FFBB28" onClick={(data) => handleVideoSelect(data)} />
                  </BarChart>
                  <div style={{ marginLeft: '20px', maxWidth: '300px' }}>
                    <h3>Hovered Engagement Data:</h3>
                    {hoveredMostEngagingData ? (
                      <ul>
                        <li>
                          <strong>Video ID:</strong> {hoveredMostEngagingData.YTVIDEOID}
                        </li>
                        <li>
                          <strong>Engagement (Likes+Comments):</strong> {hoveredMostEngagingData.ENGAGEMENT?.toLocaleString() ?? 'N/A'}
                        </li>
                      </ul>
                    ) : (
                      <p>Hover over a bar to see details</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Compare Videos Tab */}
            <TabsContent value="compare">
              <Card>
                <CardHeader>
                  <CardTitle>Compare Videos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <p>Enter multiple YouTube Video IDs separated by commas:</p>
                    <Input
                      placeholder="e.g. XsX3ATc3FbA,FuXNumBwDOM"
                      value={compareIds}
                      onChange={(e) => setCompareIds(e.target.value)}
                    />
                    <Button className="mt-2 w-full" onClick={handleCompareFetch}>
                      Fetch Comparison Data
                    </Button>
                  </div>
                  {compareData.length > 0 ? (
                    <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr>
                            <th className="border-b p-2">Video ID</th>
                            <th className="border-b p-2">Timestamp</th>
                            <th className="border-b p-2">Views</th>
                            <th className="border-b p-2">Likes</th>
                            <th className="border-b p-2">Dislikes</th>
                            <th className="border-b p-2">Comments</th>
                          </tr>
                        </thead>
                        <tbody>
                          {compareData.map((row, index) => (
                            <tr key={index}>
                              <td className="border-b p-2">{row.YTVIDEOID}</td>
                              <td className="border-b p-2">{row.TIMESTAMP}</td>
                              <td className="border-b p-2">{row.VIEWS?.toLocaleString() ?? 'N/A'}</td>
                              <td className="border-b p-2">{row.LIKES?.toLocaleString() ?? 'N/A'}</td>
                              <td className="border-b p-2">{row.DISLIKES?.toLocaleString() ?? 'N/A'}</td>
                              <td className="border-b p-2">{row.COMMENTS?.toLocaleString() ?? 'N/A'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p>No comparison data available. Please fetch data after entering IDs.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default YouTubeTrendsApp;
