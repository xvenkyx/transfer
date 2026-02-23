import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

type AttendanceRecord = {
  employeeId: string;
  employeeName: string;
  date: string;
  status: string;
};

export default function AdminAttendance() {
  const [month, setMonth] = useState<string>(
    new Date().toISOString().slice(0, 7)
  );
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);

  /* ===========================
     FETCH ATTENDANCE
  ============================ */
  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/attendance/admin?month=${month}`);
      console.log("Attendance response:", res.data);

      // Safety guard
      setAttendance(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Fetch attendance failed:", err);
      setAttendance([]);
    } finally {
      setLoading(false);
    }
  };

  /* ===========================
     SYNC GOOGLE SHEET
  ============================ */
  const syncSheet = async () => {
    try {
      setLoading(true);

      await api.post(`/attendance/admin?month=${month}`);

      await fetchAttendance();

      alert("Attendance synced successfully!");
    } catch (err) {
      console.error("Sync failed:", err);
      alert("Sync failed. Check console.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [month]);

  /* ===========================
     SUMMARY CALCULATION
  ============================ */
  const totalAbsent = attendance.filter(
    (a) => a.status === "ABSENT"
  ).length;

  const totalHalf = attendance.filter(
    (a) => a.status === "HALF_DAY"
  ).length;

  const totalDeduction = totalAbsent + totalHalf * 0.5;

  return (
    <div className="p-6 space-y-6">
      {/* ===========================
          HEADER CARD
      ============================ */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance Management</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4 items-center">
          <Input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          />

          <Button onClick={fetchAttendance}>
            Refresh
          </Button>

          <Button
            variant="secondary"
            onClick={syncSheet}
          >
            Sync from Google Sheet
          </Button>
        </CardContent>
      </Card>

      {/* ===========================
          SUMMARY CARD
      ============================ */}
      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-6">
          <div>
            Absent Days: <strong>{totalAbsent}</strong>
          </div>
          <div>
            Half Days: <strong>{totalHalf}</strong>
          </div>
          <div>
            Deduction Days: <strong>{totalDeduction}</strong>
          </div>
        </CardContent>
      </Card>

      {/* ===========================
          TABLE CARD
      ============================ */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance Records</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading...</p>
          ) : attendance.length === 0 ? (
            <p>No records found for selected month.</p>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b">
                  <th>Date</th>
                  <th>Employee</th>
                  <th>Status</th>
                  <th>Salary Impact</th>
                </tr>
              </thead>
              <tbody>
                {attendance.map((record) => {
                  let impact = 0;

                  if (record.status === "ABSENT") impact = 1;
                  if (record.status === "HALF_DAY") impact = 0.5;

                  return (
                    <tr
                      key={`${record.employeeId}-${record.date}`}
                      className="border-b"
                    >
                      <td>{record.date}</td>
                      <td>{record.employeeName}</td>
                      <td>
                        <Badge
                          variant={
                            record.status === "ABSENT"
                              ? "destructive"
                              : record.status === "HALF_DAY"
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {record.status}
                        </Badge>
                      </td>
                      <td>{impact}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
