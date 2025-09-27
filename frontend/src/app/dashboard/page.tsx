"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "aws-amplify/auth";
import Link from "next/link";

// Types
interface User {
  id: string;
  email: string;
  points: number;
  streak: number;
  level: number;
  tier: "free" | "premium" | "unlimited";
  ai_usage_count: number;
  total_tasks_created: number;
}

interface Task {
  id: string;
  title: string;
  status: "pending" | "in_progress" | "completed";
  priority: "low" | "medium" | "high";
  estimatedMinutes: number;
  ai_generated: boolean;
  createdAt: string;
}

interface DashboardStats {
  todayTasks: number;
  completedToday: number;
  totalPoints: number;
  currentStreak: number;
  aiCreditsRemaining: number;
  recentTasks: Task[];
}

// AI Usage Quotas
const AI_QUOTAS = {
  free: 20,
  premium: 100,
  unlimited: 9999,
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [quickTaskInput, setQuickTaskInput] = useState("");
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [useAI, setUseAI] = useState(false);
  const [loading, setLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
      router.push("/auth/signin");
    } catch (error) {
      console.error("Error signing out:", error);
      setSigningOut(false);
    }
  };

  const loadDashboardData = async () => {
    try {
      // TODO: Replace with actual API calls
      // const userResponse = await fetch('/api/users/profile');
      // const user = await userResponse.json();
      // const statsResponse = await fetch('/api/dashboard/stats');
      // const stats = await statsResponse.json();

      // Mock data for development
      setUser({
        id: "user123",
        email: "john@example.com",
        points: 1250,
        streak: 7,
        level: 3,
        tier: "free",
        ai_usage_count: 8,
        total_tasks_created: 45,
      });

      setStats({
        todayTasks: 5,
        completedToday: 3,
        totalPoints: 1250,
        currentStreak: 7,
        aiCreditsRemaining: 12,
        recentTasks: [
          {
            id: "1",
            title: "Review quarterly performance metrics",
            status: "completed",
            priority: "high",
            estimatedMinutes: 60,
            ai_generated: true,
            createdAt: "2025-09-28T09:00:00Z",
          },
          {
            id: "2",
            title: "Call dentist for appointment",
            status: "pending",
            priority: "medium",
            estimatedMinutes: 15,
            ai_generated: false,
            createdAt: "2025-09-28T08:30:00Z",
          },
          {
            id: "3",
            title: "Prepare presentation slides",
            status: "in_progress",
            priority: "high",
            estimatedMinutes: 120,
            ai_generated: true,
            createdAt: "2025-09-27T16:00:00Z",
          },
        ],
      });
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickTaskCreate = async () => {
    if (!quickTaskInput.trim()) return;

    setIsCreatingTask(true);
    try {
      if (useAI && user && user.ai_usage_count < AI_QUOTAS[user.tier]) {
        // AI-powered task creation
        const response = await fetch("/api/tasks/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userInput: quickTaskInput }),
        });

        if (response.ok) {
          const { suggestedTasks } = await response.json();
          // Redirect to task creation page with suggestions
          router.push(
            `/tasks/create?suggestions=${encodeURIComponent(
              JSON.stringify(suggestedTasks)
            )}`
          );
        }
      } else {
        // Manual task creation
        const response = await fetch("/api/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: quickTaskInput,
            priority: "medium",
            estimatedMinutes: 30,
          }),
        });

        if (response.ok) {
          setQuickTaskInput("");
          loadDashboardData(); // Refresh data
        }
      }
    } catch (error) {
      console.error("Failed to create task:", error);
    } finally {
      setIsCreatingTask(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-600 bg-red-50";
      case "medium":
        return "text-yellow-600 bg-yellow-50";
      case "low":
        return "text-green-600 bg-green-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600 bg-green-50";
      case "in_progress":
        return "text-blue-600 bg-blue-50";
      case "pending":
        return "text-gray-600 bg-gray-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user || !stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Failed to load dashboard
          </h2>
          <button
            onClick={loadDashboardData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">TaskBounty</h1>
            </div>
            <nav className="flex items-center space-x-8">
              <Link href="/dashboard" className="text-blue-600 font-medium">
                Dashboard
              </Link>
              <Link href="/tasks" className="text-gray-600 hover:text-gray-900">
                Tasks
              </Link>
              <Link
                href="/leaderboard"
                className="text-gray-600 hover:text-gray-900"
              >
                Leaderboard
              </Link>
              <Link
                href="/profile"
                className="text-gray-600 hover:text-gray-900"
              >
                Profile
              </Link>

              {/* User Menu */}
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">{user?.email}</span>
                <button
                  onClick={handleSignOut}
                  disabled={signingOut}
                  className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                >
                  {signingOut ? "Signing out..." : "Sign Out"}
                </button>
              </div>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user.email.split("@")[0]}! 🎯
          </h2>
          <p className="text-gray-600">
            Ready to tackle your tasks? You're on a {stats.currentStreak}-day
            streak!
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-2xl">⚡</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Points
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalPoints.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <span className="text-2xl">🔥</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Current Streak
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.currentStreak} days
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-2xl">✅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Today's Progress
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.completedToday}/{stats.todayTasks}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <span className="text-2xl">🤖</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">AI Credits</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.aiCreditsRemaining}
                </p>
                <p className="text-xs text-gray-500">
                  of {AI_QUOTAS[user.tier]} this month
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Task Creation */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Add Task
          </h3>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={quickTaskInput}
                onChange={(e) => setQuickTaskInput(e.target.value)}
                placeholder={
                  useAI
                    ? "Describe what you need to do (e.g., 'prepare for interview')"
                    : "Enter task title"
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={(e) => e.key === "Enter" && handleQuickTaskCreate()}
              />
            </div>
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={useAI}
                  onChange={(e) => setUseAI(e.target.checked)}
                  disabled={user.ai_usage_count >= AI_QUOTAS[user.tier]}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Use AI 🤖</span>
              </label>
              <button
                onClick={handleQuickTaskCreate}
                disabled={isCreatingTask || !quickTaskInput.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreatingTask
                  ? "Creating..."
                  : useAI
                  ? "Generate"
                  : "Add Task"}
              </button>
            </div>
          </div>
          {useAI && user.ai_usage_count >= AI_QUOTAS[user.tier] && (
            <p className="text-sm text-red-600 mt-2">
              AI quota exceeded.{" "}
              <Link href="/profile" className="underline">
                Upgrade for more credits
              </Link>
            </p>
          )}
        </div>

        {/* Recent Tasks */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                Recent Tasks
              </h3>
              <Link
                href="/tasks"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                View all →
              </Link>
            </div>
          </div>
          <div className="p-6">
            {stats.recentTasks.length === 0 ? (
              <div className="text-center py-8">
                <span className="text-4xl mb-4 block">📝</span>
                <p className="text-gray-600 mb-4">
                  No tasks yet! Create your first task above.
                </p>
                <Link
                  href="/tasks/create"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create Task
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {stats.recentTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          task.status
                        )}`}
                      >
                        {task.status.replace("_", " ")}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {task.title}
                        </h4>
                        <div className="flex items-center space-x-3 text-sm text-gray-500">
                          <span>{task.estimatedMinutes} min</span>
                          <span
                            className={`px-2 py-0.5 rounded text-xs ${getPriorityColor(
                              task.priority
                            )}`}
                          >
                            {task.priority}
                          </span>
                          {task.ai_generated && (
                            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">
                              🤖 AI
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Link
                      href={`/tasks/${task.id}`}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      View
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
