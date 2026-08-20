'use client';

import React, { useState } from 'react';
import { useUser, SignInButton } from '@clerk/nextjs';
import { LearnCourse, LearnLesson } from '../types';

interface LearnViewProps {
  courses: LearnCourse[];
}

export const LearnView: React.FC<LearnViewProps> = ({ courses }) => {
  const { isSignedIn } = useUser();
  const [completedMap, setCompletedMap] = useState<Record<string, boolean>>({
    'course-1': true
  });
  const [activeCourse, setActiveCourse] = useState<LearnCourse | null>(null);
  const [activeLessonIndex, setActiveLessonIndex] = useState(0);

  if (!isSignedIn) {
    return (
      <div className="space-y-6">
        <div>
          <div className="text-xs font-bold text-[#17C99E] uppercase tracking-wider mb-2">
            <span>Current Academy</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Interactive Crypto Courses</h2>
          <p className="text-sm text-gray-400 mt-1 max-w-xl">
            Learn asset allocation, cold storage security, and market cycles through short interactive lessons.
          </p>
        </div>

        <div className="bg-[#212121] border border-[#2E2E2E] rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <div className="inline-flex items-center space-x-2 bg-[#161616] text-[#17C99E] text-xs font-extrabold px-3 py-1 rounded-full border border-[#2E2E2E]">
              <span>🎓</span>
              <span>Sign In Required for Courses</span>
            </div>
            <h3 className="text-xl font-extrabold text-white">Unlock Current Academy & Earn XP</h3>
            <p className="text-xs text-gray-300 max-w-xl">
              Sign in to track your course progress, complete quizzes, earn XP badges, and master crypto investing.
            </p>
          </div>

          <SignInButton mode="modal">
            <button className="bg-[#212121] hover:bg-[#2A2A2A] text-white font-extrabold text-xs px-6 py-3 rounded-2xl transition-all shadow-lg shadow-black/10 shrink-0">
              Sign In to Access Courses
            </button>
          </SignInButton>
        </div>
      </div>
    );
  }

  const toggleCourseComplete = (id: string) => {
    setCompletedMap(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const totalXP = Object.keys(completedMap).reduce((sum, id) => {
    if (completedMap[id]) {
      const found = courses.find(c => c.id === id);
      return sum + (found ? found.xpReward : 0);
    }
    return sum;
  }, 0);

  return (
    <div className="space-y-6">

      {/* Header Banner */}


      {/* Course Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {courses.map((course) => {
          const isDone = Boolean(completedMap[course.id]);

          return (
            <div
              key={course.id}
              className="bg-[#212121] border border-[#2E2E2E] hover:border-[#17C99E]/40 rounded-3xl overflow-hidden shadow-xl flex flex-col justify-between transition-all group"
            >
              <div>
                <div className="relative h-40 w-full">
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/30" />

                  <span className="absolute top-3 left-3 bg-[#161616]/80 backdrop-blur-md text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full border border-[#2E2E2E]">
                    {course.level}
                  </span>

                  <span className="absolute top-3 right-3 bg-[#212121] text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-md">
                    +{course.xpReward} XP
                  </span>
                </div>

                <div className="p-5 space-y-2">
                  <div className="flex items-center space-x-2 text-xs text-gray-400">
                    <span className="text-[#17C99E] font-bold">{course.category}</span>
                    <span>•</span>
                    <span className="flex items-center space-x-1">
                      <span className="w-3 h-3" >🕒</span>
                      <span>{course.duration}</span>
                    </span>
                  </div>

                  <h3 className="font-bold text-white text-base group-hover:text-[#17C99E] transition-colors leading-snug">
                    {course.title}
                  </h3>

                  <p className="text-xs text-gray-300 leading-relaxed line-clamp-2">
                    {course.description}
                  </p>
                </div>
              </div>

              <div className="p-5 pt-0 flex items-center justify-between border-t border-[#2E2E2E]/50 mt-2">
                {isDone ? (
                  <button
                    onClick={() => toggleCourseComplete(course.id)}
                    className="flex items-center space-x-2 text-xs font-bold text-[#10B981]"
                  >
                    <span className="w-4 h-4" >✅</span>
                    <span>Completed</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setActiveCourse(course);
                      setActiveLessonIndex(0);
                    }}
                    className="flex items-center space-x-2 bg-[#212121] hover:bg-[#2A2A2A] text-white text-xs font-extrabold px-4 py-2 rounded-xl transition-all shadow"
                  >
                    <span className="w-3.5 h-3.5 fill-black" >▶️</span>
                    <span>Start Mini-Course</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Lesson Reader Modal */}
      {activeCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-[#212121] border border-[#2E2E2E] rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6 shadow-2xl relative">

            <button
              onClick={() => setActiveCourse(null)}
              className="absolute top-5 right-5 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-[#2A2A2A]"
            >
              <span className="w-5 h-5" >✕</span>
            </button>

            <div className="flex items-center space-x-2 text-xs font-bold text-[#17C99E] uppercase mb-2">
              <span>{activeCourse.title}</span>
              <span>•</span>
              <span>Lesson {activeLessonIndex + 1} of {activeCourse.lessons.length}</span>
            </div>

            {/* Lesson Body */}
            {activeCourse.lessons[activeLessonIndex] && (
              <div className="space-y-4 pt-2">
                <h3 className="text-xl font-extrabold text-white">
                  {activeCourse.lessons[activeLessonIndex].title}
                </h3>

                <div className="p-3 bg-[#161616] rounded-xl border border-[#2E2E2E] text-xs text-gray-300 font-medium">
                  {activeCourse.lessons[activeLessonIndex].summary}
                </div>

                <div className="text-sm text-gray-200 leading-relaxed font-normal pt-2">
                  {activeCourse.lessons[activeLessonIndex].content}
                </div>

                <div className="p-4 bg-[#161616] border border-[#2E2E2E] rounded-2xl space-y-1">
                  <div className="text-xs font-bold text-[#17C99E] uppercase tracking-wide">💡 Key Takeaway</div>
                  <div className="text-xs text-gray-200 font-medium leading-relaxed">
                    {activeCourse.lessons[activeLessonIndex].keyTakeaway}
                  </div>
                </div>

                {/* Lesson Navigation Controls */}
                <div className="pt-4 border-t border-[#2E2E2E] flex items-center justify-between">
                  <button
                    disabled={activeLessonIndex === 0}
                    onClick={() => setActiveLessonIndex(prev => Math.max(0, prev - 1))}
                    className="text-xs font-bold text-gray-400 disabled:opacity-30 hover:text-white"
                  >
                    ← Previous Lesson
                  </button>

                  {activeLessonIndex < activeCourse.lessons.length - 1 ? (
                    <button
                      onClick={() => setActiveLessonIndex(prev => prev + 1)}
                      className="bg-[#212121] hover:bg-[#2A2A2A] text-white font-extrabold text-xs px-5 py-2.5 rounded-xl transition-all flex items-center space-x-1.5 shadow"
                    >
                      <span>Next Lesson</span>
                      <span className="w-4 h-4" >➡️</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        toggleCourseComplete(activeCourse.id);
                        setActiveCourse(null);
                      }}
                      className="bg-[#10B981] hover:bg-[#059669] text-black font-extrabold text-xs px-5 py-2.5 rounded-xl transition-all flex items-center space-x-1.5 shadow"
                    >
                      <span className="w-4 h-4" >✅</span>
                      <span>Complete Mini-Course (+{activeCourse.xpReward} XP)</span>
                    </button>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
