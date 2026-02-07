import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, Plus, X, DollarSign } from 'lucide-react';
import { generateUUID } from '@/lib/uuid';
import type { AgencySetupFormData } from '../../types';

interface DepartmentsStepProps {
  formData: AgencySetupFormData;
  setFormData: React.Dispatch<React.SetStateAction<AgencySetupFormData>>;
}

export function DepartmentsStep({ formData, setFormData }: DepartmentsStepProps) {
  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-slate-200 dark:border-slate-800">
        <h3 className="text-lg md:text-xl font-semibold mb-1.5 flex items-center gap-2 text-slate-900 dark:text-white">
          <Briefcase className="h-5 w-5 text-primary" />
          Organizational Structure
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Set up your departments and organizational hierarchy
        </p>
      </div>

      <div className="space-y-4">
        {formData.departments.map((dept, index) => (
          <Card key={dept.id} className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <CardHeader className="pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-slate-900 dark:text-white">
                  Department {index + 1}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFormData((prev) => ({
                      ...prev,
                      departments: prev.departments.filter((_, i) => i !== index),
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
                  <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Department Name *
                  </Label>
                  <Input
                    value={dept.name}
                    onChange={(e) => {
                      const updated = [...formData.departments];
                      updated[index].name = e.target.value;
                      setFormData((prev) => ({ ...prev, departments: updated }));
                    }}
                    placeholder="e.g., Engineering, Sales, HR"
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Department Manager
                  </Label>
                  <Input
                    value={dept.manager}
                    onChange={(e) => {
                      const updated = [...formData.departments];
                      updated[index].manager = e.target.value;
                      setFormData((prev) => ({ ...prev, departments: updated }));
                    }}
                    placeholder="Manager name"
                    className="h-11"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Description</Label>
                  <Textarea
                    value={dept.description}
                    onChange={(e) => {
                      const updated = [...formData.departments];
                      updated[index].description = e.target.value;
                      setFormData((prev) => ({ ...prev, departments: updated }));
                    }}
                    placeholder="Brief description of department responsibilities"
                    rows={2}
                    className="resize-none"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Annual Budget (Optional)
                  </Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      value={dept.budget}
                      onChange={(e) => {
                        const updated = [...formData.departments];
                        updated[index].budget = e.target.value;
                        setFormData((prev) => ({ ...prev, departments: updated }));
                      }}
                      placeholder="0.00"
                      className="h-11 md:h-11 pl-10 text-base"
                      inputMode="decimal"
                      autoComplete="off"
                    />
                  </div>
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
              departments: [
                ...prev.departments,
                {
                  id: generateUUID(),
                  name: '',
                  description: '',
                  manager: '',
                  budget: '',
                },
              ],
            }));
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Department
        </Button>

        {formData.departments.length === 0 && (
          <Card className="p-6 text-center border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30">
            <Briefcase className="h-10 w-10 mx-auto mb-3 text-slate-400 dark:text-slate-500" />
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">No departments added yet</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              You can add departments now or later from the department management page
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
