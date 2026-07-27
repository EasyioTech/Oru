import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, Loader2, Key } from "lucide-react";
import { useTeam } from "@/hooks/useTeam";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function AssignUserRoles() {
  const { teamMembers, isLoading } = useTeam();
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [selectedRole, setSelectedRole] = useState("");
  const [assigning, setAssigning] = useState(false);
  const { toast } = useToast();

  const handleAssign = async () => {
    if (!selectedRole || selectedEmployees.length === 0) return;
    setAssigning(true);
    try {
      // Simulate assigning roles via our api
      await Promise.all(selectedEmployees.map(id => api.put(`/hr/employees/${id}`, { role: selectedRole })));
      toast({ title: "Roles Assigned", description: "Successfully updated roles." });
      setSelectedEmployees([]);
      setSelectedRole("");
    } catch (e) {
      toast({ title: "Error", description: "Failed to assign roles", variant: "destructive" });
    } finally {
      setAssigning(false);
    }
  };

  if (isLoading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Assign User Roles</h1>
        <p className="text-muted-foreground">Create accounts and assign roles to employees</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" /> Assignment Settings</CardTitle>
          <CardDescription>Select a role to assign</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select value={selectedRole} onValueChange={setSelectedRole}>
            <SelectTrigger><SelectValue placeholder="Select a role" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="agency_admin">Agency Admin</SelectItem>
              <SelectItem value="manager">Manager</SelectItem>
              <SelectItem value="employee">Employee</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleAssign} disabled={!selectedRole || selectedEmployees.length === 0 || assigning}>
            <Key className="mr-2 h-4 w-4" /> {assigning ? "Processing..." : "Assign Role"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Employees</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {teamMembers.map(emp => (
            <div key={emp.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-4">
                <Checkbox 
                  checked={selectedEmployees.includes(emp.id)}
                  onCheckedChange={(c) => setSelectedEmployees(c ? [...selectedEmployees, emp.id] : selectedEmployees.filter(id => id !== emp.id))}
                />
                <div>
                  <h3 className="font-medium">{emp.fullName}</h3>
                  <p className="text-sm text-muted-foreground">{emp.department || 'No department'}</p>
                </div>
              </div>
              <Badge variant="outline">{emp.role || 'No Role'}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}