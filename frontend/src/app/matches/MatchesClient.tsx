'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Trophy, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/layout';
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
    <div className="min-h-screen bg-[#fcf9f8] pb-24">
      <Header title="Match Center" />

      <div className="max-w-[1280px] mx-auto px-6 py-5">
        {/* 탭 전환 */}
        <div className="flex gap-1 bg-[#f0eded] rounded-lg p-1 mb-6">
          <button
            onClick={() => setActiveTab('standings')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-md text-sm font-semibold uppercase tracking-wider transition-all ${
              activeTab === 'standings'
                ? 'bg-[#004C97] text-white shadow-sm'
                : 'text-[#424751] hover:text-[#1c1b1b]'
            }`}
          >
            <Trophy className="w-4 h-4" />
            순위표
          </button>
          <button
            onClick={() => setActiveTab('schedule')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-md text-sm font-semibold uppercase tracking-wider transition-all ${
              activeTab === 'schedule'
                ? 'bg-[#004C97] text-white shadow-sm'
                : 'text-[#424751] hover:text-[#1c1b1b]'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Fixtures
          </button>
        </div>

        {activeTab === 'schedule' && (
          <>
            {/* 월 선택 */}
            <div className="bg-white rounded-lg border border-[#c2c6d3] shadow-sm mb-5">
              <div className="flex items-center justify-between p-3">
                <Button variant="ghost" size="icon" onClick={handlePrevMonth} className="text-[#424751]">
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <span className="font-bold text-lg text-[#1c1b1b]">
                  {currentYear}년 {monthNames[currentMonth - 1]}
                </span>
                <Button variant="ghost" size="icon" onClick={handleNextMonth} className="text-[#424751]">
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-[#004C97]" />
              </div>
            ) : matches.length === 0 ? (
              <Card className="border border-[#c2c6d3] shadow-sm">
                <CardContent className="py-12 text-center text-[#737782]">
                  이 달에 예정된 경기가 없습니다.
                </CardContent>
              </Card>
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
                <Loader2 className="w-8 h-8 animate-spin text-[#004C97]" />
              </div>
            ) : standings.length === 0 ? (
              <Card className="border border-[#c2c6d3] shadow-sm">
                <CardContent className="py-12 text-center text-[#737782]">
                  순위 정보가 없습니다.
                </CardContent>
              </Card>
            ) : (
              <StandingsTable standings={standings} />
            )}
          </>
        )}
      </div>
    </div>
  );
}
