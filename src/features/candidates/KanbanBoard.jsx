import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DndContext, DragOverlay, closestCorners, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import MatchScoreBar from '../../components/charts/MatchScoreBar';
import GhostRiskIndicator from '../../components/GhostRiskIndicator';
import CandidateAvatar from '../../components/ui/CandidateAvatar';
import { STAGE_CONFIG } from '../../components/StageBadge';
import { updateCandidate } from '../../api/candidates';
import toast from 'react-hot-toast';

const STAGES = ['applied', 'screening', 'interview', 'offer', 'rejected', 'hired'];

const CandidateCard = ({ candidate, isDragging }) => {
  const navigate = useNavigate();
  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: '16px',
        cursor: isDragging ? 'grabbing' : 'grab',
        opacity: isDragging ? 0.9 : 1,
        boxShadow: isDragging ? '0 4px 20px rgba(0,0,0,0.4)' : 'none',
        transition: 'box-shadow 0.15s ease, opacity 0.15s ease',
        userSelect: 'none',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 12 }}>
        <CandidateAvatar name={candidate.name} size={36} shortlisted={candidate.savedToShortlist} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', cursor: 'pointer' }}
            onClick={e => { e.stopPropagation(); navigate(`/candidates/${candidate._id}`); }}
          >
            {candidate.name}
          </div>
          <div className="tabular" style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2, fontFamily: 'var(--font-mono)' }}>{candidate.experience}y exp</div>
        </div>
        <GhostRiskIndicator risk={candidate.ghostRisk} showLabel={false} />
      </div>

      <MatchScoreBar score={candidate.matchScore} size="sm" />

      {candidate.skills.length > 0 && (
        <div style={{ display: 'flex', gap: 6, marginTop: 12, flexWrap: 'wrap' }}>
          {candidate.skills.slice(0, 3).map(s => (
            <span key={s} style={{ background: 'var(--bg-overlay)', border: '1px solid var(--border)', fontSize: 11, padding: '1px 6px', borderRadius: 4, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>{s}</span>
          ))}
        </div>
      )}
    </div>
  );
};

const SortableCard = ({ candidate }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: candidate._id });
  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} {...attributes} {...listeners}>
      <CandidateCard candidate={candidate} isDragging={isDragging} />
    </div>
  );
};

const KanbanBoard = ({ candidates, onUpdate }) => {
  const [activeCandidate, setActiveCandidate] = useState(null);
  const [localCandidates, setLocalCandidates] = useState(candidates);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  if (JSON.stringify(candidates.map(c => c._id + c.stage)) !== JSON.stringify(localCandidates.map(c => c._id + c.stage))) {
    setLocalCandidates(candidates);
  }

  const getStageCards = (stage) => localCandidates.filter(c => c.stage === stage);
  const findStageByCardId = (id) => localCandidates.find(c => c._id === id)?.stage;

  const handleDragStart = ({ active }) => setActiveCandidate(localCandidates.find(c => c._id === active.id) || null);

  const handleDragEnd = async ({ active, over }) => {
    setActiveCandidate(null);
    if (!over) return;

    const fromStage = findStageByCardId(active.id);
    const toStage = STAGES.includes(over.id) ? over.id : findStageByCardId(over.id);

    if (!toStage || fromStage === toStage) return;

    setLocalCandidates(cs => cs.map(c => c._id === active.id ? { ...c, stage: toStage } : c));

    try {
      const updated = await updateCandidate(active.id, { stage: toStage });
      onUpdate(updated.candidate);
      toast.success(`${activeCandidate?.name || 'Candidate'} → ${STAGE_CONFIG[toStage]?.label || toStage}`);
    } catch {
      setLocalCandidates(cs => cs.map(c => c._id === active.id ? { ...c, stage: fromStage } : c));
      toast.error('Failed to update stage');
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div style={{
        display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 16,
        minHeight: 500,
      }}>
        {STAGES.map(stage => {
          const cards = getStageCards(stage);
          const config = STAGE_CONFIG[stage] || STAGE_CONFIG.applied;
          return (
            <div
              key={stage}
              id={stage}
              style={{
                minWidth: 260, width: 260, flexShrink: 0,
                background: 'var(--bg-elevated)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border)',
                display: 'flex', flexDirection: 'column',
              }}
            >
              {/* Column Header */}
              <div style={{
                padding: '14px 16px',
                borderBottom: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: 'var(--bg-overlay)',
                borderTopLeftRadius: 'var(--radius-lg)', borderTopRightRadius: 'var(--radius-lg)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: config.color, flexShrink: 0, boxShadow: `0 0 6px ${config.color}80` }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{config.label}</span>
                </div>
                <span className="tabular" style={{
                  fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600,
                  background: 'var(--bg-surface)', color: 'var(--text-muted)',
                  border: '1px solid var(--border-strong)',
                  padding: '1px 8px', borderRadius: 4,
                }}>
                  {cards.length}
                </span>
              </div>

              {/* Droppable Cards Area */}
              <SortableContext items={cards.map(c => c._id)} strategy={verticalListSortingStrategy} id={stage}>
                <div
                  id={stage}
                  style={{
                    flex: 1, padding: 12,
                    display: 'flex', flexDirection: 'column', gap: 12,
                    minHeight: 120,
                  }}
                >
                  {cards.map(c => <SortableCard key={c._id} candidate={c} />)}
                  {cards.length === 0 && (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 60 }}>
                      <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Empty</span>
                    </div>
                  )}
                </div>
              </SortableContext>
            </div>
          );
        })}
      </div>

      <DragOverlay>
        {activeCandidate && <CandidateCard candidate={activeCandidate} isDragging />}
      </DragOverlay>
    </DndContext>
  );
};

export default KanbanBoard;
