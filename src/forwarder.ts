import type { AtomSource } from "./atom-types";

interface WorkflowResponse {
  // Define the structure of your incoming workflow response here
  // Example fields:
  id: string;
  timestamp: string;
  message: string;
  sender?: string;
  subject?: string;
  details?: Record<string, unknown>;
}

interface AtomIngestionPayload {
  userId: string;
  sourceEventId: string;
  occurredAt: string;
  title: string;
  body: string;
  participants: string[];
  metadata: Record<string, unknown>;
}

/**
 * Forwards a workflow response to the Atom dashboard ingestion endpoint.
 * @param source The source of the event (e.g., "workflow", "custom-app").
 * @param workflowResponse The response object from your workflow.
 * @param atomWebhookUrl The URL of the Atom ingestion endpoint (e.g., "https://flow.espacios.me/api/ingest/workflow").
 * @param atomWebhookApiKey The API key for authenticating with the Atom ingestion endpoint.
 */
export async function forwardToAtomDashboard(
  source: AtomSource,
  workflowResponse: WorkflowResponse,
  atomWebhookUrl: string,
  atomWebhookApiKey: string
): Promise<Response> {
  const payload: AtomIngestionPayload = {
    userId: workflowResponse.sender || "unknown-user", // Customize based on your workflow response
    sourceEventId: workflowResponse.id,
    occurredAt: workflowResponse.timestamp,
    title: workflowResponse.subject || `New message from ${workflowResponse.sender || 'workflow'}`, // Customize title
    body: workflowResponse.message,
    participants: workflowResponse.sender ? [workflowResponse.sender] : [],
    metadata: workflowResponse.details || {},
  };

  try {
    const response = await fetch(`${atomWebhookUrl}/${source}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": atomWebhookApiKey,
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to forward to Atom dashboard: ${response.status} - ${errorText}`);
      throw new Error(`API call failed with status ${response.status}`);
    }

    console.log(`Successfully forwarded event from ${source} to Atom dashboard.`);
    return response;
  } catch (error) {
    console.error("Error forwarding to Atom dashboard:", error);
    throw error;
  }
}
