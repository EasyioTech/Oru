import { Mail, Phone, MapPin, User } from "lucide-react";
import { type UseFormReturn } from "react-hook-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><User className="h-5 w-5" />Personal Information</CardTitle>
        <CardDescription>Basic employee details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="firstName" render={({ field }) => (
            <FormItem><FormLabel>First Name</FormLabel><FormControl><Input placeholder="John" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="lastName" render={({ field }) => (
            <FormItem><FormLabel>Last Name</FormLabel><FormControl><Input placeholder="Doe" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>

        <FormField control={form.control} name="email" render={({ field }) => (
          <FormItem>
            <FormLabel>Work email (login)</FormLabel>
            <FormControl>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="john.doe@company.com" className="pl-10" {...field} />
                </div>
                <Button type="button" variant="outline" size="sm" onClick={generateWorkEmail} className="shrink-0">Generate</Button>
              </div>
            </FormControl>
            <p className="text-xs text-muted-foreground">Generated as firstname.lastname@{companyDomain}</p>
            <FormMessage />
          </FormItem>
        )} />



        <FormField control={form.control} name="phone" render={({ field }) => (
          <FormItem>
            <FormLabel>Phone Number</FormLabel>
            <FormControl>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input placeholder="+1 (555) 123-4567" className="pl-10" {...field} />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <div className="grid grid-cols-2 gap-4">
          <DatePickerField
            control={form.control} name="dateOfBirth" label="Date of Birth (optional)"
            inputValue={dateOfBirthInput} setInputValue={setDateOfBirthInput}
            popoverOpen={dateOfBirthOpen} setPopoverOpen={setDateOfBirthOpen}
            disabledDates={(date) => date > new Date() || date < new Date("1900-01-01")}
          />
        </div>
      </CardContent>
    </Card>
  );
}
