# NeuroOS Spaced Repetition Implementation Proposal

## Overview

This document outlines the specific code changes needed to implement a true spaced repetition system in NeuroOS. This system will enhance memory retention by scheduling reviews at scientifically optimized intervals.

## Implementation Steps

### 1. Update ReviewSessionNode Type

First, we need to add a `reviewDueDate` field to the `ReviewSessionNode` interface:

```typescript
// In src/types/neuro.ts
export interface ReviewSessionNode {
  moduleId: string;
  nodeId: string;
  epicComponentToReview: EpicStep;
  priorityScore?: number;
  lastReviewed?: Date;
  currentMemoryStrength?: number;
  reviewDueDate?: Date;  // New field to track when the node is due for review
}
```

### 2. Enhanced getNodesForReviewCallback Function

Update the function to use spaced repetition intervals:

```typescript
// In src/hooks/useLearningSession.ts
const getNodesForReviewCallback = useCallback((): ReviewSessionNode[] => {
  const reviewableNodes: ReviewSessionNode[] = [];
  
  // Define review intervals in hours based on memory strength
  const getReviewIntervalHours = (memoryStrength: number): number => {
    if (memoryStrength < 20) return 1;      // 1 hour
    if (memoryStrength < 40) return 24;     // 1 day
    if (memoryStrength < 60) return 48;     // 2 days
    if (memoryStrength < 75) return 96;     // 4 days
    if (memoryStrength < 90) return 168;    // 1 week
    return 336;                             // 2 weeks
  };
  
  // Select EPIC component with weighted distribution
  const getWeightedEpicComponent = (): EpicStep => {
    const rand = Math.random();
    if (rand < 0.4) return 'probe';         // 40% chance
    if (rand < 0.7) return 'explain';       // 30% chance
    if (rand < 0.9) return 'implement';     // 20% chance
    return 'connect';                       // 10% chance
  };
  
  // Calculate next review date
  const getNextReviewDate = (lastReviewed: Date, memoryStrength: number): Date => {
    const intervalHours = getReviewIntervalHours(memoryStrength);
    const nextDate = new Date(lastReviewed);
    nextDate.setHours(nextDate.getHours() + intervalHours);
    return nextDate;
  };
  
  Object.values(learningState.modules).forEach(module => {
    const fullModule = module as Module;
    if (!fullModule.domains) return;
    
    if (fullModule.status === 'installed' || fullModule.status === 'understood' || fullModule.status === 'needs_review') {
      fullModule.domains.forEach(domain => {
        (domain.nodes || []).forEach(node => {
          // Skip nodes that haven't been understood yet unless marked for review
          if (!node.understood && node.status !== 'needs_review') return;
          
          const memoryStrength = node.memoryStrength || 0;
          const now = new Date();
          
          // If never reviewed, it's due immediately
          if (!node.lastReviewed) {
            reviewableNodes.push({
              nodeId: node.id,
              moduleId: fullModule.id,
              priorityScore: 200,
              epicComponentToReview: getWeightedEpicComponent(),
              lastReviewed: undefined,
              currentMemoryStrength: memoryStrength
            });
            return;
          }
          
          const lastReviewed = new Date(node.lastReviewed);
          const nextReviewDate = getNextReviewDate(lastReviewed, memoryStrength);
          const isDue = now >= nextReviewDate;
          
          // Include if due, marked for review, or memory is weak
          if (isDue || node.status === 'needs_review' || memoryStrength < 50) {
            const hoursOverdue = isDue 
              ? Math.max(0, (now.getTime() - nextReviewDate.getTime()) / (1000 * 3600)) 
              : 0;
            
            const priorityScore = 
              (node.status === 'needs_review' ? 200 : 0) +
              Math.min(hoursOverdue, 200) +
              (100 - memoryStrength);
              
            reviewableNodes.push({
              nodeId: node.id,
              moduleId: fullModule.id,
              priorityScore: priorityScore,
              epicComponentToReview: getWeightedEpicComponent(),
              lastReviewed: node.lastReviewed,
              currentMemoryStrength: memoryStrength,
              reviewDueDate: nextReviewDate
            });
          }
        });
      });
    }
  });
  
  // Sort by priority (highest first)
  reviewableNodes.sort((a, b) => b.priorityScore! - a.priorityScore!);
  return reviewableNodes;
}, [learningState.modules]);
```

### 3. Update ReviewScreen Component

Enhance the ReviewScreen component to display due dates and memory strength information:

```typescript
// In src/components/neuro/ReviewScreen.tsx
// Add to the card display:
{activeReviewSession && currentNode && (
  <div className="flex justify-between text-xs text-muted-foreground mt-spacing-sm">
    <div>
      Memory Strength: {currentNode.memoryStrength || 0}%
      <Progress 
        value={currentNode.memoryStrength || 0} 
        className="w-32 h-1 mt-1" 
      />
    </div>
    <div>
      {activeReviewSession.nodesToReview[activeReviewSession.currentNodeIndex].reviewDueDate && (
        <span>
          Next review: {formatDistanceToNow(
            activeReviewSession.nodesToReview[activeReviewSession.currentNodeIndex].reviewDueDate!,
            { addSuffix: true }
          )}
        </span>
      )}
    </div>
  </div>
)}
```

### 4. Add Memory Strength Module

Create a dedicated view for tracking memory strength and review schedules:

```typescript
// In src/app/memory-dashboard/page.tsx
// Create a Memory Dashboard page using the concepts from REVIEW_DASHBOARD_CONCEPT.tsx
```

### 5. Enhance Notification System

Update the notification system to alert users when reviews are due:

```typescript
// In src/hooks/useLearningSession.ts
// In the useEffect for showing review notifications:

useEffect(() => {
  if (!isInitialLoadDoneRef.current || !hasHydrated) return;
  
  const reviewableNodes = getNodesForReviewCallback();
  const dueNow = reviewableNodes.filter(node => {
    if (!node.reviewDueDate) return true;
    return new Date() >= node.reviewDueDate;
  });
  
  if (activeInteraction === 'initial') {
    if (dueNow.length > 0 && !reviewNotificationShownRef.current) {
      queueToast({
        title: "Review Due",
        description: `You have ${dueNow.length} node(s) due for review. Keep your knowledge sharp!`,
        duration: 8000,
      });
      reviewNotificationShownRef.current = true;
    } else if (dueNow.length === 0 && reviewNotificationShownRef.current) {
      reviewNotificationShownRef.current = false;
    }
  } else {
    if (reviewNotificationShownRef.current && dueNow.length === 0) {
      reviewNotificationShownRef.current = false;
    }
  }
}, [learningState.modules, activeInteraction, getNodesForReviewCallback, queueToast, hasHydrated]);
```

## Testing Plan

1. Manually test the spaced repetition implementation by:
   - Installing a module
   - Completing nodes
   - Checking if reviews are scheduled at the correct intervals
   - Verifying that memory strength increases/decreases properly based on performance

2. Create a test script to simulate memory decay and review scheduling over time.

## Rollout Plan

1. Implement these changes in a development branch
2. Test thoroughly with various user scenarios
3. Deploy to staging for further testing
4. Deploy to production with feature flag
5. Monitor for any issues
6. Release to all users

## Future Enhancements

After the basic spaced repetition system is working, consider these enhancements:

1. Allow users to customize review intervals
2. Add analytics to track memory retention over time
3. Implement adaptive difficulty based on performance
4. Create a calendar integration for scheduling reviews 