export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  sources?: DocumentSource[];
}

export interface DocumentSource {
  document_id: string;
  relevance_score: number;
  content: string;
  metadata: {
    year?: string;
    type?: string;
    [key: string]: any;
  };
}

export interface QueryRequest {
  user_id: string;
  session_id: string;
  query: string;
}

export interface QueryResponse {
  answer: string;
  sources: DocumentSource[];
}

export interface WexaExecuteFlowRequest {
  agentflow_id: string;
  executed_by: string;
  goal: string;
  input_variables: {};
}

export interface WexaExecuteFlowResponse {
  execution_id: string;
  status: string;
  agentflow_id: string;
  task_id: string;
  agents_output: any[];
  conclusion: string | null;
  created_at: number;
  end_time: number | null;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  created_at: Date;
  updated_at: Date;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  avatar?: string;
}
