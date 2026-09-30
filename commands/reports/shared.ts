import { writeFileSync } from 'node:fs';
import chalk from 'chalk';
import apiClient from '../../lib/api.ts';
import config from '../../lib/config.js';
import { format } from 'date-fns';

interface FetchPaginatedOptions {
  endpointUrl: string;
  initialParams: Record<string, any>;
  dedupFn?: (record: any, allRecords: any[]) => boolean;
  outputFilename: string;
  formatFn?: (record: any) => Record<string, any>;
}

export async function fetchPaginated(
  options: FetchPaginatedOptions,
): Promise<any[]> {
  const { endpointUrl, initialParams, dedupFn, outputFilename, formatFn } = options;

  const workspaceId = config.get('GsWorkspaceId');
  const pageSize = 2000;

  let currentPage = 1;
  let lastPage = false;
  const allRecords: any[] = [];
  let totalAnomalyCount = 0;

  console.log(chalk.blue(`Fetching all data for workspace ${workspaceId}`));

  const response = await apiClient.get(endpointUrl, {
    params: { ...initialParams, pageSize },
  }).catch((error: any) => {
    console.error(chalk.red(`Error fetching from ${endpointUrl}:`, error.message));
    process.exit(1);
  });

  const GsCursor = response.headers['x-gs-cursor'] || response.headers['X-GS-CURSOR'];
  allRecords.push(...response.data);

  console.log(`(first) Received ${response.data.length} records. Total: ${allRecords.length}. X-GS-CURSOR: ${GsCursor ?? '(none)'}`);

  if (GsCursor) currentPage++;
  else lastPage = true;

  while (!lastPage) {
    console.log(chalk.blue(`Fetching page ${currentPage} of ${outputFilename.split('-')[0]}...`));

    const pageResponse = await apiClient.get(endpointUrl, {
      params: { ...initialParams, pageSize, after: GsCursor },
    }).catch((error: any) => {
      console.error(chalk.red(`Error fetching page ${currentPage} of ${outputFilename}:`, error.message));
      process.exit(1);
    });

    const allRecordsCountBefore = allRecords.length;
    const newRecords = pageResponse.data.filter((record: any) => {
      if (dedupFn) return dedupFn(record, allRecords);
      return true;
    });

    allRecords.push(...newRecords);

    const newGsCursor = pageResponse.headers['x-gs-cursor'] || pageResponse.headers['X-GS-CURSOR'];

    console.log(`${currentPage}: Received ${pageResponse.data.length} records. Total: ${allRecords.length}. X-GS-CURSOR: ${newGsCursor ?? '(none)'}`);

    const allRecordsCountAfter = allRecords.length;
    writeFileSync(outputFilename, JSON.stringify(allRecords, null, 2));

    if (allRecordsCountBefore === allRecordsCountAfter && newGsCursor) {
      totalAnomalyCount++;
      console.log(chalk.yellow(`⚠️  Warning: No new records found on page ${currentPage}, possible duplicate page.`));
      if (totalAnomalyCount > 2) break;
    }

    if (!newGsCursor) {
      lastPage = true;
    } else {
      currentPage++;
    }
  }

  return allRecords;
}

function writeReportOutput(allRecords: any[], outputFilename: string, formatFn?: (record: any) => Record<string, any>): void {
  if (formatFn) {
    const formattedData = allRecords.map(formatFn);
    console.table(formattedData);
    console.log(chalk.green(`✅ Successfully retrieved data in table format.`));
  } else {
    writeFileSync(outputFilename, JSON.stringify(allRecords, null, 2));
    console.log(chalk.green(`✅ Successfully wrote data to file: ${outputFilename}`));
  }
}
