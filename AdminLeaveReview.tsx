import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Calendar,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AdminLeaveReview() {
  const { leaveId } = useParams();
  const navigate = useNavigate();

  const [leave, setLeave] = useState<any>(null);
  const [, setAllLeaves] = useState<any[]>([]);
  const [employeeBalance, setEmployeeBalance] = useState<{
    CPL: number;
    SL: number;
  } | null>(null);
  const [sandwichApplied, setSandwichApplied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [cpl, setCpl] = useState(0);
  const [sl, setSl] = useState(0);
  const [lop, setLop] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all leaves from admin history
        const leaveRes = await api.get("/leave/admin/history");
        const leavesData = leaveRes.data || [];
        setAllLeaves(leavesData);

        const currentLeave = leavesData.find((x: any) => x.LeaveID === leaveId);
        setSandwichApplied(currentLeave.sandwichApplied || false);

        if (currentLeave) {
          setLeave(currentLeave);

          // Get the REAL employee balance from the leave data
          const realBalance = currentLeave.employeeLeaveBalance ||
            currentLeave.leaveBalance || { CPL: 0, SL: 0 };

          setEmployeeBalance(realBalance);

          // Pre-fill the breakup values if they exist
          if (currentLeave.breakup) {
            setCpl(currentLeave.breakup.CPL || 0);
            setSl(currentLeave.breakup.SL || 0);
            setLop(currentLeave.breakup.LOP || 0);
          }
        }
      } catch (error) {
        console.error("Failed to fetch leave data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [leaveId]);

  useEffect(() => {
    if (!leave) return;
    const total = leave.totalDays;
    let adjustedTotal = total;

    if (sandwichApplied) {
      adjustedTotal += leave.sandwichWeekendDays || 0;
    }

    const remaining = adjustedTotal - (cpl + sl);
    setLop(remaining > 0 ? remaining : 0);
  }, [cpl, sl, leave, sandwichApplied]);

  // Calculate the difference between old and new allocation
  const oldBreakup = leave?.breakup || { CPL: 0, SL: 0, LOP: 0 };
  const cplDifference = cpl - oldBreakup.CPL; // Positive = adding more, Negative = reducing
  const slDifference = sl - oldBreakup.SL;

  // Calculate estimated balance after update
  const estimatedCPLAfter = employeeBalance
    ? employeeBalance.CPL - cplDifference
    : 0;
  const estimatedSLAfter = employeeBalance
    ? employeeBalance.SL - slDifference
    : 0;

  // Check if balance is sufficient
  // For updates: only check if we're adding more leave (positive difference)
  // For new approvals: check the total allocation
  const isBalanceSufficient = employeeBalance
    ? leave?.status === "APPROVED"
      ? (cplDifference <= 0 || cpl <= employeeBalance.CPL) &&
        (slDifference <= 0 || sl <= employeeBalance.SL)
      : cpl <= employeeBalance.CPL && sl <= employeeBalance.SL
    : true;

  const approve = async () => {
    try {
      setSubmitting(true);

      await api.post("/leave/approve", {
        LeaveID: leave.LeaveID,
        action: "APPROVE",
        breakup: { CPL: cpl, SL: sl, LOP: lop },
        sandwichApplied,
      });

      setSuccessMessage(
        leave.status === "APPROVED"
          ? "Leave allocation updated successfully"
          : "Leave approved successfully"
      );
      setTimeout(() => navigate("/admin/leave"), 1500);
    } catch (error: any) {
      console.error("Error:", error);
      const errorMsg = error.response?.data?.error || "Failed to process leave";
      alert(`Error: ${errorMsg}`);
    } finally {
      setSubmitting(false);
    }
  };

  const reject = async () => {
    if (leave.status !== "PENDING_HR") {
      alert("Only PENDING_HR leaves can be rejected");
      return;
    }

    try {
      setSubmitting(true);
      await api.post("/leave/approve", {
        LeaveID: leave.LeaveID,
        action: "REJECT",
      });

      setSuccessMessage("Leave rejected successfully");
      setTimeout(() => navigate("/admin/leave"), 1500);
    } catch (error: any) {
      console.error("Error:", error);
      const errorMsg = error.response?.data?.error || "Failed to reject leave";
      alert(`Error: ${errorMsg}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/admin/leave")}
            disabled
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="h-6 w-48 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-32 bg-gray-200 rounded animate-pulse"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  if (!leave) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/admin/leave")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Leave Not Found</h3>
            <p className="text-muted-foreground">
              The requested leave could not be found.
            </p>
            <Button className="mt-4" onClick={() => navigate("/admin/leave")}>
              Return to Leave List
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const [year, month, day] = dateString.split("-").map(Number);
    const date = new Date(year, month - 1, day); // LOCAL date, not UTC
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 space-y-6">
      {/* Header with Back Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/admin/leave")}
            className="hover:bg-gray-100"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to List
          </Button>
          <h1 className="text-xl sm:text-2xl font-semibold">
            Review Leave Request
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className={
              leave.status === "APPROVED"
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : leave.status === "PENDING_HR"
                ? "bg-blue-50 text-blue-700 border-blue-200"
                : leave.status === "PENDING_TL"
                ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                : "bg-red-50 text-red-700 border-red-200"
            }
          >
            {leave.status === "APPROVED"
              ? "Approved"
              : leave.status === "PENDING_HR"
              ? "Pending HR"
              : leave.status === "PENDING_TL"
              ? "Pending TL"
              : "Rejected"}
          </Badge>
        </div>
      </div>

      {successMessage && (
        <div className="rounded-md bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            {successMessage}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Leave Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Employee Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4" />
                Employee Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">
                    Employee Name
                  </p>
                  <p className="font-medium text-lg">
                    {leave.employeeName || "—"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">
                    Employee Code
                  </p>
                  <p className="font-mono font-medium text-lg">
                    {leave.employeeCode || leave.EmployeeID || "—"}
                  </p>
                </div>
              </div>

              <div className="border-t pt-4">
                <CardTitle className="text-base flex items-center gap-2 mb-4">
                  <Calendar className="h-4 w-4" />
                  Leave Details
                </CardTitle>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">
                      Start Date
                    </p>
                    <p className="font-medium">{formatDate(leave.startDate)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">
                      End Date
                    </p>
                    <p className="font-medium">{formatDate(leave.endDate)}</p>
                  </div>
                </div>

                <div className="mt-4 space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">
                    Total Days
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-lg">
                      {leave.totalDays} days
                    </p>
                    <Badge variant="outline" className="bg-gray-50">
                      {formatDate(leave.startDate)} →{" "}
                      {formatDate(leave.endDate)}
                    </Badge>
                  </div>
                </div>

                <div className="mt-4 space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">
                    Reason
                  </p>
                  <p className="text-sm bg-gray-50 rounded-md p-3 border border-gray-200">
                    {leave.reason || "—"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Leave Allocation Card */}
          <Card>
            {leave.sandwichEligible && (
              <div className="rounded-md bg-amber-50 border border-amber-200 p-3 mb-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5" />
                  <div className="text-sm text-amber-700">
                    <p className="font-medium">Sandwich Leave Detected</p>
                    <p>
                      This leave qualifies for weekend deduction (
                      {leave.sandwichWeekendDays} days).
                    </p>

                    <div className="mt-2 flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={sandwichApplied}
                        onChange={(e) => setSandwichApplied(e.target.checked)}
                      />
                      <span>Apply Sandwich (Add weekend to LOP)</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <CardHeader>
              <CardTitle className="text-base">Allocate Leave Days</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">
                        CPL (Casual)
                      </label>
                      {employeeBalance && (
                        <span
                          className={`text-xs ${
                            cpl > employeeBalance.CPL
                              ? "text-red-500"
                              : "text-gray-500"
                          }`}
                        >
                          Available: {employeeBalance.CPL}
                        </span>
                      )}
                    </div>
                    <Input
                      type="number"
                      value={cpl}
                      onChange={(e) => setCpl(Math.max(0, +e.target.value))}
                      disabled={submitting}
                      min={0}
                      max={employeeBalance?.CPL || leave.totalDays}
                      className={
                        employeeBalance && cpl > employeeBalance.CPL
                          ? "border-red-300 focus-visible:ring-red-500"
                          : ""
                      }
                    />
                    {employeeBalance && cpl > employeeBalance.CPL && (
                      <p className="text-xs text-red-500">
                        Exceeds available balance by {cpl - employeeBalance.CPL}{" "}
                        days
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">SL (Sick)</label>
                      {employeeBalance && (
                        <span
                          className={`text-xs ${
                            sl > employeeBalance.SL
                              ? "text-red-500"
                              : "text-gray-500"
                          }`}
                        >
                          Available: {employeeBalance.SL}
                        </span>
                      )}
                    </div>
                    <Input
                      type="number"
                      value={sl}
                      onChange={(e) => setSl(Math.max(0, +e.target.value))}
                      disabled={submitting}
                      min={0}
                      max={employeeBalance?.SL || leave.totalDays}
                      className={
                        employeeBalance && sl > employeeBalance.SL
                          ? "border-red-300 focus-visible:ring-red-500"
                          : ""
                      }
                    />
                    {employeeBalance && sl > employeeBalance.SL && (
                      <p className="text-xs text-red-500">
                        Exceeds available balance by {sl - employeeBalance.SL}{" "}
                        days
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      LOP (Loss of Pay)
                    </label>
                    <Input disabled value={lop} className="bg-gray-50" />
                    <p className="text-xs text-gray-500">Auto-calculated</p>
                  </div>
                </div>

                {/* Allocation Summary */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium">
                      Allocation Summary
                    </span>
                    <span
                      className={`text-sm font-bold ${
                        cpl + sl + lop === leave.totalDays
                          ? "text-emerald-600"
                          : "text-amber-600"
                      }`}
                    >
                      {cpl + sl + lop} /{" "}
                      {sandwichApplied
                        ? leave.totalDays + leave.sandwichWeekendDays
                        : leave.totalDays}{" "}
                      days
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                    <div
                      className={`h-2.5 rounded-full transition-all duration-300 ${
                        cpl + sl + lop === leave.totalDays
                          ? "bg-emerald-600"
                          : "bg-amber-500"
                      }`}
                      style={{
                        width: `${((cpl + sl + lop) / leave.totalDays) * 100}%`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-600 mt-2">
                    <div className="text-center">
                      <div className="font-medium">CPL</div>
                      <div className="text-gray-500">{cpl} days</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium">SL</div>
                      <div className="text-gray-500">{sl} days</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium">LOP</div>
                      <div className="text-gray-500">{lop} days</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Employee Balance & Actions */}
        <div className="space-y-6">
          {/* Employee Leave Balance Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Employee Leave Balance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {employeeBalance ? (
                <>
                  <div className="space-y-4">
                    {/* CPL Balance */}
                    <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-emerald-800">
                          Casual Paid Leave
                        </span>
                        <span
                          className={`font-bold ${
                            cpl > employeeBalance.CPL
                              ? "text-red-600"
                              : "text-emerald-700"
                          }`}
                        >
                          {employeeBalance.CPL}
                        </span>
                      </div>
                      <div className="text-xs text-emerald-600">
                        {leave.status === "APPROVED" && oldBreakup.CPL > 0 ? (
                          <div className="space-y-1">
                            <div className="flex justify-between">
                              <span>Current Balance:</span>
                              <span className="font-medium">
                                {employeeBalance.CPL}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Previous Allocation:</span>
                              <span className="font-medium text-gray-600">
                                {oldBreakup.CPL} days
                              </span>
                            </div>
                            {cplDifference !== 0 && (
                              <div className="flex justify-between">
                                <span>Adjustment:</span>
                                <span
                                  className={`font-medium ${
                                    cplDifference > 0
                                      ? "text-red-600"
                                      : "text-emerald-600"
                                  }`}
                                >
                                  {cplDifference > 0 ? "+" : ""}
                                  {cplDifference} days
                                </span>
                              </div>
                            )}
                            <div className="flex justify-between border-t border-emerald-200 pt-1 mt-1">
                              <span className="font-medium">
                                New Allocation:
                              </span>
                              <span className="font-medium">{cpl} days</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium">
                                Remaining After:
                              </span>
                              <span
                                className={`font-bold ${
                                  estimatedCPLAfter < 0
                                    ? "text-red-600"
                                    : "text-emerald-800"
                                }`}
                              >
                                {estimatedCPLAfter} days
                              </span>
                            </div>
                          </div>
                        ) : cpl > 0 ? (
                          <div className="space-y-1">
                            <div className="flex justify-between">
                              <span>Current Balance:</span>
                              <span className="font-medium">
                                {employeeBalance.CPL}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>This Allocation:</span>
                              <span className="font-medium text-red-600">
                                -{cpl}
                              </span>
                            </div>
                            <div className="flex justify-between border-t border-emerald-200 pt-1 mt-1">
                              <span className="font-medium">
                                Remaining After:
                              </span>
                              <span
                                className={`font-bold ${
                                  estimatedCPLAfter < 0
                                    ? "text-red-600"
                                    : "text-emerald-800"
                                }`}
                              >
                                {estimatedCPLAfter} days
                              </span>
                            </div>
                          </div>
                        ) : (
                          <span className="font-medium">
                            {employeeBalance.CPL} days available
                          </span>
                        )}
                      </div>
                    </div>

                    {/* SL Balance */}
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-blue-800">
                          Sick Leave
                        </span>
                        <span
                          className={`font-bold ${
                            sl > employeeBalance.SL
                              ? "text-red-600"
                              : "text-blue-700"
                          }`}
                        >
                          {employeeBalance.SL}
                        </span>
                      </div>
                      <div className="text-xs text-blue-600">
                        {leave.status === "APPROVED" && oldBreakup.SL > 0 ? (
                          <div className="space-y-1">
                            <div className="flex justify-between">
                              <span>Current Balance:</span>
                              <span className="font-medium">
                                {employeeBalance.SL}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Previous Allocation:</span>
                              <span className="font-medium text-gray-600">
                                {oldBreakup.SL} days
                              </span>
                            </div>
                            {slDifference !== 0 && (
                              <div className="flex justify-between">
                                <span>Adjustment:</span>
                                <span
                                  className={`font-medium ${
                                    slDifference > 0
                                      ? "text-red-600"
                                      : "text-emerald-600"
                                  }`}
                                >
                                  {slDifference > 0 ? "+" : ""}
                                  {slDifference} days
                                </span>
                              </div>
                            )}
                            <div className="flex justify-between border-t border-blue-200 pt-1 mt-1">
                              <span className="font-medium">
                                New Allocation:
                              </span>
                              <span className="font-medium">{sl} days</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium">
                                Remaining After:
                              </span>
                              <span
                                className={`font-bold ${
                                  estimatedSLAfter < 0
                                    ? "text-red-600"
                                    : "text-blue-800"
                                }`}
                              >
                                {estimatedSLAfter} days
                              </span>
                            </div>
                          </div>
                        ) : sl > 0 ? (
                          <div className="space-y-1">
                            <div className="flex justify-between">
                              <span>Current Balance:</span>
                              <span className="font-medium">
                                {employeeBalance.SL}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>This Allocation:</span>
                              <span className="font-medium text-red-600">
                                -{sl}
                              </span>
                            </div>
                            <div className="flex justify-between border-t border-blue-200 pt-1 mt-1">
                              <span className="font-medium">
                                Remaining After:
                              </span>
                              <span
                                className={`font-bold ${
                                  estimatedSLAfter < 0
                                    ? "text-red-600"
                                    : "text-blue-800"
                                }`}
                              >
                                {estimatedSLAfter} days
                              </span>
                            </div>
                          </div>
                        ) : (
                          <span className="font-medium">
                            {employeeBalance.SL} days available
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {!isBalanceSufficient && (
                    <div className="rounded-md bg-red-50 border border-red-200 p-3">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" />
                        <div className="text-sm text-red-700">
                          <p className="font-medium">Insufficient Balance</p>
                          <p>Adjust leave allocation to proceed</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {isBalanceSufficient && (cpl > 0 || sl > 0) && (
                    <div className="rounded-md bg-emerald-50 border border-emerald-200 p-3">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5" />
                        <div className="text-sm text-emerald-700">
                          <p className="font-medium">Balance is sufficient</p>
                          <p>Employee has enough leave balance</p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">
                    Balance information loading...
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {leave.status === "APPROVED" && (
                <div className="rounded-md bg-blue-50 border border-blue-200 p-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5" />
                    <div className="text-sm text-blue-700">
                      <p className="font-medium">Updating Approved Leave</p>
                      <p>
                        Adjusting from {oldBreakup.CPL} CPL, {oldBreakup.SL} SL
                        to {cpl} CPL, {sl} SL
                      </p>
                      {cplDifference !== 0 || slDifference !== 0 ? (
                        <p className="mt-1 text-xs">
                          Balance adjustment:
                          {cplDifference !== 0 &&
                            ` CPL: ${
                              cplDifference > 0 ? "+" : ""
                            }${cplDifference}`}
                          {slDifference !== 0 &&
                            ` SL: ${
                              slDifference > 0 ? "+" : ""
                            }${slDifference}`}
                        </p>
                      ) : (
                        <p className="mt-1 text-xs">No changes to allocation</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <Button
                  className="w-full bg-emerald-700 hover:bg-emerald-800"
                  onClick={approve}
                  disabled={submitting || !isBalanceSufficient}
                  size="lg"
                >
                  {submitting
                    ? leave.status === "APPROVED"
                      ? "Updating..."
                      : "Approving..."
                    : leave.status === "APPROVED"
                    ? "Update Allocation"
                    : "Approve Leave"}
                </Button>

                {leave.status === "PENDING_HR" && (
                  <Button
                    variant="outline"
                    className="w-full border-red-300 text-red-700 hover:bg-red-50 hover:text-red-800"
                    onClick={reject}
                    disabled={submitting}
                    size="lg"
                  >
                    {submitting ? "Rejecting..." : "Reject Leave"}
                  </Button>
                )}

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate("/admin/leave")}
                  disabled={submitting}
                >
                  Cancel & Return
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
