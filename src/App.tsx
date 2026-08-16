import React, { useState, useEffect, useCallback } from 'react';
import {
  Task,
  TaskType,
  ViewMode,
  AiParsedItem,
  STUDENTS,
} from './types';
import {
  getFirestoreTasks,
  addFirestoreTask,
  updateFirestoreTask,
  deleteFirestoreTask,
  seedFirestoreWithCsvData,
} from './lib/firebase';
import { Header } from './components/Header';
import { ChildSelector } from './components/ChildSelector';
import { ViewSwitcher } from './components/ViewSwitcher';
import { FilterChips } from './components/FilterChips';
import { ListView } from './components/ListView';
import { WeekView } from './components/WeekView';
import { MonthView } from './components/MonthView';
import { TaskModal } from './components/TaskModal';
import { AiAssistantModal } from './components/AiAssistantModal';
import { SettingsModal } from './components/SettingsModal';
import { InstallPwaModal } from './components/InstallPwaModal';
import { BottomNav } from './components/BottomNav';
import { FloatingActions } from './components/FloatingActions';

import { StudentLandingPage } from './components/StudentLandingPage';

export default function App() {
  const [activeScreen, setActiveScreen] = useState<'landing' | 'detail'>('landing');
  const [selectedChildId, setSelectedChildId] = useState<string>('sky');
  const activeChild = STUDENTS.find((s) => s.id === selectedChildId) || STUDENTS[0];

  const [tasks, setTasks] = useState<Task[]>([]);
  const [syncStatus, setSyncStatus] = useState<'syncing' | 'ok' | 'error'>('ok');
  const [lastSynced, setLastSynced] = useState<Date | null>(new Date());

  const [view, setView] = useState<ViewMode>('list');
  const [activeTypes, setActiveTypes] = useState<Record<TaskType, boolean>>({
    homework: true,
    exam: true,
    activity: true,
  });

  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isEditingTask, setIsEditingTask] = useState(false);
  const [taskDraft, setTaskDraft] = useState<Task | null>(null);

  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isInstallPwaModalOpen, setIsInstallPwaModalOpen] = useState(false);

  // Fetch tasks from Firestore
  const fetchTasks = useCallback(async () => {
    setSyncStatus('syncing');
    try {
      const fsTasks = await getFirestoreTasks();
      setTasks(fsTasks);
      setSyncStatus('ok');
      setLastSynced(new Date());
    } catch (err) {
      console.error(err);
      setSyncStatus('error');
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Toggle category filter chips
  const handleToggleType = (typeKey: TaskType) => {
    setActiveTypes((prev) => ({
      ...prev,
      [typeKey]: !prev[typeKey],
    }));
  };

  // Status Cycle: not_started -> prepared -> done -> not_started
  const handleCycleStatus = async (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const STATUS_NEXT: Record<string, 'not_started' | 'prepared' | 'done'> = {
      not_started: 'prepared',
      prepared: 'done',
      done: 'not_started',
    };

    const target = tasks.find((t) => t.id === taskId);
    if (!target) return;

    const nextStatus = STATUS_NEXT[target.status] || 'not_started';

    // Optimistic Update
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: nextStatus } : t))
    );
    setSyncStatus('syncing');

    try {
      await updateFirestoreTask(taskId, { status: nextStatus });
      setSyncStatus('ok');
      setLastSynced(new Date());
    } catch (err) {
      console.error(err);
      setSyncStatus('error');
    }
  };

  // Task Modal Handlers
  const handleOpenAddNew = (presetDate?: string) => {
    const todayStr = new Date().toISOString().split('T')[0];
    setTaskDraft({
      id: '',
      childId: selectedChildId,
      type: 'homework',
      title: '',
      subject: '',
      date: presetDate || todayStr,
      time: '',
      location: '',
      notes: '',
      imageUrl: '',
      status: 'not_started',
    });
    setIsEditingTask(false);
    setIsTaskModalOpen(true);
  };

  const handleOpenEdit = (task: Task) => {
    setTaskDraft(task);
    setIsEditingTask(true);
    setIsTaskModalOpen(true);
  };

  const handleSaveTask = async (task: Task) => {
    setSyncStatus('syncing');
    const taskWithChild = {
      ...task,
      childId: task.childId || selectedChildId,
    };

    if (isEditingTask && taskWithChild.id) {
      // Optimistic update
      setTasks((prev) => prev.map((t) => (t.id === taskWithChild.id ? { ...t, ...taskWithChild } : t)));
      try {
        await updateFirestoreTask(taskWithChild.id, taskWithChild);
        await fetchTasks();
        setSyncStatus('ok');
        setLastSynced(new Date());
      } catch (err) {
        console.error(err);
        setSyncStatus('error');
      }
    } else {
      const generatedId = taskWithChild.id || 'task-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
      const newTask = { ...taskWithChild, id: generatedId };
      // Optimistic update
      setTasks((prev) => [newTask, ...prev]);
      try {
        await addFirestoreTask(newTask);
        await fetchTasks();
        setSyncStatus('ok');
        setLastSynced(new Date());
      } catch (err) {
        console.error(err);
        setSyncStatus('error');
      }
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    setSyncStatus('syncing');
    // Optimistic delete
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    try {
      await deleteFirestoreTask(taskId);
      await fetchTasks();
      setSyncStatus('ok');
      setLastSynced(new Date());
    } catch (err) {
      console.error(err);
      setSyncStatus('error');
    }
  };

  // AI Bulk Save
  const handleAiBulkSave = async (parsedItems: AiParsedItem[], targetChildId: string) => {
    setSyncStatus('syncing');
    try {
      for (const item of parsedItems) {
        await addFirestoreTask({
          childId: targetChildId || selectedChildId,
          type: item.type || 'homework',
          title: item.title,
          subject: item.subject || '',
          date: item.date || new Date().toISOString().split('T')[0],
          notes: item.notes || '',
          imageUrl: item.imageUrl || '',
          attachments: item.attachments || [],
          status: 'not_started',
        });
      }
      await fetchTasks();
      setSyncStatus('ok');
      setLastSynced(new Date());
    } catch (err) {
      console.error(err);
      setSyncStatus('error');
    }
  };

  // Update Settings
  const handleUpdateSettings = async (name: string, grade: string) => {
    try {
      await fetch('/api/auth/update-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ childName: name, grade }),
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleResetData = async () => {
    setSyncStatus('syncing');
    try {
      const resetTasks = await seedFirestoreWithCsvData();
      setTasks(resetTasks);
      setSyncStatus('ok');
      setLastSynced(new Date());
    } catch (err) {
      console.error(err);
      setSyncStatus('error');
    }
  };

  // Filter tasks according to selected child & category chips
  const studentTasks = tasks.filter((t) => (t.childId || 'sky') === selectedChildId);
  const filteredTasks = studentTasks.filter((t) => activeTypes[t.type]);
  const pendingTasks = filteredTasks.filter((t) => t.status !== 'done');
  const completedTasks = filteredTasks.filter((t) => t.status === 'done');

  return (
    <div className="min-h-screen bg-[#fff8f3] text-[#1f1b15] pb-28 md:pb-12 flex flex-col font-['Noto_Sans_Thai','Nunito_Sans',sans-serif]">
      {activeScreen === 'landing' ? (
        <StudentLandingPage
          onSelectChild={(childId) => {
            setSelectedChildId(childId);
            setActiveScreen('detail');
          }}
          tasks={tasks}
          onOpenAi={() => setIsAiModalOpen(true)}
          onOpenAdd={() => handleOpenAddNew()}
          onOpenSettings={() => setIsSettingsModalOpen(true)}
          onOpenInstallPwa={() => setIsInstallPwaModalOpen(true)}
        />
      ) : (
        <>
          {/* Top Header */}
          <Header
            childName={activeChild.name}
            childGrade={activeChild.grade}
            avatarUrl={activeChild.avatarUrl}
            syncStatus={syncStatus}
            lastSynced={lastSynced}
            onRefresh={fetchTasks}
            onOpenAi={() => setIsAiModalOpen(true)}
            onOpenAdd={() => handleOpenAddNew()}
            onOpenSettings={() => setIsSettingsModalOpen(true)}
            onGoHome={() => setActiveScreen('landing')}
            onOpenInstallPwa={() => setIsInstallPwaModalOpen(true)}
          />

          {/* Main Container */}
          <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-4 sm:pt-6 flex flex-col gap-6 flex-1">
            {/* Student Switcher Bar (3 Children) */}
            <ChildSelector
              selectedChildId={selectedChildId}
              onSelectChild={setSelectedChildId}
              tasks={tasks}
            />

            {/* View Switcher Tabs (รายการ / สัปดาห์ / เดือน / เสร็จแล้ว) */}
            <ViewSwitcher currentView={view} onViewChange={setView} />

            {/* Sticker-like Filter Chips */}
            <FilterChips
              activeTypes={activeTypes}
              onToggleType={handleToggleType}
              onOpenAddModal={() => handleOpenAddNew()}
            />

            {/* Active View */}
            {view === 'list' && (
              <ListView
                tasks={pendingTasks}
                onOpenEdit={handleOpenEdit}
                onCycleStatus={handleCycleStatus}
              />
            )}

            {view === 'completed' && (
              <ListView
                tasks={completedTasks}
                onOpenEdit={handleOpenEdit}
                onCycleStatus={handleCycleStatus}
                isCompletedView={true}
              />
            )}

            {view === 'week' && (
              <WeekView
                tasks={filteredTasks}
                onOpenEdit={handleOpenEdit}
                onOpenAddDate={handleOpenAddNew}
              />
            )}

            {view === 'month' && (
              <MonthView
                tasks={filteredTasks}
                onOpenEdit={handleOpenEdit}
                onOpenAddDate={handleOpenAddNew}
              />
            )}
          </main>

          {/* Floating Action Buttons */}
          <FloatingActions
            onOpenAi={() => setIsAiModalOpen(true)}
            onOpenAdd={() => handleOpenAddNew()}
          />

          {/* Mobile Bottom Navigation Bar */}
          <BottomNav
            currentView={view}
            onViewChange={setView}
            onOpenAiModal={() => setIsAiModalOpen(true)}
            onOpenSettings={() => setIsSettingsModalOpen(true)}
          />
        </>
      )}

      {/* Task Add/Edit Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        isEditing={isEditingTask}
        taskDraft={taskDraft}
        activeChildId={selectedChildId}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
      />

      {/* ✨ AI Assistant Modal */}
      <AiAssistantModal
        isOpen={isAiModalOpen}
        activeChildId={selectedChildId}
        onClose={() => setIsAiModalOpen(false)}
        onBulkSave={handleAiBulkSave}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        childName={activeChild.name}
        childGrade={activeChild.grade}
        onUpdateInfo={handleUpdateSettings}
        onResetData={handleResetData}
        onOpenInstallPwa={() => setIsInstallPwaModalOpen(true)}
      />

      {/* 📲 Install PWA Mobile Modal */}
      <InstallPwaModal
        isOpen={isInstallPwaModalOpen}
        onClose={() => setIsInstallPwaModalOpen(false)}
      />
    </div>
  );
}
