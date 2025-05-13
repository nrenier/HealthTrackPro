import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, parse } from "date-fns";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { DiaryEntry } from "@shared/schema";

type ViewMode = "month" | "year";

export default function CalendarGrid() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [_, navigate] = useLocation();
  
  // Query for diary entries
  const { data: entriesData } = useQuery<DiaryEntry[]>({
    queryKey: ["/api/diary"],
  });
  
  // Get diary entries for current month
  const entriesForCurrentMonth = entriesData?.filter(entry => {
    const entryDate = new Date(entry.date);
    return isSameMonth(entryDate, currentDate);
  });

  // Generate days for the current month view
  const getDaysForMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const startDay = monthStart.getDay();
    
    // Calculate days from the previous month to fill the first row
    const prevMonthDays = Array.from({ length: startDay }, (_, i) => {
      const date = new Date(monthStart);
      date.setDate(-i);
      return date;
    }).reverse();
    
    // Calculate days from the next month to fill the last row
    const nextMonthDays = [];
    const totalCells = Math.ceil((days.length + startDay) / 7) * 7;
    const remainingCells = totalCells - (days.length + startDay);
    
    for (let i = 1; i <= remainingCells; i++) {
      const date = new Date(monthEnd);
      date.setDate(monthEnd.getDate() + i);
      nextMonthDays.push(date);
    }
    
    return [...prevMonthDays, ...days, ...nextMonthDays];
  };
  
  const days = getDaysForMonthView();
  
  // Handle month navigation
  const handlePrevMonth = () => {
    setCurrentDate(prevDate => subMonths(prevDate, 1));
  };
  
  const handleNextMonth = () => {
    setCurrentDate(prevDate => addMonths(prevDate, 1));
  };
  
  // Handle day selection
  const handleDayClick = (date: Date) => {
    const formattedDate = format(date, "yyyy-MM-dd");
    navigate(`/symptom/${formattedDate}`);
  };
  
  // Check if a day has an entry
  const hasEntry = (date: Date): boolean => {
    if (!entriesForCurrentMonth) return false;
    return entriesForCurrentMonth.some(entry => {
      const entryDate = new Date(entry.date);
      return isSameDay(entryDate, date);
    });
  };
  
  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-2">
          <Button 
            variant={viewMode === "month" ? "secondary" : "ghost"} 
            size="sm"
            onClick={() => setViewMode("month")}
          >
            Mese
          </Button>
          <Button 
            variant={viewMode === "year" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("year")}
          >
            Anno
          </Button>
        </div>
      </div>
      
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">{format(currentDate, "MMMM yyyy")}</h2>
        <div className="flex space-x-2">
          <Button variant="ghost" size="icon" onClick={handlePrevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        <div className="text-xs font-medium text-muted-foreground">SUN</div>
        <div className="text-xs font-medium text-muted-foreground">MON</div>
        <div className="text-xs font-medium text-muted-foreground">TUE</div>
        <div className="text-xs font-medium text-muted-foreground">WED</div>
        <div className="text-xs font-medium text-muted-foreground">THU</div>
        <div className="text-xs font-medium text-muted-foreground">FRI</div>
        <div className="text-xs font-medium text-muted-foreground">SAT</div>
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isToday = isSameDay(day, new Date());
          const hasEntryForDay = hasEntry(day);
          
          return (
            <div 
              key={index}
              className={cn(
                "aspect-square flex justify-center items-center text-sm cursor-pointer",
                !isCurrentMonth && "text-muted-foreground",
                isToday && !hasEntryForDay && "border border-primary rounded-full",
                hasEntryForDay && isCurrentMonth && "bg-primary text-white rounded-full font-medium"
              )}
              onClick={() => isCurrentMonth && handleDayClick(day)}
            >
              {day.getDate()}
            </div>
          );
        })}
      </div>
      
      <div className="mt-6">
        <p className="text-sm font-semibold mb-1">{format(new Date(), "d MMMM")}</p>
        <p className="text-sm text-muted-foreground">Sintomi e attività</p>
      </div>
      
      <Button 
        variant="outline" 
        className="w-full mt-4 border-dashed"
        onClick={() => handleDayClick(new Date())}
      >
        <Plus className="mr-2 h-4 w-4" />
        Aggiungi nota
      </Button>
    </div>
  );
}
