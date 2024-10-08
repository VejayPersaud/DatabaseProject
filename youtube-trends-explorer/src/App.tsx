import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Input } from './components/ui/input';
import { Button } from './components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const YouTubeTrendsApp: React.FC = () => {
  const [timeAggregation, setTimeAggregation] = useState<string>('daily');
  const [topVideosPage, setTopVideosPage] = useState<number>(1);

  // Dummy data for trend overview
  const trendData = [
    { date: '2023-05-01', avgViews: 150000, avgLikes: 15000, avgDislikes: 500, avgComments: 2000 },
    { date: '2023-05-02', avgViews: 180000, avgLikes: 18000, avgDislikes: 600, avgComments: 2400 },
    { date: '2023-05-03', avgViews: 200000, avgLikes: 20000, avgDislikes: 700, avgComments: 2800 },
    { date: '2023-05-04', avgViews: 160000, avgLikes: 16000, avgDislikes: 550, avgComments: 2200 },
    { date: '2023-05-05', avgViews: 220000, avgLikes: 22000, avgDislikes: 750, avgComments: 3000 },
  ];

  // Dummy data for top videos
  const topVideosData = [
    { ytvideoid: 'abc123', title: 'Viral Cat Video', views: 1000000, likes: 100000, dislikes: 2000, comments: 15000 },
    { ytvideoid: 'def456', title: 'Latest Music Video', views: 800000, likes: 80000, dislikes: 1500, comments: 12000 },
    { ytvideoid: 'ghi789', title: 'Trending Game Stream', views: 600000, likes: 60000, dislikes: 1000, comments: 9000 },
    { ytvideoid: 'jkl012', title: 'Cooking Tutorial', views: 400000, likes: 40000, dislikes: 500, comments: 6000 },
    { ytvideoid: 'mno345', title: 'Tech Review', views: 300000, likes: 30000, dislikes: 300, comments: 4500 },
  ];

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
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="avgViews" stroke="#8884d8" name="Avg Views" />
                    <Line yAxisId="right" type="monotone" dataKey="avgLikes" stroke="#82ca9d" name="Avg Likes" />
                    <Line yAxisId="right" type="monotone" dataKey="avgDislikes" stroke="#ff7300" name="Avg Dislikes" />
                    <Line yAxisId="right" type="monotone" dataKey="avgComments" stroke="#ffc658" name="Avg Comments" />
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
                    <XAxis dataKey="title" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="views" fill="#8884d8" />
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
                        {topVideosData.map(video => (
                          <tr key={video.ytvideoid}>
                            <td>{video.ytvideoid}</td>
                            <td>{video.title}</td>
                            <td>{video.views.toLocaleString()}</td>
                            <td>{video.likes.toLocaleString()}</td>
                            <td>{video.dislikes.toLocaleString()}</td>
                            <td>{video.comments.toLocaleString()}</td>
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