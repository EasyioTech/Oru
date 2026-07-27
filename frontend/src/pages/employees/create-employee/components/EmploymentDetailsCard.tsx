import { Building } from "lucide-react";
import { type UseFormReturn } from "react-hook-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { type FormValues, type Department } from "../formSchema";
import { DatePickerField } from "./DatePickerField";

interface EmploymentDetailsCardProps {
  form: UseFormReturn<FormValues>;
  departments: Department[];
  employmentTypes: string[];
  loadingOptions: boolean;
  generatedEmployeeId: string;
  onRegenerateId: () => void;
  hireDateOpen: boolean;
  setHireDateOpen: (v: boolean) => void;
  hireDateInput: string;
  setHireDateInput: (v: string) => void;
  createdByName: string;
}

export function EmploymentDetailsCard({
  form, departments, employmentTypes, loadingOptions,
  generatedEmployeeId, onRegenerateId,
  hireDateOpen, setHireDateOpen, hireDateInput, setHireDateInput,
  createdByName,
}: EmploymentDetailsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Building className="h-5 w-5" />Employment Details</CardTitle>
        <CardDescription>Job role and organizational information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 bg-muted/50 rounded-lg border border-dashed">
          <Label className="text-sm font-medium text-muted-foreground">Created By</Label>
          <p className="text-sm font-semibold mt-1">{createdByName}</p>
          <p className="text-xs text-muted-foreground mt-1">This employee record will be associated with your account</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="employeeId" render={({ field }) => (
            <FormItem>
              <FormLabel>Employee ID {generatedEmployeeId && <span className="text-muted-foreground text-xs">(Auto: {generatedEmployeeId})</span>}</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input placeholder={generatedEmployeeId || "EMP-0001"} {...field} readOnly className="bg-muted cursor-not-allowed" />
                  <Button type="button" variant="ghost" size="sm" className="absolute right-1 top-1 h-7 px-2 text-xs" onClick={onRegenerateId}>Regenerate</Button>
                </div>
              </FormControl>
              <FormMessage />
              <p className="text-xs text-muted-foreground">Auto-generated. Click "Regenerate" for a new one.</p>
            </FormItem>
          )} />
          <FormField control={form.control} name="position" render={({ field }) => (
            <FormItem>
              <FormLabel>Position</FormLabel>
              <FormControl><Input placeholder="Software Developer" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <div className="grid grid-cols-1 gap-4">
          <FormField control={form.control} name="department" render={({ field }) => (
            <FormItem>
              <FormLabel>Department</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={loadingOptions}>
                <FormControl><SelectTrigger><SelectValue placeholder={loadingOptions ? "Loading..." : "Select department"} /></SelectTrigger></FormControl>
                <SelectContent>
                  {departments.length > 0
                    ? departments.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)
                    : <SelectItem value="__no_departments__" disabled>{loadingOptions ? "Loading..." : "No departments available"}</SelectItem>}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="salary" render={({ field }) => (
            <FormItem><FormLabel>Annual Salary</FormLabel><FormControl><Input placeholder="65000" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="employmentType" render={({ field }) => (
            <FormItem>
              <FormLabel>Employment Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={loadingOptions}>
                <FormControl><SelectTrigger><SelectValue placeholder={loadingOptions ? "Loading..." : "Select type"} /></SelectTrigger></FormControl>
                <SelectContent>
                  {employmentTypes.map(t => <SelectItem key={t} value={t}>{t.split('-').map(w => w.charAt(0).toUpperCase()+w.slice(1)).join('-')}</SelectItem>)}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
        </div>



        <DatePickerField
          control={form.control} name="hireDate" label="Hire Date"
          inputValue={hireDateInput} setInputValue={setHireDateInput}
          popoverOpen={hireDateOpen} setPopoverOpen={setHireDateOpen}
          disabledDates={(date) => date > new Date() || date < new Date("1900-01-01")}
        />
      </CardContent>
    </Card>
  );
}
