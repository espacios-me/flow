export type AtomSource = "gmail" | "google_drive" | "linear" | "workflow" | "botspace";

export interface AtomEvent {
  id: string;
  userId: string;
  source: AtomSource;
  sourceEventId: string;
  occurredAt: string;
  ingestedAt: string;
  title: string;
  body: string;
  participants: string[];
  metadata: Record<string, unknown>;
  dedupeKey: string;
}

export interface NormalizedIngestionResult {
  event: AtomEvent;
  wasDuplicate: boolean;
}
