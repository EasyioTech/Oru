/**
 * Emergency contact form section
 */

import { FloatingCard } from "@/components/ui/design-tokens";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import type { UseFormReturn } from "react-hook-form";
import { ShieldAlert } from "lucide-react";

interface EmergencyContactSectionProps {
  form: UseFormReturn<{
    emergencyContactName: string;
    emergencyContactPhone: string;
    emergencyContactRelationship: string;
  }>;
}

export function EmergencyContactSection({ form }: EmergencyContactSectionProps) {
  const inputStyle = "bg-white/60 border-transparent rounded-xl focus-visible:ring-gray-200 shadow-sm transition-all h-11";

  return (
    <FloatingCard className="p-8">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2 text-gray-900">
          <ShieldAlert className="h-5 w-5" />
          <h2 className="text-xl font-bold">Emergency Contact</h2>
        </div>
        <p className="text-gray-500 text-sm">Emergency contact information</p>
      </div>
      
      <div className="space-y-6">
        <FormField
          control={form.control as any}
          name="emergencyContactName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-600 font-medium ml-1">Contact Name</FormLabel>
              <FormControl>
                <Input placeholder="Jane Doe" className={inputStyle} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-6">
          <FormField
            control={form.control as any}
            name="emergencyContactPhone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-600 font-medium ml-1">Contact Phone</FormLabel>
                <FormControl>
                  <Input placeholder="+1 (555) 987-6543" className={inputStyle} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control as any}
            name="emergencyContactRelationship"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-600 font-medium ml-1">Relationship</FormLabel>
                <FormControl>
                  <Input placeholder="Spouse" className={inputStyle} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </FloatingCard>
  );
}
