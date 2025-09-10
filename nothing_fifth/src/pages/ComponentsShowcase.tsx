import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { EASINGS } from '@/theme/animations';
import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';
import { GlassCard } from '@/shared/components/GlassCard';
import { GradientBackground } from '@/shared/components/GradientBackground';
import { Input } from '@/shared/components/Input';
import { Modal } from '@/shared/components/Modal';
import { NavBar } from '@/shared/components/NavBar';
import { Avatar } from '@/shared/components/Avatar';
import { Sidebar } from '@/shared/components/Sidebar';
import { Skeleton } from '@/shared/components/Skeleton';
import { Spinner } from '@/shared/components/Spinner';
import { Toast, ToastContainer } from '@/shared/components/Toast';
import { Tooltip } from '@/shared/components/Tooltip';
import { BarChart } from '@/shared/charts/BarChart';
import { LineChart } from '@/shared/charts/LineChart';
import { useModal } from '@/hooks/useModal';
import { FaHome, FaCog, FaUser, FaChartBar, FaCheck, FaExclamation, FaInfo } from 'react-icons/fa';

export const ComponentsShowcase: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');
  const { openModal } = useModal();

  const barChartData = [
    { name: 'January', value: 400 },
    { name: 'February', value: 300 },
    { name: 'March', value: 500 },
    { name: 'April', value: 280 },
    { name: 'May', value: 590 },
    { name: 'June', value: 320 },
  ];

  const lineChartData = [
    { x: 0, y: 10 },
    { x: 1, y: 35 },
    { x: 2, y: 20 },
    { x: 3, y: 45 },
    { x: 4, y: 30 },
    { x: 5, y: 55 },
    { x: 6, y: 40 },
  ];

  const showDemoModal = () => {
    openModal(
      <div>
        <h2 className="text-xl font-semibold mb-4">Demo Modal</h2>
        <div className="space-y-4">
          <p>This is a demonstration of the Modal component.</p>
          <p>It supports custom content and actions.</p>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            onClick={() => console.log('Cancel clicked')}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            onClick={() => console.log('Confirm clicked')}
          >
            Confirm
          </button>
        </div>
      </div>,
      { title: 'Demo Modal', size: 'md' }
    );
  };

  const showDemoToast = (type: 'success' | 'error' | 'info') => {
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: EASINGS.smooth,
      },
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <GradientBackground />
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Components Showcase
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            A comprehensive display of all available components in the application
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-12"
        >
          {/* Buttons Section */}
          <motion.section variants={itemVariants}>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Buttons
            </h2>
            <div className="flex flex-wrap gap-4">
              <Button variant="primary" size="sm">Small Primary</Button>
              <Button variant="primary" size="md">Medium Primary</Button>
              <Button variant="primary" size="lg">Large Primary</Button>
              <Button variant="secondary" size="md">Secondary</Button>
              <Button variant="ghost" size="md">Ghost</Button>
              <Button variant="danger" size="md">Danger</Button>
              <Button variant="primary" size="md" disabled>Disabled</Button>
              <Button variant="primary" size="md" isLoading>Loading</Button>
            </div>
          </motion.section>

          {/* Cards Section */}
          <motion.section variants={itemVariants}>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Cards
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-2">Regular Card</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  This is a standard card component with padding and shadow.
                </p>
              </Card>
              
              <GlassCard className="p-6">
                <h3 className="text-lg font-semibold mb-2">Glass Card</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  A glassmorphism styled card with blur effect.
                </p>
              </GlassCard>

              <Card className="p-6" interactive>
                <h3 className="text-lg font-semibold mb-2">Hoverable Card</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  This card has hover effects enabled.
                </p>
              </Card>
            </div>
          </motion.section>

          {/* Input Section */}
          <motion.section variants={itemVariants}>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Inputs
            </h2>
            <div className="max-w-md space-y-4">
              <Input
                label="Text Input"
                placeholder="Enter some text..."
                value={inputValue}
                onChange={(value) => setInputValue(value)}
              />
              <Input
                label="Email Input"
                type="email"
                placeholder="your@email.com"
              />
              <Input
                label="Password Input"
                type="password"
                placeholder="Enter password..."
              />
              <Input
                label="Disabled Input"
                placeholder="This is disabled"
                disabled
              />
              <Input
                label="Input with Error"
                placeholder="Invalid input"
                error="This field has an error"
              />
            </div>
          </motion.section>

          {/* Avatar Section */}
          <motion.section variants={itemVariants}>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Avatars
            </h2>
            <div className="flex items-center gap-4">
              <Avatar size="sm" src="https://i.pravatar.cc/150?img=1" alt="User 1" />
              <Avatar size="md" src="https://i.pravatar.cc/150?img=2" alt="User 2" />
              <Avatar size="lg" src="https://i.pravatar.cc/150?img=3" alt="User 3" />
              <Avatar size="xl" src="https://i.pravatar.cc/150?img=4" alt="User 4" />
              <Avatar size="md" name="John Doe" />
              <Avatar size="md" name="Alice Brown" status="online" />
              <Avatar size="md" name="Charlie Davis" status="offline" />
            </div>
          </motion.section>

          {/* Spinners and Skeletons Section */}
          <motion.section variants={itemVariants}>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Loading States
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-3">Spinners</h3>
                <div className="flex items-center gap-4">
                  <Spinner size="sm" />
                  <Spinner size="md" />
                  <Spinner size="lg" />
                  <Spinner size="md" variant="primary" />
                  <Spinner size="md" variant="secondary" />
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-3">Skeletons</h3>
                <div className="space-y-3 max-w-md">
                  <Skeleton variant="text" width="100%" height="20px" />
                  <Skeleton variant="text" width="80%" height="20px" />
                  <Skeleton variant="rounded" width="100%" height="100px" />
                  <div className="flex gap-2">
                    <Skeleton variant="circular" width="40px" height="40px" />
                    <div className="flex-1 space-y-2">
                      <Skeleton variant="text" width="60%" height="16px" />
                      <Skeleton variant="text" width="100%" height="16px" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Modals and Toasts Section */}
          <motion.section variants={itemVariants}>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Modals & Toasts
            </h2>
            <div className="space-y-4">
              <div className="flex gap-4">
                <Button onClick={showDemoModal}>Open Modal</Button>
                <Button onClick={() => showDemoToast('success')} variant="secondary">
                  Show Success Toast
                </Button>
                <Button onClick={() => showDemoToast('error')} variant="danger">
                  Show Error Toast
                </Button>
                <Button onClick={() => showDemoToast('info')} variant="ghost">
                  Show Info Toast
                </Button>
              </div>
            </div>
          </motion.section>

          {/* Tooltips Section */}
          <motion.section variants={itemVariants}>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Tooltips
            </h2>
            <div className="flex gap-4">
              <Tooltip content="This is a top tooltip" placement="top">
                <Button variant="ghost">Hover me (Top)</Button>
              </Tooltip>
              <Tooltip content="This is a bottom tooltip" placement="bottom">
                <Button variant="ghost">Hover me (Bottom)</Button>
              </Tooltip>
              <Tooltip content="This is a left tooltip" placement="left">
                <Button variant="ghost">Hover me (Left)</Button>
              </Tooltip>
              <Tooltip content="This is a right tooltip" placement="right">
                <Button variant="ghost">Hover me (Right)</Button>
              </Tooltip>
            </div>
          </motion.section>

          {/* Charts Section */}
          <motion.section variants={itemVariants}>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Charts
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Bar Chart</h3>
                <BarChart
                  data={barChartData}
                  width={400}
                  height={250}
                  showGrid
                />
              </Card>
              
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Line Chart</h3>
                <LineChart
                  series={[
                    {
                      id: 'data-series',
                      name: 'Sample Data',
                      points: lineChartData,
                    },
                  ]}
                  height={250}
                  showGrid
                />
              </Card>
            </div>
          </motion.section>

          {/* Navigation Components */}
          <motion.section variants={itemVariants}>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Navigation Components
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-3">NavBar Preview</h3>
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  <NavBar />
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-3">Sidebar Preview</h3>
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden h-96 relative">
                  <Sidebar />
                </div>
              </div>
            </div>
          </motion.section>

          {/* Color Palette */}
          <motion.section variants={itemVariants}>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Color Palette
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-3">Primary Colors</h3>
                <div className="flex gap-2">
                  {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((shade) => (
                    <div
                      key={shade}
                      className={`w-16 h-16 rounded bg-blue-${shade} flex items-center justify-center`}
                      title={`Blue ${shade}`}
                    >
                      <span className={`text-xs ${shade >= 500 ? 'text-white' : 'text-gray-900'}`}>
                        {shade}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.section>
        </motion.div>
      </div>

      {/* Toast Container */}
      {showToast && (
        <ToastContainer
          position="top-right"
          toasts={[
            {
              id: 'demo-toast',
              type: toastType,
              message: `This is a ${toastType} toast message!`,
            },
          ]}
          onRemove={() => setShowToast(false)}
        />
      )}
    </div>
  );
};

export default ComponentsShowcase;