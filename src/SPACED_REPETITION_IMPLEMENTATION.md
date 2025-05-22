# Spaced Repetition Implementation for NeuroOS

This document outlines a plan to enhance NeuroOS with a true spaced repetition system for reviewing nodes.

## Current System

The current review system works as follows:
- Nodes get marked for review based on memory strength or time elapsed since last review
- Reviews are scheduled based on simple criteria (strength < 50 or time > 7 days for medium strength, time > 30 days for high strength)
- EPIC components are randomly selected for review

## Proposed Enhancements

### 1. Spaced Repetition Intervals

Implement a true spaced repetition algorithm with increasing intervals:

```typescript
// Define intervals based on memory strength (in hours)
const getReviewIntervalHours = (memoryStrength: number): number => {
  if (memoryStrength < 20) return 1;      // 1 hour
  if (memoryStrength < 40) return 24;     // 1 day 
  if (memoryStrength < 60) return 48;     // 2 days
  if (memoryStrength < 75) return 96;     // 4 days
  if (memoryStrength < 90) return 168;    // 1 week
  return 336;                             // 2 weeks
};

// Calculate next review date
const getNextReviewDate = (lastReviewed: Date, memoryStrength: number): Date => {
  const intervalHours = getReviewIntervalHours(memoryStrength);
  const nextDate = new Date(lastReviewed);
  nextDate.setHours(nextDate.getHours() + intervalHours);
  return nextDate;
};
```

### 2. Weighted EPIC Component Selection

Instead of random selection, weight EPIC components to focus on the most effective components:

```typescript
// Get weighted EPIC component with emphasis on Probe and Explain
const getWeightedEpicComponent = (): EpicStep => {
  const rand = Math.random();
  if (rand < 0.4) return 'probe';         // 40% chance
  if (rand < 0.7) return 'explain';       // 30% chance
  if (rand < 0.9) return 'implement';     // 20% chance
  return 'connect';                       // 10% chance
};
```

### 3. Enhanced Priority Scoring

Calculate review priority based on multiple factors:

```typescript
// Priority calculation factors:
// 1. Explicitly marked nodes get highest priority
// 2. More overdue nodes get higher priority
// 3. Weaker memory strength gets higher priority
const priorityScore = 
  (node.status === 'needs_review' ? 200 : 0) +
  Math.min(hoursOverdue, 200) +  // Cap overdue hours contribution
  (100 - memoryStrength);        // Lower strength means higher priority
```

### 4. Store Due Dates

Add `reviewDueDate` to `ReviewSessionNode` interface to track when each node is due for review:

```typescript
export interface ReviewSessionNode {
  moduleId: string;
  nodeId: string;
  epicComponentToReview: EpicStep;
  priorityScore?: number;
  lastReviewed?: Date;
  currentMemoryStrength?: number;
  reviewDueDate?: Date;  // New field
}
```

### 5. Memory Strength Adjustment

Adjust memory strength based on review performance with a more nuanced approach:

```typescript
// In ReviewScreen component
if (isPass) {
  // Success increases memory strength more for high scores
  strengthChange = score >= 95 ? 30 : (score >= 90 ? 25 : 20);
} else {
  // Failure decreases memory strength based on how bad the failure was
  strengthChange = score >= 60 ? -5 : (score >= 40 ? -10 : -15);
}
const newMemoryStrength = Math.max(0, Math.min(100, oldMemoryStrength + strengthChange));
```

## Integration Steps

1. Update the `ReviewSessionNode` type to include `reviewDueDate`
2. Modify `getNodesForReviewCallback` to implement the spaced repetition algorithm
3. Update review UI to show when nodes are due for review
4. Add notification system to alert users when reviews are due

## UI Enhancements

1. Show a countdown or due date for upcoming reviews
2. Provide a visual indication of memory strength for each node
3. Display statistics about review performance
4. Create a dashboard view for tracking review progress

## Future Extensions

1. Separate scheduling for different EPIC components
2. Adaptive difficulty based on performance history
3. Learning curve analysis to optimize intervals
4. Integration with user's calendar for scheduling reviews 