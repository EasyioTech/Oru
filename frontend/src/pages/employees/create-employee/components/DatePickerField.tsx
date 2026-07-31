import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { type Control } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { formatDateInput, parseIndianDate } from "../utils/dateHelpers";
import { type FormValues } from "../formSchema";

interface DatePickerFieldProps {
  control: Control<FormValues>;
  name: "dateOfBirth" | "hireDate";
  label: string;
  inputValue: string;
  setInputValue: (v: string) => void;
  popoverOpen: boolean;
  setPopoverOpen: (v: boolean) => void;
  disabledDates?: (date: Date) => boolean;
}

export function DatePickerField({
  control, name, label, inputValue, setInputValue, popoverOpen, setPopoverOpen, disabledDates,
}: DatePickerFieldProps) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel className="text-gray-600 font-medium ml-1">{label}</FormLabel>
          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <FormControl>
              <div className="relative">
                <Input
                  placeholder="DD/MM/YYYY (e.g., 09/05/2007)"
                  value={inputValue || (field.value ? format(field.value, "dd/MM/yyyy") : "")}
                  onChange={(e) => {
                    const formatted = formatDateInput(e.target.value);
                    setInputValue(formatted);
                    const parsed = parseIndianDate(formatted);
                    if (parsed && !isNaN(parsed.getTime())) {
                      const today = new Date(); today.setHours(23, 59, 59, 999);
                      if (parsed <= today && parsed >= new Date("1900-01-01")) field.onChange(parsed);
                    } else if (formatted.length === 0) {
                      field.onChange(undefined);
                    }
                  }}
                  onBlur={() => { if (field.value) setInputValue(''); }}
                  onKeyDown={(e) => {
                    if (['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key)) return;
                    if (!/^\d$/.test(e.key)) e.preventDefault();
                  }}
                  maxLength={10}
                  className="pr-10 bg-white/60 border-transparent rounded-xl focus-visible:ring-gray-200 shadow-sm transition-all h-11"
                />
                <PopoverTrigger asChild>
                  <Button type="button" variant="ghost" size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent rounded-r-xl"
                    onClick={(e) => { e.preventDefault(); setPopoverOpen(true); }}
                  >
                    <CalendarIcon className="h-4 w-4 text-gray-400" />
                  </Button>
                </PopoverTrigger>
              </div>
            </FormControl>
            <PopoverContent className="w-auto p-0 rounded-2xl border-gray-100 shadow-xl" align="start">
              <Calendar
                mode="single" selected={field.value}
                onSelect={(date) => { field.onChange(date); setInputValue(''); setPopoverOpen(false); }}
                disabled={disabledDates}
                initialFocus className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
          <FormMessage />
          <p className="text-xs text-gray-400 ml-1">DD/MM/YYYY or use calendar</p>
        </FormItem>
      )}
    />
  );
}
