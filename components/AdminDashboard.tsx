import React, { useState, useEffect } from 'react';
import { TFunction } from '../types';
import { ChartBarIcon, UsersIcon, BellIcon, CogIcon, ShieldCheckIcon, ExclamationTriangleIcon } from './Icons';
import ResponsiveCard from './ResponsiveCard';
import ResponsiveGrid from './ResponsiveGrid';

interface AdminDashboardProps {
  t: TFunction;
}

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalDiagnoses: number;
  systemHealth: 'good' | 'warning' | 'critical';
  notifications: number;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ t }) => {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalDiagnoses: 0,
    systemHealth: 'good',
    notifications: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading admin stats
    const loadStats = async () => {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setStats({
        totalUsers: 1247,
        activeUsers: 89,
        totalDiagnoses: 3456,
        systemHealth: 'good',
        notifications: 12
      });
      setLoading(false);
    };

    loadStats();
  }, []);

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
    trend?: string;
  }> = ({ title, value, icon, color, trend }) => (
    <ResponsiveCard className={`${color} text-white`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/80 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          {trend && <p className="text-white/80 text-xs mt-1">{trend}</p>}
        </div>
        <div className="text-white/80">
          {icon}
        </div>
      </div>
    </ResponsiveCard>
  );

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'good': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'good': return <ShieldCheckIcon className="w-5 h-5" />;
      case 'warning': return <ExclamationTriangleIcon className="w-5 h-5" />;
      case 'critical': return <ExclamationTriangleIcon className="w-5 h-5" />;
      default: return <CogIcon className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
        <div className={`flex items-center gap-2 ${getHealthColor(stats.systemHealth)}`}>
          {getHealthIcon(stats.systemHealth)}
          <span className="font-medium capitalize">{stats.systemHealth}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <ResponsiveGrid columns={{ sm: 1, md: 2, lg: 4 }} gap={6}>
        <StatCard
          title="Total Users"
          value={stats.totalUsers.toLocaleString()}
          icon={<UsersIcon className="w-8 h-8" />}
          color="bg-gradient-to-r from-blue-500 to-blue-600"
          trend="+12% from last month"
        />
        <StatCard
          title="Active Users"
          value={stats.activeUsers}
          icon={<UsersIcon className="w-8 h-8" />}
          color="bg-gradient-to-r from-green-500 to-green-600"
          trend="Currently online"
        />
        <StatCard
          title="Total Diagnoses"
          value={stats.totalDiagnoses.toLocaleString()}
          icon={<ChartBarIcon className="w-8 h-8" />}
          color="bg-gradient-to-r from-purple-500 to-purple-600"
          trend="+8% from last week"
        />
        <StatCard
          title="Notifications"
          value={stats.notifications}
          icon={<BellIcon className="w-8 h-8" />}
          color="bg-gradient-to-r from-orange-500 to-orange-600"
          trend="Pending review"
        />
      </ResponsiveGrid>

      {/* Admin Actions */}
      <ResponsiveGrid columns={{ sm: 1, md: 2 }} gap={6}>
        <ResponsiveCard title="User Management">
          <div className="space-y-4">
            <button className="w-full p-3 text-left bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
              <div className="font-medium text-gray-900 dark:text-white">View All Users</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Manage user accounts and permissions</div>
            </button>
            <button className="w-full p-3 text-left bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
              <div className="font-medium text-gray-900 dark:text-white">User Analytics</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">View user engagement metrics</div>
            </button>
            <button className="w-full p-3 text-left bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
              <div className="font-medium text-gray-900 dark:text-white">Export Data</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Download user and usage reports</div>
            </button>
          </div>
        </ResponsiveCard>

        <ResponsiveCard title="System Management">
          <div className="space-y-4">
            <button className="w-full p-3 text-left bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
              <div className="font-medium text-gray-900 dark:text-white">System Health</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Monitor system performance</div>
            </button>
            <button className="w-full p-3 text-left bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
              <div className="font-medium text-gray-900 dark:text-white">API Usage</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Track API calls and limits</div>
            </button>
            <button className="w-full p-3 text-left bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
              <div className="font-medium text-gray-900 dark:text-white">Cache Management</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Clear and manage cache</div>
            </button>
          </div>
        </ResponsiveCard>
      </ResponsiveGrid>

      {/* Recent Activity */}
      <ResponsiveCard title="Recent Activity">
        <div className="space-y-3">
          {[
            { action: 'New user registration', user: 'farmer@example.com', time: '2 minutes ago' },
            { action: 'Crop diagnosis completed', user: 'user123', time: '5 minutes ago' },
            { action: 'System backup completed', user: 'System', time: '1 hour ago' },
            { action: 'Weather data updated', user: 'System', time: '2 hours ago' },
          ].map((activity, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <div className="font-medium text-gray-900 dark:text-white">{activity.action}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{activity.user}</div>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{activity.time}</div>
            </div>
          ))}
        </div>
      </ResponsiveCard>
    </div>
  );
};

export default AdminDashboard;