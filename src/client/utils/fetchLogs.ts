import {paths} from '@/common/app/paths';
import {LogMessage} from '@/common/logs/LogMessage';
import {ParticipantId} from '@/common/Types';

let abortController: AbortController | undefined;

export type FetchLogsOptions = {
  generation?: number;
  limit?: number;
};

export async function fetchLogs(id: ParticipantId, options: FetchLogsOptions): Promise<Array<LogMessage> | undefined> {
  // Aborts any pending request for a previous generation before starting the new one.
  // If the past call is complete, .abort() does nothing.
  abortController?.abort();
  abortController = new AbortController();

  const params = new URLSearchParams({id});
  if (options.generation !== undefined) {
    params.set('generation', options.generation.toString());
  }
  if (options.limit !== undefined) {
    params.set('limit', options.limit.toString());
  }
  const url = `${paths.API_GAME_LOGS}?${params.toString()}`;

  try {
    const resp = await fetch(url, {signal: abortController.signal});
    if (!resp.ok) {
      console.error(`error updating messages, response code ${resp.status}`);
      return undefined;
    }
    return await resp.json();
  } catch (err: any) {
    if (err.name === 'AbortError') {
      // ignore aborted requests
      return undefined;
    }
    console.error('error updating messages, unable to reach server');
    return undefined;
  }
}
