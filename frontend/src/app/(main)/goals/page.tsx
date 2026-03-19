import React from "react";
import { GoalsHeader } from "@/components/feature/goals/GoalsHeader";
import { MainGoalCard } from "@/components/feature/goals/MainGoalCard";
import { CourseGoalsList } from "@/components/feature/goals/CourseGoalsList";
import { CourseGoal } from "@/components/feature/goals/CourseGoalCard";

// TODO: Fetch from API
const MOCK_GOALS_DATA = {
  mainGoal: {
    textPre: "Lulus dengan",
    textHighlight: "IPK 3.5",
  },
  courses: [
    {
      id: "course-1",
      title: "Kalkulus I",
      icon: "Triangle", // Pass as string instead of React Component
      completedTasks: 5,
      totalTasks: 12,
      theme: "blue",
    } as CourseGoal,
    {
      id: "course-2",
      title: "Fisika Dasar",
      icon: "FlaskConical", // Pass as string instead of React Component
      completedTasks: 8,
      totalTasks: 10,
      theme: "teal",
    } as CourseGoal,
    {
      id: "course-3",
      title: "Algoritma",
      icon: "Code", // Pass as string instead of React Component
      completedTasks: 2,
      totalTasks: 8,
      theme: "purple",
    } as CourseGoal,
  ],
};

export default function GoalsPage() {
  return (
    <>
      <GoalsHeader />
      
      <div className="px-6 pb-24">
        <MainGoalCard 
          goalTextPre={MOCK_GOALS_DATA.mainGoal.textPre}
          goalTextHighlight={MOCK_GOALS_DATA.mainGoal.textHighlight}
        />
        
        <CourseGoalsList goals={MOCK_GOALS_DATA.courses} />
      </div>
    </>
  );
}
