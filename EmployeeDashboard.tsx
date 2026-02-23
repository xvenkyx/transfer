import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import {
  Award,
  BadgeIcon,
  Briefcase,
  Building2,
  Calendar,
  CalendarDays,
  ClipboardList,
  Hash,
  Home,
  Mail,
  User,
  Users
} from "lucide-react";

/* ===========================
   HOLIDAYS – 2026
=========================== */
const HOLIDAYS_2026 = [
  { name: "New Year’s Day", date: "Jan 1, 2026", region: "USA" },
  { name: "Makar Sankranti", date: "Jan 14, 2026", region: "India" },
  { name: "Memorial Day", date: "May 25, 2026", region: "USA" },
  { name: "Independence Day", date: "Jul 4, 2026", region: "USA" },
  { name: "Labor Day", date: "Sep 7, 2026", region: "USA" },
  {
    name: "Diwali / Deepavali",
    date: "Nov 6 – Nov 10, 2026",
    region: "India",
  },
  { name: "Thanksgiving Day", date: "Nov 26, 2026", region: "USA" },
  {
    name: "Christmas & Year-End Holidays",
    date: "Dec 25, 2026 – Jan 1, 2027",
    region: "USA",
  },
];

export default function EmployeeDashboard() {
  const navigate = useNavigate();
  const { employee } = useAuth();

  // Get initials for avatar
  const getInitials = () => {
    if (!employee?.name) return "U";
    return employee.name
      .split(/[_ ]/)
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not specified";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Get employment status badge color
  const getStatusBadge = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "probation":
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Probation</Badge>;
      case "permanent":
        return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Permanent</Badge>;
      case "contract":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Contract</Badge>;
      default:
        return <Badge variant="outline">{status || "Not specified"}</Badge>;
    }
  };

  // Get employee code from various possible field names
  const employeeCode = employee?.employeeCode || employee?.employeeID || employee?.EmployeeID;

  if (!employee) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48 mt-2" />
          </div>
          <Skeleton className="h-12 w-12 rounded-full" />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome back, {employee.name?.split(/[_ ]/)[0] || "Employee"}!
          </h1>
          <p className="text-sm text-muted-foreground">
            Here's your personal information and overview
          </p>
        </div>
        <Avatar className="h-12 w-12">
          <AvatarFallback className="bg-emerald-100 text-emerald-700">
            {getInitials()}
          </AvatarFallback>
        </Avatar>
      </div>

      {/* Main cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Personal Information */}
        <Card className="md:col-span-2 lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-emerald-600" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Full Name:</span>
                  <span className="font-medium">{employee.name?.replace(/[_ ]/g, " ")}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-medium">{employee.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Date of Birth:</span>
                  <span className="font-medium">{formatDate(employee.dob)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Gender:</span>
                  <span className="font-medium">{employee.gender || "—"}</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Hash className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Employee Code:</span>
                  <span className="font-medium">{employeeCode || "—"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <BadgeIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">PAN:</span>
                  <span className="font-medium">{employee.pan || "—"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Home className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Address:</span>
                  <span className="font-medium">{employee.address || "—"}</span>
                </div>
                {employee.uan && (
                  <div className="flex items-center gap-2 text-sm">
                    <Award className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">UAN:</span>
                    <span className="font-medium">{employee.uan}</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Employment Status Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Briefcase className="h-4 w-4 text-emerald-600" />
              Employment Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status:</span>
                {getStatusBadge(employee.employmentStatus)}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Team Lead:</span>
                <Badge variant="outline" className={employee.isTL ? "bg-purple-50 text-purple-700" : ""}>
                  {employee.isTL ? "Yes" : "No"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Registration:</span>
                <Badge variant="outline" className={employee.registrationComplete ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}>
                  {employee.registrationComplete ? "Complete" : "Pending"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Work Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Building2 className="h-4 w-4 text-emerald-600" />
              Work Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Department:</span>
                <span className="font-medium">{employee.department || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Designation:</span>
                <span className="font-medium">{employee.designation || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Branch:</span>
                <span className="font-medium">{employee.branch || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date of Joining:</span>
                <span className="font-medium">{formatDate(employee.dateOfJoining)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Leave Balance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <ClipboardList className="h-4 w-4 text-emerald-600" />
              Leave Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            {employee.leaveBalance ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg bg-muted p-3 text-center">
                    <div className="text-xs text-muted-foreground">CPL</div>
                    <div className="text-2xl font-semibold text-emerald-600">
                      {employee.leaveBalance.CPL ?? 0}
                    </div>
                  </div>
                  <div className="rounded-lg bg-muted p-3 text-center">
                    <div className="text-xs text-muted-foreground">SL</div>
                    <div className="text-2xl font-semibold text-emerald-600">
                      {employee.leaveBalance.SL ?? 0}
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  CPL: Casual Leave • SL: Sick Leave
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Leave balance unavailable
              </p>
            )}
          </CardContent>
        </Card>

        {/* Holidays */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-emerald-600" />
              Holidays – 2026
            </CardTitle>
          </CardHeader>
          <CardContent className="max-h-64 space-y-2 overflow-y-auto text-sm">
            {HOLIDAYS_2026.map((h) => (
              <div key={h.name} className="flex justify-between border-b pb-1 last:border-0">
                <span>{h.name}</span>
                <span className="text-muted-foreground">{h.date}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* System Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <CalendarDays className="h-4 w-4 text-emerald-600" />
              Account Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created:</span>
                <span className="font-medium">
                  {employee.createdAt ? new Date(employee.createdAt).toLocaleDateString() : "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Updated:</span>
                <span className="font-medium">
                  {employee.updatedAt ? new Date(employee.updatedAt).toLocaleDateString() : "—"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 md:flex-row">
          <Button variant="outline" onClick={() => navigate("/profile")}>
            <User className="mr-2 h-4 w-4" />
            View Full Profile
          </Button>
          <Button variant="outline" onClick={() => navigate("/leave")}>
            <ClipboardList className="mr-2 h-4 w-4" />
            Apply Leave
          </Button>
          <Button variant="outline" onClick={() => navigate("/holidays")}>
            <Calendar className="mr-2 h-4 w-4" />
            View All Holidays
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
