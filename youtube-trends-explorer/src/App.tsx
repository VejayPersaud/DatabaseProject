import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Input } from './components/ui/input';
import { Button } from './components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { hover } from '@testing-library/user-event/dist/hover';

const YouTubeTrendsApp: React.FC = () => {
  const [timeAggregation, setTimeAggregation] = useState<string>('daily');
  const [topVideosPage, setTopVideosPage] = useState<number>(1);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [topVideosData, setTopVideosData] = useState<any[]>([]);
  const [hoveredData, setHoveredData] = useState<any | null>(null);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [topTenVideos, setTopTenVideos] = useState<any[]>([]);

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

  // Fetch top videos data whenever the page changes
  useEffect(() => {
    const fetchTopVideos = async () => {
      try {
        const response = await fetch(`http://localhost:5000/top-videos?page=${topVideosPage}`);
        if (!response.ok) {
          throw new Error('Failed to fetch top videos data');
        }
        const data = await response.json();
        setTopVideosData(data);
      } catch (error) {
        console.error('Error fetching top videos data:', error);
      }
    };

    fetchTopVideos();
  }, [topVideosPage]);

  // Fetch the Top 10 Videos (for the Overall Trends section)
  useEffect(() => {
    const fetchTopTenVideos = async () => {
      try {
        const response = await fetch(`http://localhost:5000/top-videos?limit=10`);
        if (!response.ok) {
          throw new Error('Failed to fetch top ten videos data');
        }
        const data = await response.json();
        setTopTenVideos(data);
      } catch (error) {
        console.error('Error fetching top ten videos data:', error);
      }
    };

    fetchTopTenVideos();
  }, []);

  return (
    <div className="p-4">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>YouTube Trends Explorer</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Trend Overview</TabsTrigger>
              <TabsTrigger value="top-videos">Top Videos</TabsTrigger>
              <TabsTrigger value="comparison">Video Comparison</TabsTrigger>
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
                  <div style={{ display: 'flex', alignItems: 'flex-start', marginLeft: "50px"}}>
                    <LineChart
                      width={1000}
                      height={500}
                      data={trendData}
                      margin={{left: 20}}
                      onMouseMove={(state) => {
                        if (state && state.activePayload && state.activePayload.length > 0) {
                          setHoveredData(state.activePayload[0].payload);
                        } else {
                          setHoveredData(null);
                        }
                      }}
                      onMouseLeave={() => setHoveredData(null)} // Clear data when leaving the chart
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="PERIOD" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Legend />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="AVGVIEWS"
                        stroke="#8884d8"
                        name="Avg Views"
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="AVGLIKES"
                        stroke="#82ca9d"
                        name="Avg Likes"
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="AVGDISLIKES"
                        stroke="#ff7300"
                        name="Avg Dislikes"
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="AVGCOMMENTS"
                        stroke="#ffc658"
                        name="Avg Comments"
                      />
                    </LineChart>

                    {/* Custom Data Display */}
                    <div style={{ marginLeft: '20px', maxWidth: '400px' }}>
                      <h3>Hovered Data Details:</h3>
                      {hoveredData ? (
                        <ul>
                          <li>
                              <strong>Period:</strong> {new Date(hoveredData.PERIOD).toLocaleString("en-US", {
                                    year: "numeric", month: "long", day: "numeric",
                                    hour: "2-digit", minute: "2-digit", second: "2-digit"})}
                          </li>
                          <li>
                            <strong>Average Views:</strong> {hoveredData.AVGVIEWS?.toLocaleString() ?? 'N/A'}
                          </li>
                          <li>
                            <strong>Average Likes:</strong> {hoveredData.AVGLIKES?.toLocaleString() ?? 'N/A'}
                          </li>
                          <li>
                            <strong>Average Dislikes:</strong> {hoveredData.AVGDISLIKES?.toLocaleString() ?? 'N/A'}
                          </li>
                          <li>
                            <strong>Average Comments:</strong> {hoveredData.AVGCOMMENTS?.toLocaleString() ?? 'N/A'}
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
                  <BarChart
                    width={600}
                    height={300}
                    data={topVideosData}
                    onMouseMove={(state) => {
                      if (state && state.activePayload && state.activePayload.length > 0) {
                        setHoveredData(state.activePayload[0].payload);
                      } else {
                        setHoveredData(null);
                      }
                    }}
                    onMouseLeave={() => setHoveredData(null)}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="ytvideoid" />
                    <YAxis />
                    <Legend />
                    <Bar dataKey="VIEWS" fill="#8884d8" />
                  </BarChart>

                  {/* Custom Data Display for Top Videos */}
                  <div style={{ marginLeft: '20px', maxWidth: '300px' }}>
                    <h3>Hovered Video Data:</h3>
                    {hoveredData ? (
                      <ul>
                        <li>
                          <strong>Video ID:</strong> {hoveredData.YTVIDEOID}
                        </li>
                        <li>
                          <strong>Views:</strong> {hoveredData.VIEWS?.toLocaleString() ?? 'N/A'}
                        </li>
                        <li>
                          <strong>Likes:</strong> {hoveredData.LIKES?.toLocaleString() ?? 'N/A'}
                        </li>
                        <li>
                          <strong>Dislikes:</strong> {hoveredData.DISLIKES?.toLocaleString() ?? 'N/A'}
                        </li>
                        <li>
                          <strong>Comments:</strong> {hoveredData.COMMENTS?.toLocaleString() ?? 'N/A'}
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

            {/* Video Comparison Tab */}
            <TabsContent value="comparison">
              <Card>
                <CardHeader>
                  <CardTitle>Video Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <Input placeholder="Enter YouTube Video ID or Title" />
                    <Input placeholder="Enter YouTube Video ID or Title" />
                  </div>
                  <Button className="w-full">Compare Videos</Button>
                  <div className="mt-4">
                    <p>Comparison chart would be displayed here after selecting videos</p>
                  </div>
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
