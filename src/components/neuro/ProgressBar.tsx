
import type { LearningProgress, Module, NodeStatus } from '@/types/neuro';
import { Progress } from '@/components/ui/progress';
import { Download, BrainCircuit, CheckCircle } from 'lucide-react';

interface ProgressBarProps {
  module: Module | null;
  progress: LearningProgress;
}

export function ProgressBar({ module, progress }: ProgressBarProps) {
  if (!module || !module.domains || module.domains.length === 0 || !progress) return null;

  const allNodes = module.domains.flatMap(d => d.nodes ?? []);
  const totalNodes = allNodes.length;

  const completedNodesDownload = allNodes.filter(n => n.status === 'familiar' || n.status === 'understood' || n.status === 'needs_review').length;
  const completedNodesInstall = allNodes.filter(n => n.status === 'understood' || n.status === 'needs_review').length;

  const downloadProgress = totalNodes > 0 ? (completedNodesDownload / totalNodes) * 100 : 0;
  const installProgress = totalNodes > 0 ? (completedNodesInstall / totalNodes) * 100 : 0;

  const currentDomainIndex = Math.min(progress.currentDomainIndex, module.domains.length - 1);
  const currentDomain = module.domains[currentDomainIndex];
  const nodesInCurrentDomain = currentDomain?.nodes?.length ?? 0;
  const currentNodeIndex = Math.min(progress.currentNodeIndex, nodesInCurrentDomain > 0 ? nodesInCurrentDomain - 1 : 0);

  const currentDomainTitle = currentDomain?.title ?? 'N/A';
  const currentNodeTitle = (nodesInCurrentDomain > 0 && currentDomain?.nodes) ? (currentDomain.nodes[currentNodeIndex]?.title ?? 'N/A') : 'N/A';
  const displayNodeIndex = nodesInCurrentDomain > 0 ? currentNodeIndex + 1 : 0;

  const isModuleInstalled = module.status === 'installed';

  return (
    <div className="w-full p-spacing-lg mb-spacing-lg border border-border rounded-lg shadow-cyan-sm bg-card text-card-foreground"> {/* Increased padding and bottom margin */}
      <h3 className="text-3xl font-display mb-spacing-md text-glow-cyan">{module.title}</h3> {/* Increased font size and bottom margin */}
      {!isModuleInstalled ? (
        <>
          <div className="text-base text-muted-foreground mb-spacing-md flex flex-wrap gap-x-spacing-md gap-y-spacing-sm"> {/* Increased font size, margins and gaps */}
            <span>
                Phase: <span className="font-medium text-secondary">
                        {progress.currentPhase === 'download' ? <Download className="inline-block mr-1.5 h-5 w-5 text-law-accent-color" /> : <BrainCircuit className="inline-block mr-1.5 h-5 w-5 text-chaos-accent-color" />} {/* Increased icon size and margin */}
                        {progress.currentPhase.charAt(0).toUpperCase() + progress.currentPhase.slice(1)}
                      </span>
            </span>
            <span className="hidden sm:inline text-muted-foreground/50">|</span>
            <span>
                Domain: <span className="font-medium text-foreground/90">{currentDomainTitle} ({currentDomainIndex + 1}/{module.domains.length})</span>
            </span>
            <span className="hidden sm:inline text-muted-foreground/50">|</span>
            <span>
                Node: <span className="font-medium text-foreground/90">{currentNodeTitle} ({displayNodeIndex}/{nodesInCurrentDomain})</span>
            </span>
          </div>

          <div className="space-y-spacing-md mt-spacing-sm"> {/* Increased space-y and top margin */}
            <div className="flex items-center gap-spacing-sm"> {/* Increased gap */}
                <Download size={20} className="text-law-accent-color" /> {/* Increased icon size */}
                <span className="text-base font-medium w-28 flex-shrink-0 text-glow-cyan">Download:</span> {/* Increased font size and width */}
                <Progress value={downloadProgress} className="flex-1 ui-progress h-2.5" variant="law" aria-label={`Nodes downloaded: ${downloadProgress.toFixed(0)}%`} /> {/* Increased height */}
                <span className="text-base font-medium w-14 text-right flex-shrink-0">{downloadProgress.toFixed(0)}%</span> {/* Increased font size and width */}
            </div>
            <div className="flex items-center gap-spacing-sm"> {/* Increased gap */}
                <BrainCircuit size={20} className="text-chaos-accent-color" /> {/* Increased icon size */}
                <span className="text-base font-medium w-28 flex-shrink-0 text-glow-gold">Install:</span> {/* Increased font size and width */}
                <Progress value={installProgress} className="flex-1 ui-progress h-2.5" variant="chaos" aria-label={`Nodes installed: ${installProgress.toFixed(0)}%`} /> {/* Increased height */}
                <span className="text-base font-medium w-14 text-right flex-shrink-0">{installProgress.toFixed(0)}%</span> {/* Increased font size and width */}
            </div>
          </div>
        </>
      ) : (
        <div className="flex items-center gap-spacing-sm text-construct-gold mt-spacing-md"> {/* Increased top margin and gap */}
          <CheckCircle size={24} /> {/* Increased icon size */}
          <span className="text-xl font-medium text-glow-gold">Module Installed & Mastered</span> {/* Increased font size */}
        </div>
      )}
    </div>
  );
}
