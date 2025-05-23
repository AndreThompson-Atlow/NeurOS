'use client';

import type { Module, ModuleStatus, ModuleType } from '@/types/neuro';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, Trash2, CheckCircle, DownloadCloud, Zap, BookOpen, Settings2, Library, Shield, Star, FlaskConical, RefreshCwOff, Brain, Bot, Database, AlertTriangle } from 'lucide-react'; // Added icons for settings
import { Badge } from '@/components/ui/badge';
import { useLearningSession } from '@/hooks/useLearningSession';
import { Switch } from '@/components/ui/switch'; // Added Switch import
import { Label }  from '@/components/ui/label'; // Added Label import
import { Separator } from '../ui/separator';

interface AdminPanelProps {
  modules: Record<string, Module>;
  onSetModuleStatus: (moduleId: string, status: ModuleStatus) => void;
  onRemoveModule: (moduleId: string) => void;
  onExit: () => void;
}

const moduleStatusOptions: ModuleStatus[] = ['new', 'in_library', 'downloading', 'downloaded', 'installing', 'installed'];

const getStatusVisuals = (status: ModuleStatus | undefined) => {
    switch(status) {
        case 'new': return { text: 'New', icon: <Zap size={16} className="text-secondary" />, colorClass: 'text-secondary border-secondary/50 bg-secondary/10' };
        case 'in_library': return { text: 'In Library', icon: <Library size={16} className="text-foreground/80" />, colorClass: 'text-foreground/80 border-foreground/30 bg-foreground/10' };
        case 'downloading': return { text: 'Downloading', icon: <DownloadCloud size={16} className="animate-pulse text-secondary" />, colorClass: 'text-secondary border-secondary/50 bg-secondary/10' };
        case 'downloaded': return { text: 'Downloaded', icon: <CheckCircle size={16} className="text-primary" />, colorClass: 'text-primary border-primary/50 bg-primary/10' }; 
        case 'installing': return { text: 'Installing', icon: <Settings2 size={16} className="animate-pulse text-primary" />, colorClass: 'text-primary border-primary/50 bg-primary/10' };
        case 'installed': return { text: 'Installed', icon: <BookOpen size={16} className="text-green-400" />, colorClass: 'text-green-400 border-green-500/50 bg-green-500/10' }; 
        default: return { text: 'Unknown', icon: null, colorClass: 'text-muted-foreground border-muted-foreground/30 bg-muted/10' };
    }
};

const getModuleTypeVisuals = (type: ModuleType | undefined) => {
    switch(type) {
        case 'core': return { text: 'Core', icon: <Shield size={14} className="text-primary"/>, colorClass: 'border-primary text-primary bg-primary/10' };
        case 'pillar': return { text: 'Pillar', icon: <Star size={14} className="text-secondary"/>, colorClass: 'border-secondary text-secondary bg-secondary/10' };
        case 'auxiliary': return { text: 'Auxiliary', icon: <FlaskConical size={14} className="text-muted-foreground"/>, colorClass: 'border-muted-foreground text-muted-foreground bg-muted/20' };
        case 'challenge': return { text: 'Challenge', icon: <Zap size={14} className="text-destructive"/>, colorClass: 'border-destructive text-destructive bg-destructive/10' };
        default: return { text: 'Unknown', icon: null, colorClass: 'border-border text-muted-foreground' };
    }
};

export function AdminPanel({ modules, onSetModuleStatus, onRemoveModule, onExit }: AdminPanelProps) {
  const modulesArray = Object.values(modules);
  const { admin_markAllInstalledNodesForReview, isThoughtAnalyzerEnabled, toggleThoughtAnalyzer, aiProvider, setAIProvider, admin_clearUserData } = useLearningSession();

  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <Card className="shadow-cyan-md" data-alignment="neutral">
        <CardHeader className="bg-muted/30 p-4 rounded-t-lg border-b">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <CardTitle className="text-2xl font-display text-glow-cyan flex items-center gap-2"><Settings2 size={24}/>Admin Panel</CardTitle>
            <Button variant="outline" size="sm" onClick={onExit}>
                <ArrowLeft size={16} className="mr-1" /> Back to Dashboard
            </Button>
          </div>
          <CardDescription className="text-muted-foreground/80 mt-1">Manage system settings and module states.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[calc(100vh-280px)]">
            <div className="p-4">
              {/* System Settings Section */}
              <Card className="mb-6 border-border/50 bg-card/90">
                <CardHeader className="p-3 border-b border-border/30">
                  <CardTitle className="text-lg text-glow-cyan flex items-center gap-2">
                    <Brain size={20} className="text-secondary"/> System Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-center justify-between space-x-2 p-3 bg-muted/20 rounded-md border border-border/20">
                    <Label htmlFor="thought-analyzer-toggle" className="text-sm font-medium text-foreground/90">
                      Enable Thought Analyzer (Detailed Evaluation)
                    </Label>
                    <Switch
                      id="thought-analyzer-toggle"
                      checked={isThoughtAnalyzerEnabled}
                      onCheckedChange={toggleThoughtAnalyzer}
                      aria-label="Toggle Thought Analyzer"
                    />
                  </div>
                  <div className="flex items-center justify-between space-x-2 p-3 bg-muted/20 rounded-md border border-border/20">
                    <Label htmlFor="ai-provider-select" className="text-sm font-medium text-foreground/90 flex items-center gap-2">
                      <Bot size={16} className="text-primary"/>
                      AI Provider & Model
                    </Label>
                    <Select
                      value={aiProvider || 'gemini'}
                      onValueChange={(value) => setAIProvider(value)}
                    >
                      <SelectTrigger id="ai-provider-select" className="w-[200px] h-9 text-xs ui-select-trigger">
                        <SelectValue placeholder="Select AI provider" />
                      </SelectTrigger>
                      <SelectContent className="ui-select-content">
                        <SelectItem value="gemini" className="text-xs ui-select-item">
                          🟢 Gemini 1.5 Pro
                        </SelectItem>
                        <SelectItem value="gemini25" className="text-xs ui-select-item">
                          🟢 Gemini 2.5 Pro (Preview)
                        </SelectItem>
                        <SelectItem value="openai" className="text-xs ui-select-item">
                          🔵 GPT-4 Turbo
                        </SelectItem>
                        <SelectItem value="claude" className="text-xs ui-select-item">
                          🟣 Claude 3.5 Sonnet v2
                        </SelectItem>
                        <SelectItem value="claude37" className="text-xs ui-select-item">
                          🟣 Claude 3.7 Sonnet
                        </SelectItem>
                        <SelectItem value="claude4" className="text-xs ui-select-item">
                          🟣 Claude 4 Sonnet
                        </SelectItem>
                        <SelectItem value="claudeOpus4" className="text-xs ui-select-item">
                          🟣 Claude 4 Opus (Premium)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between space-x-2 p-3 bg-muted/20 rounded-md border border-border/20">
                    <Label htmlFor="mark-review-button" className="text-sm font-medium text-foreground/90">
                        Force Review for All Installed Nodes
                    </Label>
                    <Button variant="outline" size="sm" onClick={() => admin_markAllInstalledNodesForReview()} id="mark-review-button">
                        <RefreshCwOff size={16} className="mr-1" /> Mark All for Review
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between space-x-2 p-3 bg-muted/20 rounded-md border border-border/20">
                    <div>
                      <Label htmlFor="clear-data-button" className="text-sm font-medium text-foreground/90 flex items-center gap-2">
                          <Database size={16} className="text-destructive"/>
                          Clear All User Data
                      </Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        Resets all modules and settings to default. Cannot be undone.
                      </p>
                    </div>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={() => {
                        const confirm = window.confirm("This will clear ALL user data and reset the application. This cannot be undone. Are you sure?");
                        if (confirm) {
                          admin_clearUserData();
                        }
                      }} 
                      id="clear-data-button"
                    >
                        <AlertTriangle size={16} className="mr-1" /> Clear All Data
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Module Control Section */}
              <CardHeader className="p-0 mb-3">
                 <CardTitle className="text-lg text-glow-cyan flex items-center gap-2">
                    <Library size={20} className="text-primary"/> Module Control
                  </CardTitle>
                  <CardDescription className="text-muted-foreground/70 text-xs">Modify module statuses or remove them from the NeuroOS library. Core modules cannot be removed.</CardDescription>
              </CardHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {modulesArray.length === 0 && (
                    <p className="text-muted-foreground text-center py-8 italic md:col-span-2">No modules found in the system.</p>
                )}
                {modulesArray.map((module) => {
                  const statusVisuals = getStatusVisuals(module.status);
                  const typeVisuals = getModuleTypeVisuals(module.type);
                  let cardAlignment: "law" | "chaos" | "neutral" = "neutral";
                  if (module.alignmentBias === "law") cardAlignment = "law";
                  else if (module.alignmentBias === "chaos") cardAlignment = "chaos";

                  return (
                  <Card 
                    key={module.id} 
                    className="border-border/50 bg-card/80 hover:scale-[1.02] hover:shadow-cyan-md flex flex-col" 
                    data-alignment={cardAlignment}
                  >
                    <CardHeader className="p-3 border-b border-border/30">
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-grow min-w-0">
                            <CardTitle className="text-lg font-display flex items-center gap-2 truncate" title={module.title}>
                                {statusVisuals.icon}
                                <span className={module.status === 'installed' ? 'text-glow-gold' : module.status === 'new' ? 'text-glow-cyan' : ''}>{module.title}</span>
                            </CardTitle>
                            <p className="text-xs text-muted-foreground/70 mt-0.5">ID: {module.id}</p>
                        </div>
                        <div className="flex-shrink-0 flex flex-col items-end gap-1">
                            <Badge variant="outline" className={`text-xxs py-0.5 px-1.5 ${typeVisuals.colorClass}`}>
                                {typeVisuals.icon && React.cloneElement(typeVisuals.icon, {size: 12, className: `mr-0.5 ${typeVisuals.colorClass.split(' ')[0]}`})}
                                {typeVisuals.text}
                            </Badge>
                            <Badge variant="outline" className={`text-xxs py-0.5 px-1.5 ${statusVisuals.colorClass}`}>
                                {statusVisuals.text}
                            </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-3 flex-grow">
                      <p className="text-sm text-muted-foreground/80 mb-2 leading-relaxed line-clamp-3">{module.description}</p>
                    </CardContent>
                    <CardFooter className="p-3 flex flex-col sm:flex-row justify-between items-center gap-3 bg-muted/20 border-t border-border/30 mt-auto">
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <span className="text-sm font-medium text-muted-foreground">Status:</span>
                        <Select
                          value={module.status}
                          onValueChange={(newStatus) => onSetModuleStatus(module.id, newStatus as ModuleStatus)}
                        >
                          <SelectTrigger className="w-full sm:w-[180px] h-9 text-xs ui-select-trigger">
                            <SelectValue placeholder="Set status" />
                          </SelectTrigger>
                          <SelectContent className="ui-select-content">
                            {moduleStatusOptions.map((status) => (
                              <SelectItem key={status} value={status} className="text-xs ui-select-item">
                                {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onRemoveModule(module.id)}
                        title={`Remove ${module.title} from library`}
                        disabled={module.type === 'core'} 
                        className="w-full sm:w-auto"
                      >
                        <Trash2 size={14} className="mr-1" /> Remove Module
                      </Button>
                    </CardFooter>
                  </Card>
                )})}
                </div>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
