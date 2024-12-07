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
  const [hoveredTrendData, setHoveredTrendData] = useState<any | null>(null);
  const [hoveredTopVideosData, setHoveredTopVideosData] = useState<any | null>(null);
  const [hoveredTopGrowthData, setHoveredTopGrowthData] = useState<any | null>(null);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [selectedVideos, setSelectedVideos] = useState<string[]>([]); // Array to store selected video IDs

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

  const handleVideoSelect = (data: any) => {
    const videoId = data.payload?.YTVIDEOID;
    if (videoId) {
      setSelectedVideos((prevSelectedVideos) => {
        if (prevSelectedVideos.includes(videoId)) {
          return prevSelectedVideos.filter((id) => id !== videoId);
        } else if (prevSelectedVideos.length < 3) {
          return [...prevSelectedVideos, videoId];
        }
        return prevSelectedVideos;
      });
    }
  };

  return (
    <div className="p-6">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">YouTube Trends Explorer</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-4">Selected Videos (Click IDs to view)</h2>
            <div>
              {selectedVideos.length > 0 ? (
                <ul className="space-y-2">
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
            <TabsList className="flex justify-center mb-4">
              <TabsTrigger value="overview">Trend Overview</TabsTrigger>
              <TabsTrigger value="top-videos">Top Videos</TabsTrigger>
              <TabsTrigger value="top-growth">Top Growth</TabsTrigger>
              <TabsTrigger value="comparison">Comparison</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl font-semibold">
                    {selectedVideoId ? `Trends for Video: ${selectedVideoId}` : 'Overall Trends'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Select onValueChange={setTimeAggregation} value={timeAggregation}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Time Aggregation" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                  <LineChart width={1000} height={400} data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="PERIOD" />
                    <YAxis />
                    <Legend />
                    <Line type="monotone" dataKey="AVGVIEWS" stroke="#8884d8" />
                  </LineChart>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Other Tabs */}
            {/* Add content here for 'top-videos', 'top-growth', and 'comparison' */}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default YouTubeTrendsApp;

