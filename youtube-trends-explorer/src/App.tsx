import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Input } from './components/ui/input';
import { Button } from './components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const YouTubeTrendsApp: React.FC = () => {
  const [timeAggregation, setTimeAggregation] = useState<string>('daily');
  const [topVideosPage, setTopVideosPage] = useState<number>(1);

  const [trendData, setTrendData] = useState<any[]>([]);
  const [topVideosData, setTopVideosData] = useState<any[]>([]);

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
                  <LineChart width={600} height={300} data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="PERIOD" /> {/* Updated to match the backend response */}
                    <YAxis yAxisId="left" /> {/* YAxis for avgViews */}
                    <YAxis yAxisId="right" orientation="right" /> {/* YAxis for avgLikes, avgDislikes, avgComments */}
                    <Tooltip />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="AVGVIEWS" stroke="#8884d8" name="Avg Views" />
                    <Line yAxisId="right" type="monotone" dataKey="AVGLIKES" stroke="#82ca9d" name="Avg Likes" />
                    <Line yAxisId="right" type="monotone" dataKey="AVGDISLIKES" stroke="#ff7300" name="Avg Dislikes" />
                    <Line yAxisId="right" type="monotone" dataKey="AVGCOMMENTS" stroke="#ffc658" name="Avg Comments" />
                  </LineChart>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="top-videos">
              <Card>
                <CardHeader>
                  <CardTitle>Top Trending Videos</CardTitle>
                </CardHeader>
                <CardContent>
                  <BarChart width={600} height={300} data={topVideosData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="TITLE" /> {/* Ensure this key matches the backend response */}
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="VIEWS" fill="#8884d8" />
                  </BarChart>
                  <div className="mt-4">
                    <table className="w-full">
                      <thead>
                        <tr>
                          <th>Video ID</th>
                          <th>Title</th>
                          <th>Views</th>
                          <th>Likes</th>
                          <th>Dislikes</th>
                          <th>Comments</th>
                        </tr>
                      </thead>
                      <tbody>
                        {topVideosData.map((video) => (
                          <tr key={video.YTVIDEOID}>
                            <td>{video.YTVIDEOID}</td>
                            <td>{video.TITLE}</td>
                            <td>{video.VIEWS.toLocaleString()}</td>
                            <td>{video.LIKES.toLocaleString()}</td>
                            <td>{video.DISLIKES.toLocaleString()}</td>
                            <td>{video.COMMENTS.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-4 flex justify-between">
                    <Button onClick={() => setTopVideosPage((prev) => Math.max(1, prev - 1))}>Previous</Button>
                    <Button onClick={() => setTopVideosPage((prev) => prev + 1)}>Next</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
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
