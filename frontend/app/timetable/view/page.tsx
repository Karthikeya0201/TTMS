"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Download, Printer } from "lucide-react"

export default function ViewTimetablePage() {
  const [viewType, setViewType] = useState("section")
  const [selectedFilter, setSelectedFilter] = useState("")

  // Sample timetable data
  const sampleTimetable = {
    "Monday-1": { subject: "CS201", subjectName: "Data Structures", faculty: "Dr. John Smith", classroom: "Room 101" },
    "Monday-2": {
      subject: "MA201",
      subjectName: "Mathematics III",
      faculty: "Dr. Robert Davis",
      classroom: "Room 102",
    },
    "Monday-3": {
      subject: "CS301",
      subjectName: "Database Management",
      faculty: "Dr. John Smith",
      classroom: "Lab 201",
    },
    "Tuesday-1": {
      subject: "CS401",
      subjectName: "Operating Systems",
      faculty: "Prof. Alice Brown",
      classroom: "Room 101",
    },
    "Tuesday-2": { subject: "CS201", subjectName: "Data Structures", faculty: "Dr. John Smith", classroom: "Room 102" },
    "Wednesday-1": {
      subject: "CS301",
      subjectName: "Database Management",
      faculty: "Dr. John Smith",
      classroom: "Lab 201",
    },
    "Wednesday-3": {
      subject: "CS401",
      subjectName: "Operating Systems",
      faculty: "Prof. Alice Brown",
      classroom: "Room 101",
    },
    "Thursday-1": {
      subject: "MA201",
      subjectName: "Mathematics III",
      faculty: "Dr. Robert Davis",
      classroom: "Room 102",
    },
    "Thursday-2": {
      subject: "CS201",
      subjectName: "Data Structures",
      faculty: "Dr. John Smith",
      classroom: "Room 101",
    },
    "Friday-1": {
      subject: "CS301",
      subjectName: "Database Management",
      faculty: "Dr. John Smith",
      classroom: "Lab 201",
    },
    "Friday-2": {
      subject: "CS401",
      subjectName: "Operating Systems",
      faculty: "Prof. Alice Brown",
      classroom: "Room 102",
    },
  }

  const timeSlots = [
    { id: 1, time: "9:00 - 10:00", period: 1 },
    { id: 2, time: "10:00 - 11:00", period: 2 },
    { id: 3, time: "11:15 - 12:15", period: 3 },
    { id: 4, time: "12:15 - 1:15", period: 4 },
    { id: 5, time: "2:15 - 3:15", period: 5 },
    { id: 6, time: "3:15 - 4:15", period: 6 },
  ]

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

  const sections = ["CSE-3-1-A", "CSE-3-1-B", "ECE-3-1-A", "ME-2-1-A"]
  const faculty = ["Dr. John Smith", "Prof. Alice Brown", "Dr. Robert Davis"]
  const classrooms = ["Room 101", "Room 102", "Lab 201", "Lab 301"]

  const getSlotKey = (day, period) => `${day}-${period}`

  const exportToPDF = () => {
    // In a real application, this would generate and download a PDF
    alert("PDF export functionality would be implemented here")
  }

  const printTimetable = () => {
    window.print()
  }

  const renderTimetableGrid = () => (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border border-gray-300 p-3 bg-gray-50 font-semibold">Time</th>
            {days.map((day) => (
              <th key={day} className="border border-gray-300 p-3 bg-gray-50 font-semibold min-w-[180px]">
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {timeSlots.map((slot) => (
            <tr key={slot.id}>
              <td className="border border-gray-300 p-3 font-medium bg-gray-50">
                <div className="text-sm font-semibold">{slot.time}</div>
                <div className="text-xs text-gray-500">Period {slot.period}</div>
              </td>
              {days.map((day) => {
                const slotKey = getSlotKey(day, slot.period)
                const slotInfo = sampleTimetable[slotKey]
                return (
                  <td key={`${day}-${slot.period}`} className="border border-gray-300 p-3">
                    {slotInfo ? (
                      <div className="space-y-2">
                        <Badge variant="default" className="text-xs font-medium">
                          {slotInfo.subject}
                        </Badge>
                        <div className="text-sm font-medium text-gray-800">{slotInfo.subjectName}</div>
                        <div className="text-xs text-gray-600">{slotInfo.faculty}</div>
                        <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">{slotInfo.classroom}</div>
                      </div>
                    ) : (
                      <div className="text-center text-gray-400 text-sm py-4">Free Period</div>
                    )}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">View Timetables</h1>
        <p className="text-gray-600">View timetables by section, faculty, or classroom</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Filter Options</CardTitle>
              <CardDescription>Select view type and filter criteria</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="view-type">View Type</Label>
                <Select value={viewType} onValueChange={setViewType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select view type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="section">By Section</SelectItem>
                    <SelectItem value="faculty">By Faculty</SelectItem>
                    <SelectItem value="classroom">By Classroom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="filter">
                  {viewType === "section" && "Section"}
                  {viewType === "faculty" && "Faculty"}
                  {viewType === "classroom" && "Classroom"}
                </Label>
                <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder={`Select ${viewType}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {viewType === "section" &&
                      sections.map((section) => (
                        <SelectItem key={section} value={section}>
                          {section}
                        </SelectItem>
                      ))}
                    {viewType === "faculty" &&
                      faculty.map((member) => (
                        <SelectItem key={member} value={member}>
                          {member}
                        </SelectItem>
                      ))}
                    {viewType === "classroom" &&
                      classrooms.map((room) => (
                        <SelectItem key={room} value={room}>
                          {room}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-4 space-y-2">
                <Button onClick={exportToPDF} className="w-full" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export PDF
                </Button>
                <Button onClick={printTimetable} className="w-full" variant="outline">
                  <Printer className="h-4 w-4 mr-2" />
                  Print
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Timetable View</CardTitle>
              <CardDescription>
                {selectedFilter
                  ? `Showing timetable for ${selectedFilter} (${viewType})`
                  : `Select a ${viewType} to view timetable`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedFilter ? (
                <div className="space-y-6">
                  {renderTimetableGrid()}

                  <div className="flex justify-between items-center pt-4 border-t">
                    <div className="text-sm text-gray-500">Last updated: {new Date().toLocaleDateString()}</div>
                    <div className="flex gap-2">
                      <Button onClick={exportToPDF} variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                      <Button onClick={printTimetable} variant="outline" size="sm">
                        <Printer className="h-4 w-4 mr-2" />
                        Print
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">Please select a {viewType} to view the timetable</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {selectedFilter && (
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Summary Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">24</div>
                  <div className="text-sm text-gray-600">Total Periods</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">18</div>
                  <div className="text-sm text-gray-600">Scheduled</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">6</div>
                  <div className="text-sm text-gray-600">Free Periods</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">75%</div>
                  <div className="text-sm text-gray-600">Utilization</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
