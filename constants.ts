import { PlanConfig, PlanType } from './types';

// Now a function that takes the translator function 't'
export const getPlans = (t: (key: string) => string): Record<PlanType, PlanConfig> => ({
  [PlanType.FREE]: {
    id: PlanType.FREE,
    name: t('plan.free.name'),
    price: '$0',
    generationsLabel: t('plan.free.label'),
    features: [
      t('plan.free.f1'),
      t('plan.free.f2'),
      t('plan.free.f3'),
      t('plan.feature.watermark_yes')
    ],
    canHumanize: false,
    canAccessHistory: false,
    maxDaily: undefined,
    maxMonthly: 3,
    maxPages: 3,
    hasWatermark: true
  },
  [PlanType.PREMIUM]: {
    id: PlanType.PREMIUM,
    name: t('plan.premium.name'),
    price: '$6.99 / mo',
    generationsLabel: t('plan.premium.label'),
    features: [
      t('plan.premium.f1'),
      t('plan.premium.f2'),
      t('plan.feature.editor'),
      t('plan.feature.watermark_no'),
      t('plan.premium.f3'),
      t('plan.premium.f4')
    ],
    canHumanize: true,
    canAccessHistory: true,
    maxMonthly: 50,
    maxPages: 10,
    hasWatermark: false
  },
  [PlanType.PRO]: {
    id: PlanType.PRO,
    name: t('plan.pro.name'),
    price: '$9.99 / mo',
    generationsLabel: t('plan.pro.label'),
    features: [
      t('plan.pro.f1'),
      t('plan.pro.f2'),
      t('plan.feature.editor'),
      t('plan.feature.watermark_no'),
      t('plan.pro.f4'),
      t('plan.pro.f5')
    ],
    canHumanize: true,
    canAccessHistory: true,
    maxMonthly: 100,
    maxPages: 25,
    hasWatermark: false
  }
});

export const MOCK_USER_ID = 'user_12345';