'use client';

import React, { useEffect, useState } from 'react';
import WidgetCard from '@/components/cards/widget-card';
import { Title, Text } from '@/components/ui/text';
import { PiSparkleFill, PiWarningCircle } from 'react-icons/pi';
import apiService from '@/utils/apiService';
import { decryptData } from '@/components/encriptdycriptdata';
import { motion } from 'framer-motion';

const CACHE_TTL_MS = 15 * 60 * 1000;
const CACHE_KEY_PREFIX = 'daily-ai-insight';

export default function AISmartInsights({ className }: { className?: string }) {
  const [insight, setInsight] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchInsight = async () => {
      try {
        const encryptedData = localStorage.getItem('uData');
        if (!encryptedData) {
          setLoading(false);
          return;
        }

        const userData: any = decryptData(encryptedData);
        if (!userData || !userData.user) {
          setLoading(false);
          return;
        }

        const cacheKey = `${CACHE_KEY_PREFIX}:${userData.user.id}`;
        const cachedValue = sessionStorage.getItem(cacheKey);
        if (cachedValue) {
          try {
            const cached = JSON.parse(cachedValue) as {
              insight?: string;
              timestamp?: number;
            };
            if (
              cached.timestamp &&
              cached.insight &&
              Date.now() - cached.timestamp < CACHE_TTL_MS
            ) {
              setInsight(cached.insight);
              setLoading(false);
              return;
            }
          } catch {
            sessionStorage.removeItem(cacheKey);
          }
        }

        // Send a silent background prompt to the AI to get a daily summary
        const response = await apiService.post('/ai-chat', {
          message: "Give me a 2-sentence summary of my performance today and suggest what I should focus on. Keep it encouraging but brief. Do not use markdown.",
          userId: userData.user.id,
          userType: userData.user.user_type || userData.user.role,
          name: `${userData.user.first_name} ${userData.user.last_name}`,
          permission: userData.user.permissions?.permission_level || userData.user.permission,
          history: [] // No history needed for the daily summary
        });

        if (response.data && response.data.message) {
          setInsight(response.data.message);
          sessionStorage.setItem(cacheKey, JSON.stringify({
            insight: response.data.message,
            timestamp: Date.now(),
          }));
        } else {
          setError("Could not generate insight at this time.");
        }
      } catch (err: any) {
        const status = err?.response?.status;
        if (status === 401) {
          setError('AI insight needs a fresh login.');
        } else {
          console.error('Error fetching AI insight:', err);
          setError("AI Engine temporarily unavailable.");
        }
      } finally {
        setLoading(false);
      }
    };

    const windowWithIdleCallback = window as unknown as {
      requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
      cancelIdleCallback?: (handle: number) => void;
    };
    const handle = windowWithIdleCallback.requestIdleCallback
      ? windowWithIdleCallback.requestIdleCallback(fetchInsight, { timeout: 2000 })
      : window.setTimeout(fetchInsight, 500);

    return () => {
      if (windowWithIdleCallback.cancelIdleCallback && windowWithIdleCallback.requestIdleCallback) {
        windowWithIdleCallback.cancelIdleCallback(handle);
      } else {
        window.clearTimeout(handle);
      }
    };
  }, []);

  return (
    <WidgetCard
      title=""
      headerClassName="hidden"
      className={`relative overflow-hidden border border-[#c95a64]/20 bg-gradient-to-br from-[#c95a64]/5 to-transparent ${className}`}
    >
      <div className="flex items-start gap-4 p-2">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#c95a64]/10 text-[#c95a64]">
          <PiSparkleFill className="h-6 w-6 animate-pulse" />
        </div>
        <div className="flex-grow">
          <Title as="h4" className="mb-2 text-lg font-semibold text-gray-900">
            Daily AI Insights
          </Title>
          
          {loading ? (
            <div className="space-y-2">
              <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
              <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
            </div>
          ) : error ? (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <PiWarningCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Text className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                {insight}
              </Text>
            </motion.div>
          )}
        </div>
      </div>
    </WidgetCard>
  );
}
