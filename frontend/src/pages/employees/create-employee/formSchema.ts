import { z } from "zod";

export const formSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid work email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  dateOfBirth: z.date({ required_error: "Date of birth is required" }).optional(),
  employeeId: z.string().optional(),
  position: z.string().min(2, "Position is required"),
  department: z.string().min(1, "Department is required"),
  hireDate: z.date({ required_error: "Hire date is required" }),
  employmentType: z.string().min(1, "Employment type is required"),
  salary: z.string().min(1, "Salary is required").refine(
    (s) => { const n = parseFloat(s); return !Number.isNaN(n) && n > 0; },
    { message: "Salary must be a positive number" }
  ),
  notes: z.string().optional(),
});

export type FormValues = z.infer<typeof formSchema>;

export interface Department {
  id: string;
  name: string;
}

export const DEFAULT_FORM_VALUES: Partial<FormValues> = {
  firstName: "", lastName: "", email: "", phone: "",
  employeeId: "", position: "", department: "", salary: "",
  employmentType: "full-time", notes: "",
};
