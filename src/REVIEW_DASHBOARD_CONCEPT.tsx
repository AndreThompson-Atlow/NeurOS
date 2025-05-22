// This is a conceptual implementation of an enhanced review dashboard
// that would display upcoming reviews using the spaced repetition system

import React, { useState, useEffect } from 'react';
import { useLearningSession } from '@/hooks/useLearningSession';
import { formatDistanceToNow, isBefore } from 'date-fns';
import { Calendar, Clock, BrainCircuit, TrendingUp, BookCheck, Activity } from 'lucide-react';
import { 
  Card, CardHeader, CardTitle, CardDescription, CardContent,
  Tabs, TabsList, TabsTrigger, TabsContent,
  Progress, Button, Badge, Select, SelectTrigger, SelectValue, SelectContent, SelectItem
} from '@/components/ui';

interface ReviewDashboardProps {
  onStartReview: () => void;
}

export function ReviewDashboard({ onStartReview }: ReviewDashboardProps) {
  const { 
    userModules, 
    hasStandardReviewNodes, 
    startReviewSession, 
    startManualReviewSession 
  } = useLearningSession();
  
  const [viewMode, setViewMode] = useState<'upcoming' | 'all' | 'overdue'>('upcoming');
  const [moduleFilter, setModuleFilter] = useState<string | null>(null);
  
  // This would be updated with our new spaced repetition implementation
  const scheduledReviews = useGetScheduledReviews(viewMode, moduleFilter);
  const moduleOptions = Object.values(userModules).map(m => ({ value: m.id, label: m.title }));
  
  return (
    <div className="container mx-auto space-y-spacing-lg">
      <Card className="neuro-card">
        <CardHeader>
          <CardTitle className="flex items-center text-neutral-primary-color">
            <BrainCircuit className="mr-spacing-xs" /> Memory Optimization Dashboard
          </CardTitle>
          <CardDescription>
            Track your spaced repetition schedule and manage memory decay prevention
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-spacing-md flex flex-col sm:flex-row gap-spacing-sm justify-between items-start sm:items-center">
            <div className="stats flex gap-spacing-md">
              <div className="stat">
                <div className="text-xs text-muted-foreground">Due Today</div>
                <div className="text-2xl font-bold text-destructive">{scheduledReviews.filter(r => r.isDueToday).length}</div>
              </div>
              <div className="stat">
                <div className="text-xs text-muted-foreground">Due This Week</div>
                <div className="text-2xl font-bold text-amber-500">{scheduledReviews.filter(r => r.isDueThisWeek).length}</div>
              </div>
              <div className="stat">
                <div className="text-xs text-muted-foreground">Completed Today</div>
                <div className="text-2xl font-bold text-primary">{scheduledReviews.filter(r => r.completedToday).length}</div>
              </div>
            </div>
            
            <div className="flex gap-spacing-xs">
              <Select value={moduleFilter || 'all'} onValueChange={(v) => setModuleFilter(v === 'all' ? null : v)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by module" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Modules</SelectItem>
                  {moduleOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button 
                onClick={onStartReview} 
                disabled={!hasStandardReviewNodes}
                className="btn-primary"
              >
                Start Review
              </Button>
            </div>
          </div>
          
          <Tabs defaultValue="upcoming" className="w-full">
            <TabsList>
              <TabsTrigger value="upcoming" onClick={() => setViewMode('upcoming')}>Upcoming</TabsTrigger>
              <TabsTrigger value="overdue" onClick={() => setViewMode('overdue')}>Overdue</TabsTrigger>
              <TabsTrigger value="all" onClick={() => setViewMode('all')}>All Nodes</TabsTrigger>
            </TabsList>
            
            <TabsContent value="upcoming" className="mt-spacing-md">
              <div className="space-y-spacing-sm">
                {scheduledReviews.length === 0 ? (
                  <div className="text-center text-muted-foreground p-spacing-md">
                    No upcoming reviews scheduled
                  </div>
                ) : (
                  scheduledReviews.map(review => (
                    <ReviewCard key={review.nodeId} review={review} />
                  ))
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="overdue">
              {/* Similar content as "upcoming" tab */}
            </TabsContent>
            
            <TabsContent value="all">
              {/* Similar content as "upcoming" tab */}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

interface ReviewCardProps {
  review: ScheduledReview;
}

function ReviewCard({ review }: ReviewCardProps) {
  const isDue = isBefore(review.dueDate, new Date());
  
  return (
    <Card className={`p-spacing-sm border-l-4 ${isDue ? 'border-l-destructive' : 'border-l-secondary'}`}>
      <div className="flex justify-between">
        <div>
          <h4 className="font-medium text-sm">{review.nodeTitle}</h4>
          <p className="text-xs text-muted-foreground">{review.moduleTitle} • {review.epicComponent}</p>
        </div>
        
        <div className="text-right">
          <div className="flex items-center text-xs">
            <Clock className="h-3 w-3 mr-spacing-xs" />
            <span className={isDue ? 'text-destructive font-medium' : ''}>
              {isDue ? 'Overdue: ' : 'Due: '}
              {formatDistanceToNow(review.dueDate, { addSuffix: true })}
            </span>
          </div>
          <div className="mt-spacing-xs">
            <Badge variant={getMemoryStrengthVariant(review.memoryStrength)}>
              Memory: {review.memoryStrength}%
            </Badge>
          </div>
        </div>
      </div>
      
      <div className="mt-spacing-xs">
        <div className="flex justify-between text-xs mb-spacing-xs">
          <span>Memory Strength</span>
          <span>{review.memoryStrength}%</span>
        </div>
        <Progress value={review.memoryStrength} className="h-1" />
      </div>
    </Card>
  );
}

// Helper function for the UI
function getMemoryStrengthVariant(strength: number) {
  if (strength < 40) return 'destructive';
  if (strength < 75) return 'secondary';
  return 'default';
}

// This would be our new hook using the spaced repetition system
function useGetScheduledReviews(viewMode: string, moduleFilter: string | null) {
  const { userModules } = useLearningSession();
  const [reviews, setReviews] = useState<ScheduledReview[]>([]);
  
  useEffect(() => {
    // This would use our new getNodesForReviewCallback with spaced repetition
    const allNodes: ScheduledReview[] = [];
    
    Object.values(userModules).forEach(module => {
      if (moduleFilter && module.id !== moduleFilter) return;
      
      if (!module.domains) return;
      module.domains.forEach(domain => {
        domain.nodes.forEach(node => {
          if (!node.understood) return;
          
          const memoryStrength = node.memoryStrength || 0;
          const lastReviewed = node.lastReviewed ? new Date(node.lastReviewed) : null;
          
          // This would use our spaced repetition algorithm
          let dueDate = new Date();
          if (lastReviewed) {
            const intervalHours = getReviewIntervalHours(memoryStrength);
            dueDate = new Date(lastReviewed);
            dueDate.setHours(dueDate.getHours() + intervalHours);
          }
          
          const now = new Date();
          const isDue = lastReviewed ? isBefore(dueDate, now) : true;
          const isDueToday = isDue;
          
          // Check if due this week
          const nextWeek = new Date();
          nextWeek.setDate(nextWeek.getDate() + 7);
          const isDueThisWeek = isBefore(dueDate, nextWeek);
          
          if (
            (viewMode === 'all') ||
            (viewMode === 'upcoming' && isDueThisWeek) ||
            (viewMode === 'overdue' && isDue)
          ) {
            // Get a weighted EPIC component
            const epicComponent = getWeightedEpicComponent();
            
            allNodes.push({
              nodeId: node.id,
              moduleId: module.id,
              nodeTitle: node.title,
              moduleTitle: module.title,
              memoryStrength,
              dueDate,
              epicComponent,
              isDue,
              isDueToday,
              isDueThisWeek,
              completedToday: false, // This would be calculated based on review history
              lastReviewed,
              priorityScore: calculatePriorityScore(isDue, memoryStrength, dueDate, node.status)
            });
          }
        });
      });
    });
    
    // Sort by priority score
    allNodes.sort((a, b) => b.priorityScore - a.priorityScore);
    setReviews(allNodes);
  }, [userModules, viewMode, moduleFilter]);
  
  return reviews;
}

// Helper function to calculate time-based priority score
function calculatePriorityScore(
  isDue: boolean, 
  memoryStrength: number, 
  dueDate: Date, 
  nodeStatus: string
): number {
  const now = new Date();
  const hoursOverdue = isDue 
    ? Math.max(0, (now.getTime() - dueDate.getTime()) / (1000 * 3600)) 
    : 0;
  
  return (
    (nodeStatus === 'needs_review' ? 200 : 0) +
    Math.min(hoursOverdue, 200) +
    (100 - memoryStrength)
  );
}

// Helper function to determine review intervals
function getReviewIntervalHours(memoryStrength: number): number {
  if (memoryStrength < 20) return 1;      // 1 hour
  if (memoryStrength < 40) return 24;     // 1 day 
  if (memoryStrength < 60) return 48;     // 2 days
  if (memoryStrength < 75) return 96;     // 4 days
  if (memoryStrength < 90) return 168;    // 1 week
  return 336;                             // 2 weeks
}

// Helper function to get weighted EPIC component
function getWeightedEpicComponent() {
  const rand = Math.random();
  if (rand < 0.4) return 'probe';         // 40% chance
  if (rand < 0.7) return 'explain';       // 30% chance
  if (rand < 0.9) return 'implement';     // 20% chance
  return 'connect';                       // 10% chance
}

// Type for scheduled reviews
interface ScheduledReview {
  nodeId: string;
  moduleId: string;
  nodeTitle: string;
  moduleTitle: string;
  memoryStrength: number;
  dueDate: Date;
  epicComponent: string;
  isDue: boolean;
  isDueToday: boolean;
  isDueThisWeek: boolean;
  completedToday: boolean;
  lastReviewed: Date | null;
  priorityScore: number;
} 