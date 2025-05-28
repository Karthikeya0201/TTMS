"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Users, BookOpen, MapPin, Clock, FileText } from "lucide-react";
import Link from "next/link";

interface Stats {
  totalBatches: number;
  activeFaculty: number;
  classrooms: number;
  timeSlots: number;
}

export default function HomePage() {
  const [stats, setStats] = useState<Stats>({
    totalBatches: 0,
    activeFaculty: 0,
    classrooms: 0,
    timeSlots: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/stats');
        if (!response.ok) {
          throw new Error('Failed to fetch stats');
        }
        const data: Stats = await response.json();
        setStats(data);
        setLoading(false);
      } catch (err) {
        setError('Error fetching data');
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Time Table Management System</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Centralized, conflict-free time table management for Engineering Institutions
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                Master Data
              </CardTitle>
              <CardDescription>Manage batches, branches, subjects, faculty, and classrooms</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/master-data">
                <Button className="w-full">Manage Data</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-green-600" />
                Create Timetable
              </CardTitle>
              <CardDescription>Create and assign timetables with conflict detection</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/timetable/create">
                <Button className="w-full">Create Timetable</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-purple-600" />
                View Timetables
              </CardTitle>
              <CardDescription>View timetables by section, faculty, or classroom</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/timetable/view">
                <Button className="w-full">View Timetables</Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {loading ? (
          <p>Loading stats...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Batches</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalBatches}</p>
                </div>
                <BookOpen className="h-8 w-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Faculty</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeFaculty}</p>
                </div>
                <Users className="h-8 w-8 text-green-600" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Classrooms</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.classrooms}</p>
                </div>
                <MapPin className="h-8 w-8 text-purple-600" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Time Slots</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.timeSlots}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}