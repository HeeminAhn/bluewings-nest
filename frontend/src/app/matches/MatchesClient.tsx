'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Calendar, Trophy } from 'lucide-react';
import { MatchCard, StandingsTable } from '@/components/match';
import { api } from '@/lib/api';
import type { Match, LeagueStanding } from '@/lib/types';

type Tab = 'schedule' | 'standings';

interface MatchesClientProps {
  initialStandings: LeagueStanding[];
  initialYear: number;
}

export default function MatchesClient({ initialStandings, initialYear }: MatchesClientProps) {
  const [activeTab, setActiveTab] = useState<Tab>('standings');
  const [matches, setMatches] = useState<Match[]>([]);
  const [standings, setStandings] = useState<LeagueStanding[]>(initialStandings);
  const [currentYear, setCurrentYear] = useState(initialYear);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasInitializedSchedule, setHasInitializedSchedule] = useState(false);

  useEffect(() => {
    if (activeTab === 'schedule' && !hasInitializedSchedule) {
      fetchMatches();
      setHasInitializedSchedule(true);
    } else if (activeTab === 'schedule') {
      fetchMatches();
    }
  }, [activeTab, currentYear, currentMonth]);

  useEffect(() => {
    if (activeTab === 'standings' && currentYear !== initialYear) {
      fetchStandings();
    }
  }, [currentYear, activeTab]);

  const fetchMatches = async () => {
    setIsLoading(true);
    const response = await api.getMatchesByMonth(currentYear, currentMonth);
    if (response.success && response.data) {
      setMatches(response.data.matches);
    }
    setIsLoading(false);
  };

  const fetchStandings = async () => {
    setIsLoading(true);
    const response = await api.getStandings(currentYear.toString());
    if (response.success && response.data) {
      setStandings(response.data.standings);
    }
    setIsLoading(false);
  };

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const monthNames = [
    '1월', '2월', '3월', '4월', '5월', '6월',
    '7월', '8월', '9월', '10월', '11월', '12월'
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <img src="/android-chrome-512x512.png" alt="블루윙즈 둥지" className="w-10 h-10 rounded-lg object-cover" />
              <h1 className="text-lg font-bold text-bluewings">경기 정보</h1>
            </Link>
          </div>
        </div>
      </header>

      <div className="bg-white border-b">
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex">
            <button
              onClick={() => setActiveTab('standings')}
              className={`flex-1 py-3 text-center font-medium border-b-2 transition-colors ${
                activeTab === 'standings'
                  ? 'text-bluewings border-bluewings'
                  : 'text-gray-500 border-transparent'
              }`}
            >
              <Trophy className="w-5 h-5 inline-block mr-2" />
              순위표
            </button>
            <button
              onClick={() => setActiveTab('schedule')}
              className={`flex-1 py-3 text-center font-medium border-b-2 transition-colors ${
                activeTab === 'schedule'
                  ? 'text-bluewings border-bluewings'
                  : 'text-gray-500 border-transparent'
              }`}
            >
              <Calendar className="w-5 h-5 inline-block mr-2" />
              일정/결과
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-4 py-4">
        {activeTab === 'schedule' && (
          <>
            <div className="flex items-center justify-between mb-4 bg-white rounded-xl p-3">
              <button
                onClick={handlePrevMonth}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="font-bold text-lg">
                {currentYear}년 {monthNames[currentMonth - 1]}
              </span>
              <button
                onClick={handleNextMonth}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-4 border-bluewings border-t-transparent rounded-full animate-spin" />
              </div>
            ) : matches.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                이 달에 예정된 경기가 없습니다.
              </div>
            ) : (
              <div className="space-y-3">
                {matches.map((match) => (
                  <MatchCard key={match.id} match={match} />
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'standings' && (
          <>
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-4 border-bluewings border-t-transparent rounded-full animate-spin" />
              </div>
            ) : standings.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                순위 정보가 없습니다.
              </div>
            ) : (
              <StandingsTable standings={standings} />
            )}
          </>
        )}
      </main>
    </div>
  );
}
