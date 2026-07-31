import { Mail, Phone, MapPin, User } from "lucide-react";
import { type UseFormReturn } from "react-hook-form";
import { FloatingCard, MicroLabel } from "@/components/ui/design-tokens";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { type FormValues } from "../formSchema";
import { DatePickerField } from "./DatePickerField";

interface PersonalInfoCardProps {
  form: UseFormReturn<FormValues>;
  companyDomain: string;
  generateWorkEmail: () => void;
  dateOfBirthOpen: boolean;
  setDateOfBirthOpen: (v: boolean) => void;
  dateOfBirthInput: string;
  setDateOfBirthInput: (v: string) => void;
}

export function PersonalInfoCard({
  form, companyDomain, generateWorkEmail,
  dateOfBirthOpen, setDateOfBirthOpen, dateOfBirthInput, setDateOfBirthInput,
}: PersonalInfoCardProps) {
  const inputStyle = "bg-white/60 border-transparent rounded-xl focus-visible:ring-gray-200 shadow-sm transition-all h-11";

  return (
    <FloatingCard className="p-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2 text-gray-900">
          <User className="h-5 w-5" />
          <h2 className="text-xl font-bold">Personal Information</h2>
        </div>
        <p className="text-gray-500 text-sm">Basic employee details</p>
      </div>
      
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <FormField control={form.control} name="firstName" render={({ field }) => (
            <FormItem><FormLabel className="text-gray-600 font-medium ml-1">First Name</FormLabel><FormControl><Input placeholder="John" className={inputStyle} {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="lastName" render={({ field }) => (
            <FormItem><FormLabel className="text-gray-600 font-medium ml-1">Last Name</FormLabel><FormControl><Input placeholder="Doe" className={inputStyle} {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>

        <FormField control={form.control} name="email" render={({ field }) => (
          <FormItem>
            <FormLabel className="text-gray-600 font-medium ml-1">Work email (login)</FormLabel>
            <FormControl>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Mail className="absolute left-4 top-3.5 h-4 w-4 text-gray-400" />
                  <Input placeholder="john.doe@company.com" className={`pl-11 ${inputStyle}`} {...field} />
                </div>
                <Button type="button" variant="outline" size="sm" onClick={generateWorkEmail} className="shrink-0 h-11 rounded-xl bg-white/60 border-transparent hover:bg-gray-100 shadow-sm">
                  Generate
                </Button>
              </div>
            </FormControl>
            <p className="text-xs text-gray-400 ml-1">Generated as firstname.lastName@{companyDomain}</p>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="phone" render={({ field }) => (
          <FormItem>
            <FormLabel className="text-gray-600 font-medium ml-1">Phone Number</FormLabel>
            <FormControl>
              <div className="relative">
                <Phone className="absolute left-4 top-3.5 h-4 w-4 text-gray-400" />
                <Input placeholder="+1 (555) 123-4567" className={`pl-11 ${inputStyle}`} {...field} />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <div className="grid grid-cols-2 gap-6">
          <DatePickerField
            control={form.control} name="dateOfBirth" label="Date of Birth (optional)"
            inputValue={dateOfBirthInput} setInputValue={setDateOfBirthInput}
            popoverOpen={dateOfBirthOpen} setPopoverOpen={setDateOfBirthOpen}
            disabledDates={(date) => date > new Date() || date < new Date("1900-01-01")}
          />
        </div>
      </div>
    </FloatingCard>
  );
}
