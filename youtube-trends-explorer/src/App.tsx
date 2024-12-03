import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Input } from './components/ui/input';
import { Button } from './components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts'; // Import Tooltip

// Custom Bar component to eliminate hover overlay effect
const CustomBar = (props: any) => {
  const { fill, x, y, width, height } = props;
  return <rect x={x} y={y} width={width} height={height} fill={fill} />;
};

const YouTubeTrendsApp: React.FC = () => {
  const [timeAggregation, setTimeAggregation] = useState<string>('daily');
  const [topVideosPage, setTopVideosPage] = useState<number>(1);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [topVideosData, setTopVideosData] = useState<any[]>([]);
  const [hoveredData, setHoveredData] = useState<any | null>(null);
  const [hoveredTopVideoData, setHoveredTopVideoData] = useState<any | null>(null);

  // Fetch trend data whenever the time aggregation changes
  useEffect(() => {
    const fetchTrends = async () => {
      try {
        const response = await fetch(`http://localhost:5000/trends?aggregation=${timeAggregation}`);
        if (!response.ok) {
          throw new Error('Failed to fetch trend data');
        }
        const data = await response.json();
        console.log("Fetched Trend Data:", data); // Debugging line to see the data
        setTrendData(data);
      } catch (error) {
        console.error('Error fetching trend data:', error);
      }
    };

    fetchTrends();
  }, [timeAggregation]);

  // Fetch top videos data whenever the page changes
  useEffect(() => {
    const fetchTopVideos = async () => {
      try {
        const response = await fetch(`http://localhost:5000/top-videos?page=${topVideosPage}`);
        if (!response.ok) {
          throw new Error('Failed to fetch top videos data');
        }
        const data = await response.json();
        console.log("Top Videos Data:", data); // Debugging line to see the data
        setTopVideosData(data);
      } catch (error) {
        console.error('Error fetching top videos data:', error);
      }
    };

    fetchTopVideos();
  }, [topVideosPage]);

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
                  <CardTitle>Overall Trends</CardTitle>
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
                  <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                    <LineChart
                      width={600}
                      height={300}
                      data={trendData}
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
                    <div style={{ marginLeft: '20px', maxWidth: '300px' }}>
                      <h3>Hovered Data Details:</h3>
                      {hoveredData ? (
                        <ul>
                          <li>
                            <strong>Period:</strong> {hoveredData.PERIOD}
                          </li>
                          <li>
                            <strong>Average Views:</strong> {hoveredData.AVGVIEWS.toLocaleString()}
                          </li>
                          <li>
                            <strong>Average Likes:</strong> {hoveredData.AVGLIKES.toLocaleString()}
                          </li>
                          <li>
                            <strong>Average Dislikes:</strong> {hoveredData.AVGDISLIKES.toLocaleString()}
                          </li>
                          <li>
                            <strong>Average Comments:</strong> {hoveredData.AVGCOMMENTS.toLocaleString()}
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
                  {topVideosData.length > 0 ? (
                    <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                      <BarChart
                        width={600}
                        height={300}
                        data={topVideosData}
                        onMouseMove={(state) => {
                          if (state && state.activePayload && state.activePayload.length > 0) {
                            setHoveredTopVideoData(state.activePayload[0].payload);
                          } else {
                            setHoveredTopVideoData(null);
                          }
                        }}
                        onMouseLeave={() => setHoveredTopVideoData(null)}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="YTVIDEOID" />
                        <YAxis />
                        <Legend />
                        <Bar
                          dataKey="VIEWS"
                          fill="#8884d8"
                          isAnimationActive={false}
                          shape={<CustomBar fill="#8884d8" />} // Using a custom bar component
                        />
                      </BarChart>

                      {/* Custom Data Display for Top Videos */}
                      <div style={{ marginLeft: '20px', maxWidth: '300px' }}>
                        <h3>Hovered Video Details:</h3>
                        {hoveredTopVideoData ? (
                          <ul>
                            <li>
                              <strong>Video ID:</strong> {hoveredTopVideoData.YTVIDEOID}
                            </li>
                            <li>
                              <strong>Views:</strong> {hoveredTopVideoData.VIEWS.toLocaleString()}
                            </li>
                            <li>
                              <strong>Likes:</strong> {hoveredTopVideoData.LIKES.toLocaleString()}
                            </li>
                            <li>
                              <strong>Dislikes:</strong> {hoveredTopVideoData.DISLIKES.toLocaleString()}
                            </li>
                            <li>
                              <strong>Comments:</strong> {hoveredTopVideoData.COMMENTS.toLocaleString()}
                            </li>
                          </ul>
                        ) : (
                          <p>Hover over a bar to see details</p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p>No data available for top videos.</p>
                  )}
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
