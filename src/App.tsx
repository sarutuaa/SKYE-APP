import React, { useState, useEffect, useCallback } from 'react';
import {
  Task,
  TaskType,
  ViewMode,
  AiParsedItem,
} from './types';
import {
  getFirestoreTasks,
  addFirestoreTask,
  updateFirestoreTask,
  deleteFirestoreTask,
  seedFirestoreWithCsvData,
} from './lib/firebase';
import { Header } from './components/Header';
import { ViewSwitcher } from './components/ViewSwitcher';
import { FilterChips } from './components/FilterChips';
import { ListView } from './components/ListView';
import { WeekView } from './components/WeekView';
import { MonthView } from './components/MonthView';
import { TaskModal } from './components/TaskModal';
import { AiAssistantModal } from './components/AiAssistantModal';
import { LoginModal } from './components/LoginModal';
import { SettingsModal } from './components/SettingsModal';
import { BottomNav } from './components/BottomNav';
import { FloatingActions } from './components/FloatingActions';

export default function App() {
  const [authed, setAuthed] = useState<boolean>(() => {
    return sessionStorage.getItem('sky_app_authed') === 'true';
  });
  const [loginError, setLoginError] = useState<string>('');

  const [childInfo, setChildInfo] = useState({
    name: 'น้องสกาย',
    grade: 'ป.1/3',
    avatarUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuATFc5nW9SZL-oTbNhOGE6IvYzsaLScTPv2INsbO-56T3L0mnIXr7rKmsY1zgtS9ER4Zz_Kjx68mnVe-c7uYke2qE0aU1ucbmAHDPEOU-cT6Qh2kZQL4_e3orVv96Vmu1kP7QBgj0YdrZU9Jmd5yb864ezQ_XBphnw9yArd6CF99nPac25C1F4XFh4l_ga296IDuwpIWPu3gZzU7wu90PvHitVc0DkVLiZ8hkKd9tkUbX6yKvi271Sc',
  });

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
    if (authed) {
      fetchTasks();
    }
  }, [authed, fetchTasks]);

  // Auth verify
  const handleVerifyPin = async (pin: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });
      if (res.ok) {
        setAuthed(true);
        sessionStorage.setItem('sky_app_authed', 'true');
        fetchTasks();
        return true;
      } else {
        const json = await res.json();
        setLoginError(json.error || 'รหัสผ่านไม่ถูกต้อง');
        return false;
      }
    } catch (err) {
      if (pin === '5264') {
        setAuthed(true);
        sessionStorage.setItem('sky_app_authed', 'true');
        fetchTasks();
        return true;
      }
      return false;
    }
  };

  const handleLogout = () => {
    setAuthed(false);
    sessionStorage.removeItem('sky_app_authed');
  };

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
      type: 'homework',
      title: '',
      subject: '',
      date: presetDate || todayStr,
      time: '',
      location: '',
      notes: '',
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
    if (isEditingTask && task.id) {
      try {
        await updateFirestoreTask(task.id, task);
        await fetchTasks();
        setSyncStatus('ok');
        setLastSynced(new Date());
      } catch (err) {
        console.error(err);
        setSyncStatus('error');
      }
    } else {
      try {
        await addFirestoreTask(task);
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
  const handleAiBulkSave = async (parsedItems: AiParsedItem[]) => {
    setSyncStatus('syncing');
    try {
      for (const item of parsedItems) {
        await addFirestoreTask({
          type: item.type || 'homework',
          title: item.title,
          subject: item.subject || '',
          date: item.date || new Date().toISOString().split('T')[0],
          notes: item.notes || '',
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
  const handleUpdateSettings = async (name: string, grade: string, newPin?: string) => {
    setChildInfo((prev) => ({ ...prev, name, grade }));
    try {
      await fetch('/api/auth/update-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ childName: name, grade, newPin }),
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

  if (!authed) {
    return <LoginModal onVerifyPin={handleVerifyPin} loginError={loginError} />;
  }

  // Filter tasks according to selected category chips
  const filteredTasks = tasks.filter((t) => activeTypes[t.type]);
  const pendingTasks = filteredTasks.filter((t) => t.status !== 'done');
  const completedTasks = filteredTasks.filter((t) => t.status === 'done');

  return (
    <div className="min-h-screen bg-[#fff8f3] text-[#1f1b15] pb-28 md:pb-12 flex flex-col font-['Noto_Sans_Thai','Nunito_Sans',sans-serif]">
      {/* Top Header */}
      <Header
        childName={childInfo.name}
        childGrade={childInfo.grade}
        avatarUrl={childInfo.avatarUrl}
        syncStatus={syncStatus}
        lastSynced={lastSynced}
        onRefresh={fetchTasks}
        onOpenAi={() => setIsAiModalOpen(true)}
        onOpenAdd={() => handleOpenAddNew()}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Container */}
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-4 sm:pt-6 flex flex-col gap-6 flex-1">
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

      {/* Task Add/Edit Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        isEditing={isEditingTask}
        taskDraft={taskDraft}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
      />

      {/* ✨ AI Assistant Modal */}
      <AiAssistantModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onBulkSave={handleAiBulkSave}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        childName={childInfo.name}
        childGrade={childInfo.grade}
        onUpdateInfo={handleUpdateSettings}
        onResetData={handleResetData}
      />
    </div>
  );
}
