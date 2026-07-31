import { Building } from "lucide-react";
import { type UseFormReturn } from "react-hook-form";
import { FloatingCard } from "@/components/ui/design-tokens";
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
  const inputStyle = "bg-white/60 border-transparent rounded-xl focus-visible:ring-gray-200 shadow-sm transition-all h-11";

  return (
    <FloatingCard className="p-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2 text-gray-900">
          <Building className="h-5 w-5" />
          <h2 className="text-xl font-bold">Employment Details</h2>
        </div>
        <p className="text-gray-500 text-sm">Job role and organizational information</p>
      </div>
      
      <div className="space-y-6">
        <div className="p-4 bg-white/40 rounded-2xl border border-gray-100 shadow-sm">
          <Label className="text-sm font-medium text-gray-500">Created By</Label>
          <p className="text-sm font-bold text-gray-900 mt-1">{createdByName}</p>
          <p className="text-xs text-gray-400 mt-1">This employee record will be associated with your account</p>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <FormField control={form.control} name="employeeId" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-600 font-medium ml-1">Employee ID {generatedEmployeeId && <span className="text-gray-400 text-xs">(Auto: {generatedEmployeeId})</span>}</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input placeholder={generatedEmployeeId || "EMP-0001"} {...field} readOnly className={`bg-gray-50/50 cursor-not-allowed ${inputStyle}`} />
                  <Button type="button" variant="ghost" size="sm" className="absolute right-1.5 top-1.5 h-8 px-3 text-xs rounded-lg hover:bg-gray-200/50" onClick={onRegenerateId}>Regenerate</Button>
                </div>
              </FormControl>
              <FormMessage />
              <p className="text-xs text-gray-400 ml-1">Auto-generated. Click "Regenerate" for a new one.</p>
            </FormItem>
          )} />
          <FormField control={form.control} name="position" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-600 font-medium ml-1">Position</FormLabel>
              <FormControl><Input placeholder="Software Developer" className={inputStyle} {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <div className="grid grid-cols-1 gap-6">
          <FormField control={form.control} name="department" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-600 font-medium ml-1">Department</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={loadingOptions}>
                <FormControl><SelectTrigger className={inputStyle}><SelectValue placeholder={loadingOptions ? "Loading..." : "Select department"} /></SelectTrigger></FormControl>
                <SelectContent className="rounded-2xl border-gray-100 shadow-xl">
                  {departments.length > 0
                    ? departments.map(d => <SelectItem key={d.id} value={d.id} className="rounded-lg">{d.name}</SelectItem>)
                    : <SelectItem value="__no_departments__" disabled className="rounded-lg">{loadingOptions ? "Loading..." : "No departments available"}</SelectItem>}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <FormField control={form.control} name="salary" render={({ field }) => (
            <FormItem><FormLabel className="text-gray-600 font-medium ml-1">Annual Salary</FormLabel><FormControl><Input placeholder="65000" className={inputStyle} {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="employmentType" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-600 font-medium ml-1">Employment Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={loadingOptions}>
                <FormControl><SelectTrigger className={inputStyle}><SelectValue placeholder={loadingOptions ? "Loading..." : "Select type"} /></SelectTrigger></FormControl>
                <SelectContent className="rounded-2xl border-gray-100 shadow-xl">
                  {employmentTypes.map(t => <SelectItem key={t} value={t} className="rounded-lg">{t.split('-').map(w => w.charAt(0).toUpperCase()+w.slice(1)).join('-')}</SelectItem>)}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <div className="grid grid-cols-1">
          <DatePickerField
            control={form.control} name="hireDate" label="Hire Date"
            inputValue={hireDateInput} setInputValue={setHireDateInput}
            popoverOpen={hireDateOpen} setPopoverOpen={setHireDateOpen}
            disabledDates={(date) => date > new Date() || date < new Date("1900-01-01")}
          />
        </div>
      </div>
    </FloatingCard>
  );
}
