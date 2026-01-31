'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Trophy, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Header, BottomNav } from '@/components/layout';
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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 pb-24">
      <Header title="경기 정보" showBack />

      <div className="max-w-2xl mx-auto px-4 py-4">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as Tab)} className="mb-4">
          <TabsList className="grid w-full grid-cols-2 bg-white">
            <TabsTrigger value="standings" className="data-[state=active]:bg-blue-700 data-[state=active]:text-white">
              <Trophy className="w-4 h-4 mr-2" />
              순위표
            </TabsTrigger>
            <TabsTrigger value="schedule" className="data-[state=active]:bg-blue-700 data-[state=active]:text-white">
              <Calendar className="w-4 h-4 mr-2" />
              일정/결과
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {activeTab === 'schedule' && (
          <>
            <Card className="shadow-sm border-0 mb-4">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <Button variant="ghost" size="icon" onClick={handlePrevMonth}>
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                  <span className="font-bold text-lg text-slate-900">
                    {currentYear}년 {monthNames[currentMonth - 1]}
                  </span>
                  <Button variant="ghost" size="icon" onClick={handleNextMonth}>
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-700" />
              </div>
            ) : matches.length === 0 ? (
              <Card className="shadow-sm border-0">
                <CardContent className="py-12 text-center text-slate-500">
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
                <Loader2 className="w-8 h-8 animate-spin text-blue-700" />
              </div>
            ) : standings.length === 0 ? (
              <Card className="shadow-sm border-0">
                <CardContent className="py-12 text-center text-slate-500">
                  순위 정보가 없습니다.
                </CardContent>
              </Card>
            ) : (
              <StandingsTable standings={standings} />
            )}
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
