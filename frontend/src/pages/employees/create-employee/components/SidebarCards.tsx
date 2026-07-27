import { Save } from "lucide-react";
import { Link } from "react-router-dom";
import { type UseFormReturn } from "react-hook-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { type FormValues } from "../formSchema";

interface SidebarCardsProps {
  form: UseFormReturn<FormValues>;
  isSubmitting: boolean;
}

export function SidebarCards({ form, isSubmitting }: SidebarCardsProps) {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Additional Notes</CardTitle>
          <CardDescription>Any additional information about the employee</CardDescription>
        </CardHeader>
        <CardContent>
          <FormField control={form.control} name="notes" render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea placeholder="Add any additional notes or comments about the employee..." className="min-h-[200px]" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Actions</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting
              ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />Creating Employee...</>
              : <><Save className="mr-2 h-4 w-4" />Create Employee</>}
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link to="/employee-management">Cancel</Link>
          </Button>
        </CardContent>
      </Card>
    </>
  );
}
