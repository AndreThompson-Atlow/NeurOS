import React, { useState, useEffect, useCallback } from 'react';
import { useLearningSession } from '@/hooks/useLearningSession';
import { formatDistanceToNow, isBefore, format } from 'date-fns';
import { 
  Calendar, Clock, BrainCircuit, TrendingUp, BookCheck, 
  Activity, ArrowLeft, RefreshCw, AlertCircle, CheckCircle 
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Module, Node, ReviewSessionNode, EpicStep } from '@/types/neuro';
import { ReviewScreen } from '@/components/neuro/ReviewScreen';

interface ReviewDashboardProps {
  onExit: () => void;
}

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
  node: Node;
}

export function ReviewDashboard({ onExit }: ReviewDashboardProps) {
  const { 
    userModules, 
    hasStandardReviewNodes, 
    hasManualReviewNodes,
    startReviewSession, 
    startManualReviewSession,
    activeReviewSession
  } = useLearningSession();
  
  const [viewMode, setViewMode] = useState<'upcoming' | 'all' | 'overdue'>('upcoming');
  const [moduleFilter, setModuleFilter] = useState<string | null>(null);
  const [forceUpdate, setForceUpdate] = useState(false);
  
  // Get scheduled reviews using our spaced repetition design
  const scheduledReviews = useGetScheduledReviews(viewMode, moduleFilter);
  const moduleOptions = Object.values(userModules)
    .filter(m => (m as Module).status === 'installed')
    .map(m => ({ value: m.id, label: m.title }));
  
  // Handle starting review sessions
  const handleStartStandardReview = useCallback(() => {
    console.log("Starting standard review session");
    startReviewSession();
  }, [startReviewSession]);
  
  const handleStartManualReview = useCallback(() => {
    console.log("Starting manual review session");
    startManualReviewSession();
  }, [startManualReviewSession]);
  
  // If there's an active review session, page.tsx will handle showing the review screen
  // instead of trying to render it from here
  
  return (
    <div className="container mx-auto space-y-spacing-lg max-w-4xl">
      <Card className="neuro-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center text-neutral-primary-color font-theme-neutral">
              <BrainCircuit className="mr-spacing-xs" /> Memory Optimization Dashboard
            </CardTitle>
            <Button variant="outline" size="sm" onClick={onExit} className="border-destructive text-destructive hover:bg-destructive/10">
              <ArrowLeft size={16} className="mr-1" /> Back to Dashboard
            </Button>
          </div>
          <CardDescription>
            Track your spaced repetition schedule and optimize long-term memory retention
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-spacing-md flex flex-col sm:flex-row gap-spacing-sm justify-between items-start sm:items-center">
            <div className="stats flex gap-spacing-md">
              <div className="stat p-3 bg-muted/30 rounded-md border border-border/20">
                <div className="text-xs text-muted-foreground">Due Today</div>
                <div className="text-2xl font-bold text-destructive">{scheduledReviews.filter(r => r.isDueToday).length}</div>
              </div>
              <div className="stat p-3 bg-muted/30 rounded-md border border-border/20">
                <div className="text-xs text-muted-foreground">Due This Week</div>
                <div className="text-2xl font-bold text-amber-500">{scheduledReviews.filter(r => r.isDueThisWeek).length}</div>
              </div>
              <div className="stat p-3 bg-muted/30 rounded-md border border-border/20">
                <div className="text-xs text-muted-foreground">Total Nodes</div>
                <div className="text-2xl font-bold text-primary">{scheduledReviews.length}</div>
              </div>
            </div>
            
            <div className="flex gap-spacing-xs">
              <Select value={moduleFilter || 'all'} onValueChange={(v: string) => setModuleFilter(v === 'all' ? null : v)}>
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
            </div>
          </div>
          
          <div className="space-y-spacing-md">
            <div className="space-y-3">
              <Button 
                onClick={handleStartStandardReview} 
                variant="default" 
                size="lg" 
                className="w-full btn-primary-neuro"
                disabled={!hasStandardReviewNodes}
              >
                <BookCheck size={18} className="mr-1.5" /> Start Standard Review ({hasStandardReviewNodes ? 'Nodes Due' : 'None Due'})
              </Button>
              <Button 
                onClick={handleStartManualReview} 
                variant="secondary" 
                size="lg" 
                className="w-full btn-secondary-neuro"
                disabled={!hasManualReviewNodes}
              >
                <RefreshCw size={18} className="mr-1.5" /> Start Manual Study Session
              </Button>
            </div>
            
            <Tabs defaultValue="upcoming" className="w-full">
              <TabsList className="ui-tabs-list">
                <TabsTrigger value="upcoming" onClick={() => setViewMode('upcoming')} className="ui-tabs-trigger">Upcoming</TabsTrigger>
                <TabsTrigger value="overdue" onClick={() => setViewMode('overdue')} className="ui-tabs-trigger">Overdue</TabsTrigger>
                <TabsTrigger value="all" onClick={() => setViewMode('all')} className="ui-tabs-trigger">All Nodes</TabsTrigger>
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
                <div className="space-y-spacing-sm mt-spacing-md">
                  {scheduledReviews.filter(r => r.isDue).length === 0 ? (
                    <div className="text-center text-muted-foreground p-spacing-md">
                      No overdue reviews. Great job staying on top of your learning!
                    </div>
                  ) : (
                    scheduledReviews.filter(r => r.isDue).map(review => (
                      <ReviewCard key={review.nodeId} review={review} />
                    ))
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="all">
                <div className="space-y-spacing-sm mt-spacing-md">
                  {scheduledReviews.length === 0 ? (
                    <div className="text-center text-muted-foreground p-spacing-md">
                      No completed nodes found. Continue learning to build your knowledge!
                    </div>
                  ) : (
                    scheduledReviews.map(review => (
                      <ReviewCard key={review.nodeId} review={review} />
                    ))
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface ReviewCardProps {
  review: ScheduledReview;
}

function ReviewCard({ review }: ReviewCardProps) {
  const isDue = review.isDue;
  
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

// Calculate review intervals based on memory strength (in hours)
function getReviewIntervalHours(memoryStrength: number): number {
  if (memoryStrength < 20) return 1;      // 1 hour
  if (memoryStrength < 40) return 24;     // 1 day 
  if (memoryStrength < 60) return 48;     // 2 days
  if (memoryStrength < 75) return 96;     // 4 days
  if (memoryStrength < 90) return 168;    // 1 week
  return 336;                             // 2 weeks
}

// This hook implements our spaced repetition system to get scheduled reviews
function useGetScheduledReviews(viewMode: string, moduleFilter: string | null): ScheduledReview[] {
  const { userModules } = useLearningSession();
  const [reviews, setReviews] = useState<ScheduledReview[]>([]);
  
  useEffect(() => {
    const allNodes: ScheduledReview[] = [];
    
    // Calculate memory decay based on time since last review
    const calculateMemoryDecay = (node: Node): number => {
      if (!node.lastReviewed) return 0; // No decay for nodes never reviewed
      
      const now = new Date();
      const lastReviewed = new Date(node.lastReviewed);
      const hoursSinceReview = (now.getTime() - lastReviewed.getTime()) / (1000 * 60 * 60);
      const currentStrength = node.memoryStrength || 0;
      
      // Calculate memory decay rate based on current memory strength
      // Higher memory strength means slower decay
      let decayRate = 0;
      if (currentStrength < 20) decayRate = 5;        // Fast decay for weak memories
      else if (currentStrength < 40) decayRate = 2;   // Significant decay
      else if (currentStrength < 60) decayRate = 1;   // Moderate decay
      else if (currentStrength < 75) decayRate = 0.5; // Slow decay
      else if (currentStrength < 90) decayRate = 0.2; // Very slow decay
      else decayRate = 0.1;                           // Minimal decay for strong memories
      
      // Calculate decay amount based on time and rate
      const decayAmount = Math.min(currentStrength, decayRate * (hoursSinceReview / 24)); // Daily decay
      return Math.max(0, decayAmount);
    };
    
    // Calculate when a node is due for review based on memory strength
    const calculateReviewDueDate = (node: Node): Date => {
      const lastReviewed = node.lastReviewed ? new Date(node.lastReviewed) : new Date(0);
      const currentStrength = node.memoryStrength || 0;
      
      // Define intervals in hours based on memory strength (following Ebbinghaus forgetting curve patterns)
      let intervalHours = 1; // Default to 1 hour
      if (currentStrength < 20) intervalHours = 1;      // 1 hour
      else if (currentStrength < 40) intervalHours = 24;     // 1 day 
      else if (currentStrength < 60) intervalHours = 48;     // 2 days
      else if (currentStrength < 75) intervalHours = 96;     // 4 days
      else if (currentStrength < 90) intervalHours = 168;    // 1 week
      else intervalHours = 336;                              // 2 weeks
      
      const dueDate = new Date(lastReviewed);
      dueDate.setHours(dueDate.getHours() + intervalHours);
      return dueDate;
    };
    
    Object.values(userModules).forEach(module => {
      if (moduleFilter && module.id !== moduleFilter) return;
      if ((module as Module).status !== 'installed') return;
      
      if (!(module as Module).domains) return;
      (module as Module).domains.forEach(domain => {
        domain.nodes.forEach(node => {
          if (!node.understood && node.status !== 'needs_review') return;
          
          // Apply memory decay to get current memory strength
          const memoryDecay = calculateMemoryDecay(node);
          const currentMemoryStrength = Math.max(0, (node.memoryStrength || 0) - memoryDecay);
          
          // Calculate when this node is due for review
          const reviewDueDate = calculateReviewDueDate(node);
          const now = new Date();
          const isDue = reviewDueDate <= now;
          
          // Check if due today
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          tomorrow.setHours(0, 0, 0, 0);
          const isDueToday = reviewDueDate <= tomorrow;
          
          // Check if due this week
          const nextWeek = new Date();
          nextWeek.setDate(nextWeek.getDate() + 7);
          const isDueThisWeek = reviewDueDate <= nextWeek;
          
          if (
            (viewMode === 'all') ||
            (viewMode === 'upcoming' && isDueThisWeek) ||
            (viewMode === 'overdue' && isDue)
          ) {
            // Calculate priority score based on multiple factors
            const hoursOverdue = isDue 
              ? Math.max(0, (now.getTime() - reviewDueDate.getTime()) / (1000 * 3600)) 
              : 0;
            
            const priorityScore = 
              (node.status === 'needs_review' ? 200 : 0) +   // Explicitly marked gets highest priority
              Math.min(hoursOverdue, 200) +                  // More overdue = higher priority (capped)
              (100 - currentMemoryStrength);                 // Weaker memory = higher priority
            
            // Get a weighted EPIC component for better reviews
            const epicComponent = getWeightedEpicComponent();
            
            allNodes.push({
              nodeId: node.id,
              moduleId: module.id,
              nodeTitle: node.title,
              moduleTitle: (module as Module).title,
              memoryStrength: currentMemoryStrength,
              dueDate: reviewDueDate,
              epicComponent,
              isDue,
              isDueToday,
              isDueThisWeek,
              completedToday: false,
              lastReviewed: node.lastReviewed ? new Date(node.lastReviewed) : null,
              priorityScore,
              node: node
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

// Get weighted EPIC component based on our spaced repetition design
function getWeightedEpicComponent(): EpicStep {
  const rand = Math.random();
  if (rand < 0.4) return 'probe';         // 40% chance - most effective for recall
  if (rand < 0.7) return 'explain';       // 30% chance - good for reinforcement
  if (rand < 0.9) return 'implement';     // 20% chance - practical application
  return 'connect';                       // 10% chance - connecting concepts
} 