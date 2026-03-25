"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CalendarProps {
  selectedDate: Date | null;
  onSelect: (date: Date) => void;
}

export function Calendar({ selectedDate, onSelect }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const days = daysInMonth(year, month);
  const firstDay = firstDayOfMonth(year, month);

  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  const weekDays = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const renderDays = () => {
    const dayElements = [];
    
    // Empty cells for days of the previous month
    for (let i = 0; i < firstDay; i++) {
      dayElements.push(<div key={`empty-${i}`} className="h-10 w-10" />);
    }

    for (let d = 1; d <= days; d++) {
      const date = new Date(year, month, d);
      const isSelected = selectedDate && 
        date.getDate() === selectedDate.getDate() && 
        date.getMonth() === selectedDate.getMonth() && 
        date.getFullYear() === selectedDate.getFullYear();
      
      const isToday = date.getTime() === today.getTime();
      const isPast = date.getTime() < today.getTime();

      dayElements.push(
        <button
          key={d}
          type="button"
          disabled={isPast}
          onClick={() => onSelect(date)}
          className={cn(
            "h-10 w-10 flex items-center justify-center rounded-xl text-sm font-medium transition-all relative",
            isSelected ? "bg-primary text-white shadow-md scale-110 z-10" : 
            isToday ? "bg-primary/10 text-primary border border-primary/20" : 
            isPast ? "text-neutral-300 cursor-not-allowed" : "text-neutral-700 hover:bg-neutral-100"
          )}
        >
          {d}
          {isToday && !isSelected && <div className="absolute bottom-1 w-1 h-1 bg-primary rounded-full" />}
        </button>
      );
    }

    return dayElements;
  };

  return (
    <div className="w-full bg-white rounded-2xl p-2">
      <div className="flex items-center justify-between mb-4 px-2">
        <h3 className="font-bold text-neutral-900">
          {monthNames[month]} {year}
        </h3>
        <div className="flex gap-1">
          <button 
            type="button"
            onClick={handlePrevMonth}
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors text-neutral-600"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button 
            type="button"
            onClick={handleNextMonth}
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors text-neutral-600"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map(day => (
          <div key={day} className="h-8 flex items-center justify-center text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {renderDays()}
      </div>
    </div>
  );
}
