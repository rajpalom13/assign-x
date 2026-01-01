"use client";

import { useState } from "react";
import { Calendar, Clock, DollarSign, Loader2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { Tutor, TimeSlot } from "@/types/connect";
import { availableTimeSlots } from "@/lib/data/connect";

interface BookSessionSheetProps {
  tutor: Tutor | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const durations = [
  { value: "30", label: "30 minutes", multiplier: 0.5 },
  { value: "60", label: "1 hour", multiplier: 1 },
  { value: "90", label: "1.5 hours", multiplier: 1.5 },
  { value: "120", label: "2 hours", multiplier: 2 },
];

/**
 * Sheet component for booking a session with a tutor
 */
export function BookSessionSheet({
  tutor,
  open,
  onOpenChange,
  onSuccess,
}: BookSessionSheetProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("");
  const [duration, setDuration] = useState("60");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!tutor) return null;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const selectedDuration = durations.find((d) => d.value === duration);
  const totalPrice = tutor.hourlyRate * (selectedDuration?.multiplier || 1);

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTimeSlot) {
      toast.error("Please select a date and time");
      return;
    }

    setIsSubmitting(true);

    try {
      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast.success("Session booked successfully!");
      onOpenChange(false);
      onSuccess?.();

      // Reset form
      setSelectedDate(undefined);
      setSelectedTimeSlot("");
      setDuration("60");
      setNotes("");
    } catch {
      toast.error("Failed to book session. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDateDisabled = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[90vh] rounded-t-xl p-0">
        <ScrollArea className="h-full">
          <SheetHeader className="p-6 pb-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={tutor.avatar} alt={tutor.name} />
                <AvatarFallback>{getInitials(tutor.name)}</AvatarFallback>
              </Avatar>
              <div>
                <SheetTitle>Book a Session</SheetTitle>
                <SheetDescription>with {tutor.name}</SheetDescription>
              </div>
            </div>
          </SheetHeader>

          <div className="p-6 pt-0 space-y-6">
            {/* Date Selection */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Select Date
              </Label>
              <div className="flex justify-center rounded-lg border p-2">
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={isDateDisabled}
                  className="w-full"
                />
              </div>
            </div>

            {/* Time Slot Selection */}
            {selectedDate && (
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Select Time
                </Label>
                <div className="grid grid-cols-4 gap-2">
                  {availableTimeSlots.map((slot: TimeSlot) => (
                    <button
                      key={slot.id}
                      type="button"
                      disabled={!slot.available}
                      onClick={() => setSelectedTimeSlot(slot.id)}
                      className={cn(
                        "rounded-lg border p-2 text-sm transition-all",
                        slot.available
                          ? selectedTimeSlot === slot.id
                            ? "border-primary bg-primary text-primary-foreground"
                            : "hover:border-primary/50"
                          : "cursor-not-allowed opacity-50"
                      )}
                    >
                      {slot.time}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Duration Selection */}
            <div className="space-y-2">
              <Label>Session Duration</Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger>
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  {durations.map((d) => (
                    <SelectItem key={d.value} value={d.value}>
                      {d.label} (${tutor.hourlyRate * d.multiplier})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes for Tutor (Optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="What would you like to focus on in this session?"
                rows={3}
              />
            </div>

            {/* Price Summary */}
            <div className="rounded-lg bg-muted p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-muted-foreground">Session Rate</span>
                <span>${tutor.hourlyRate}/hour</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-muted-foreground">Duration</span>
                <span>{selectedDuration?.label}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t">
                <span className="font-semibold">Total</span>
                <div className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  <span className="text-xl font-bold">{totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Spacer */}
            <div className="h-20" />
          </div>
        </ScrollArea>

        {/* Fixed Footer */}
        <SheetFooter className="absolute bottom-0 left-0 right-0 border-t bg-background p-4">
          <Button
            className="w-full"
            size="lg"
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedDate || !selectedTimeSlot}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Booking...
              </>
            ) : (
              <>Confirm Booking - ${totalPrice.toFixed(2)}</>
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
