import { addDataPoint } from './data';

/**
 * 初期データを投入
 * 2024-11-12 のデータ
 */
export async function seedInitialData(): Promise<void> {
  const date = '2024-11-12';

  const initialData = [
    { metricId: 'x-follow', value: 43, note: '初期データ' },
    { metricId: 'x-follower', value: 1, note: '初期データ' },
    { metricId: 'x-total-posts', value: 2, note: '初期データ' },
    { metricId: 'x-sent-dms', value: 0, note: '初期データ' },
    { metricId: 'illusupi-users', value: 0, note: '初期データ' },
    { metricId: 'illusupi-posts', value: 0, note: '初期データ' },
  ];

  console.log('初期データを投入中...');

  for (const data of initialData) {
    try {
      await addDataPoint(data.metricId, date, data.value, data.note);
      console.log(`✓ ${data.metricId}: ${data.value}`);
    } catch (error) {
      console.error(`✗ ${data.metricId} の投入に失敗:`, error);
    }
  }

  console.log('初期データ投入完了');
}
