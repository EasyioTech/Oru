import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Plus, X } from 'lucide-react';
import type { AgencySetupFormData } from '../../types';

interface TeamMembersStepProps {
  formData: AgencySetupFormData;
  setFormData: React.Dispatch<React.SetStateAction<AgencySetupFormData>>;
}

export function TeamMembersStep({ formData, setFormData }: TeamMembersStepProps) {
  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-slate-200 dark:border-slate-800">
        <h3 className="text-lg md:text-xl font-semibold mb-1.5 flex items-center gap-2 text-slate-900 dark:text-white">
          <Users className="h-5 w-5 text-primary" />
          Department Heads
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Add the key department heads who should lead each area. Other employees can be added later from the employee
          management page.
        </p>
      </div>

      <div className="space-y-4">
        {formData.teamMembers.map((member, index) => (
          <Card key={index} className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <CardHeader className="pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-slate-900 dark:text-white">
                  Team Member {index + 1}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFormData((prev) => ({
                      ...prev,
                      teamMembers: prev.teamMembers.filter((_, i) => i !== index),
                    }));
                  }}
                  className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Full Name *</Label>
                  <Input
                    value={member.name}
                    onChange={(e) => {
                      const updated = [...formData.teamMembers];
                      updated[index].name = e.target.value;
                      setFormData((prev) => ({ ...prev, teamMembers: updated }));
                    }}
                    placeholder="John Doe"
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email Address *</Label>
                  <Input
                    type="email"
                    value={member.email}
                    onChange={(e) => {
                      const updated = [...formData.teamMembers];
                      updated[index].email = e.target.value;
                      setFormData((prev) => ({ ...prev, teamMembers: updated }));
                    }}
                    placeholder="john@company.com"
                    className="h-11 md:h-11 text-base"
                    autoComplete="email"
                    inputMode="email"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Job Title</Label>
                  <Input
                    value={member.title}
                    onChange={(e) => {
                      const updated = [...formData.teamMembers];
                      updated[index].title = e.target.value;
                      setFormData((prev) => ({ ...prev, teamMembers: updated }));
                    }}
                    placeholder="e.g., Software Engineer"
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Department</Label>
                  <Select
                    value={member.department}
                    onValueChange={(value) => {
                      const updated = [...formData.teamMembers];
                      updated[index].department = value;
                      setFormData((prev) => ({ ...prev, teamMembers: updated }));
                    }}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {formData.departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.name}>
                          {dept.name}
                        </SelectItem>
                      ))}
                      <SelectItem value="none">None</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Role</Label>
                  <Input
                    value="Department Head"
                    disabled
                    className="h-11 bg-muted cursor-not-allowed"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Phone</Label>
                  <Input
                    type="tel"
                    value={member.phone}
                    onChange={(e) => {
                      const updated = [...formData.teamMembers];
                      updated[index].phone = e.target.value;
                      setFormData((prev) => ({ ...prev, teamMembers: updated }));
                    }}
                    placeholder="+1 (555) 123-4567"
                    className="h-11 md:h-11 text-base"
                    autoComplete="tel"
                    inputMode="tel"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        <Button
          variant="outline"
          className="w-full"
          onClick={() => {
            setFormData((prev) => ({
              ...prev,
              teamMembers: [
                ...prev.teamMembers,
                {
                  name: '',
                  email: '',
                  role: 'department_head',
                  department: '',
                  phone: '',
                  title: '',
                },
              ],
            }));
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Team Member
        </Button>

        {formData.teamMembers.length === 0 && (
          <Card className="p-6 text-center border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30">
            <Users className="h-10 w-10 mx-auto mb-3 text-slate-400 dark:text-slate-500" />
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">No team members added yet</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              You can add team members now or later from the employee management page
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
