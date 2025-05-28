"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, Check, Save } from "lucide-react"

export default function CreateTimetablePage() {
  const [selectedBatch, setSelectedBatch] = useState("")
  const [selectedBranch, setSelectedBranch] = useState("")
  const [selectedSemester, setSelectedSemester] = useState("")
  const [selectedSection, setSelectedSection] = useState("")
  const [conflicts, setConflicts] = useState([])
  const [timetableData, setTimetableData] = useState({})

  const batches = ["2020-2024", "2021-2025", "2022-2026", "2023-2027"]
  const branches = ["CSE", "ECE", "ME", "CE"]
  const semesters = ["1-1", "1-2", "2-1", "2-2", "3-1", "3-2", "4-1", "4-2"]
  const sections = ["A", "B", "C"]
  const timeSlots = [
    { id: 1, time: "9:00 - 10:00", period: 1 },
    { id: 2, time: "10:00 - 11:00", period: 2 },
    { id: 3, time: "11:15 - 12:15", period: 3 },
    { id: 4, time: "12:15 - 1:15", period: 4 },
    { id: 5, time: "2:15 - 3:15", period: 5 },
    { id: 6, time: "3:15 - 4:15", period: 6 },
  ]
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

  const subjects = [
    { code: "CS201", name: "Data Structures", faculty: "Dr. John Smith" },
    { code: "CS301", name: "Database Management", faculty: "Dr. John Smith" },
    { code: "CS401", name: "Operating Systems", faculty: "Prof. Alice Brown" },
    { code: "MA201", name: "Mathematics III", faculty: "Dr. Robert Davis" },
  ]

  const classrooms = ["Room 101", "Room 102", "Lab 201", "Lab 301"]

  const [selectedSlot, setSelectedSlot] = useState(null)
  const [slotData, setSlotData] = useState({
    subject: "",
    faculty: "",
    classroom: "",
  })

  const checkConflicts = (day, period, faculty, classroom) => {
    const newConflicts = []

    // Check faculty conflict
    Object.keys(timetableData).forEach((key) => {
      const [d, p] = key.split("-")
      if (d === day && p === period.toString()) {
        if (timetableData[key].faculty === faculty) {
          newConflicts.push(`Faculty ${faculty} is already assigned at this time`)
        }
        if (timetableData[key].classroom === classroom) {
          newConflicts.push(`Classroom ${classroom} is already booked at this time`)
        }
      }
    })

    return newConflicts
  }

  const assignSlot = () => {
    if (!selectedSlot || !slotData.subject || !slotData.faculty || !slotData.classroom) {
      return
    }

    const [day, period] = selectedSlot.split("-")
    const slotConflicts = checkConflicts(day, Number.parseInt(period), slotData.faculty, slotData.classroom)

    if (slotConflicts.length > 0) {
      setConflicts(slotConflicts)
      return
    }

    setTimetableData({
      ...timetableData,
      [selectedSlot]: { ...slotData },
    })

    setSelectedSlot(null)
    setSlotData({ subject: "", faculty: "", classroom: "" })
    setConflicts([])
  }

  const getSlotKey = (day, period) => `${day}-${period}`

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Timetable</h1>
        <p className="text-gray-600">Create and assign timetables with automatic conflict detection</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Selection Criteria</CardTitle>
              <CardDescription>Select the batch, branch, semester, and section</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="batch">Batch</Label>
                <Select value={selectedBatch} onValueChange={setSelectedBatch}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select batch" />
                  </SelectTrigger>
                  <SelectContent>
                    {batches.map((batch) => (
                      <SelectItem key={batch} value={batch}>
                        {batch}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="branch">Branch</Label>
                <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map((branch) => (
                      <SelectItem key={branch} value={branch}>
                        {branch}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="semester">Semester</Label>
                <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select semester" />
                  </SelectTrigger>
                  <SelectContent>
                    {semesters.map((semester) => (
                      <SelectItem key={semester} value={semester}>
                        {semester}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="section">Section</Label>
                <Select value={selectedSection} onValueChange={setSelectedSection}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select section" />
                  </SelectTrigger>
                  <SelectContent>
                    {sections.map((section) => (
                      <SelectItem key={section} value={section}>
                        {section}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedSlot && (
                <div className="space-y-4 pt-4 border-t">
                  <h4 className="font-medium">Assign Slot: {selectedSlot}</h4>

                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Select
                      value={slotData.subject}
                      onValueChange={(value) => {
                        const subject = subjects.find((s) => s.code === value)
                        setSlotData({
                          ...slotData,
                          subject: value,
                          faculty: subject?.faculty || "",
                        })
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map((subject) => (
                          <SelectItem key={subject.code} value={subject.code}>
                            {subject.name} ({subject.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="faculty">Faculty</Label>
                    <Select
                      value={slotData.faculty}
                      onValueChange={(value) => setSlotData({ ...slotData, faculty: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select faculty" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map((subject) => (
                          <SelectItem key={subject.faculty} value={subject.faculty}>
                            {subject.faculty}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="classroom">Classroom</Label>
                    <Select
                      value={slotData.classroom}
                      onValueChange={(value) => setSlotData({ ...slotData, classroom: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select classroom" />
                      </SelectTrigger>
                      <SelectContent>
                        {classrooms.map((classroom) => (
                          <SelectItem key={classroom} value={classroom}>
                            {classroom}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {conflicts.length > 0 && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <ul className="list-disc list-inside">
                          {conflicts.map((conflict, index) => (
                            <li key={index}>{conflict}</li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="flex gap-2">
                    <Button onClick={assignSlot} className="flex-1">
                      <Check className="h-4 w-4 mr-2" />
                      Assign
                    </Button>
                    <Button variant="outline" onClick={() => setSelectedSlot(null)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Timetable</CardTitle>
              <CardDescription>
                {selectedBatch && selectedBranch && selectedSemester && selectedSection
                  ? `${selectedBranch} - ${selectedSemester} - Section ${selectedSection} (${selectedBatch})`
                  : "Select criteria to view timetable"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedBatch && selectedBranch && selectedSemester && selectedSection ? (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr>
                        <th className="border border-gray-300 p-2 bg-gray-50">Time</th>
                        {days.map((day) => (
                          <th key={day} className="border border-gray-300 p-2 bg-gray-50 min-w-[150px]">
                            {day}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {timeSlots.map((slot) => (
                        <tr key={slot.id}>
                          <td className="border border-gray-300 p-2 font-medium bg-gray-50">
                            <div className="text-sm">{slot.time}</div>
                            <div className="text-xs text-gray-500">Period {slot.period}</div>
                          </td>
                          {days.map((day) => {
                            const slotKey = getSlotKey(day, slot.period)
                            const slotInfo = timetableData[slotKey]
                            return (
                              <td
                                key={`${day}-${slot.period}`}
                                className="border border-gray-300 p-2 cursor-pointer hover:bg-gray-50 transition-colors"
                                onClick={() => setSelectedSlot(slotKey)}
                              >
                                {slotInfo ? (
                                  <div className="space-y-1">
                                    <Badge variant="default" className="text-xs">
                                      {slotInfo.subject}
                                    </Badge>
                                    <div className="text-xs text-gray-600">{slotInfo.faculty}</div>
                                    <div className="text-xs text-gray-500">{slotInfo.classroom}</div>
                                  </div>
                                ) : (
                                  <div className="text-center text-gray-400 text-sm">Click to assign</div>
                                )}
                              </td>
                            )
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  Please select batch, branch, semester, and section to create timetable
                </div>
              )}

              {Object.keys(timetableData).length > 0 && (
                <div className="mt-6 flex justify-end">
                  <Button>
                    <Save className="h-4 w-4 mr-2" />
                    Save Timetable
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
