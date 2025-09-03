import { QueryRequest, QueryResponse, Conversation, Message, WexaExecuteFlowRequest, WexaExecuteFlowResponse } from '../types';

const WEXA_API_BASE_URL = process.env.REACT_APP_WEXA_API_BASE_URL || 'https://api.wexa.ai';
const WEXA_API_KEY = process.env.REACT_APP_WEXA_API_KEY || '94153bc4-224f-49a6-9af7-2d5394059cca';
const WEXA_PROJECT_ID = process.env.REACT_APP_WEXA_PROJECT_ID || '68b6dc5d139ecd7045afa6b6';
const WEXA_PROCESS_FLOW_ID = process.env.REACT_APP_WEXA_PROCESS_FLOW_ID || '68b6dc89625644b8e9361e55';

class ApiService {
  private async wexaRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${WEXA_API_BASE_URL}${endpoint}`;
    
    const headers = {
      'Content-Type': 'application/json',
      'x-api-key': WEXA_API_KEY,
      ...options.headers,
    };

    // Default to GET method if not specified
    const method = options.method || 'GET';

    console.log('Making Wexa API request:', { url, method, headers });

    const response = await fetch(url, {
      ...options,
      method,
      headers,
    });

    console.log('Wexa API response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Wexa API error response:', errorText);
      throw new Error(`Wexa API error: status ${response.status} - ${errorText}`);
    }

    const responseData = await response.json();
    console.log('Wexa API response data:', responseData);
    return responseData;
  }

  async sendQuery(queryRequest: QueryRequest): Promise<QueryResponse> {
    try {
      console.log('Starting Wexa API request with credentials (v2):', {
        projectID: WEXA_PROJECT_ID,
        processFlowID: WEXA_PROCESS_FLOW_ID,
        apiBaseUrl: WEXA_API_BASE_URL,
        apiKeyFromEnv: process.env.REACT_APP_WEXA_API_KEY,
        apiKeyUsed: WEXA_API_KEY
      });

      console.log('Sending Wexa request with URL params - query:', queryRequest.query, 'projectID:', WEXA_PROJECT_ID);

      const wexaResponse = await this.wexaRequest<WexaExecuteFlowResponse>(
        `/execute_flow?query=${encodeURIComponent(queryRequest.query)}&projectID=${WEXA_PROJECT_ID}`,
        {
          method: 'POST',
          body: JSON.stringify({
            agentflow_id: WEXA_PROCESS_FLOW_ID,
            executed_by: '670cbc86906f68d0ec2970a9',
            goal: `User Query : ${queryRequest.query}`,
            input_variables: {}
          }),
        }
      );

      console.log('Received Wexa response:', wexaResponse);

      // Poll for execution completion and get results
      const executionResult = await this.pollExecutionResult(wexaResponse.execution_id);

      // Transform Wexa response to our expected format
      return this.transformWexaResponse(executionResult, queryRequest.query);
    } catch (error) {
      console.error('Error executing Wexa co-worker:', error);
      
      // More detailed error message
      let errorMessage = `I encountered an issue while processing your query: "${queryRequest.query}".`;
      
      if (error instanceof Error) {
        if (error.message.includes('404')) {
          errorMessage += ' The API endpoint was not found. Please check the process flow ID.';
        } else if (error.message.includes('401') || error.message.includes('403')) {
          errorMessage += ' Authentication failed. Please check the API key.';
        } else if (error.message.includes('timeout')) {
          errorMessage += ' The request timed out. The co-worker may be taking longer than expected.';
        } else {
          errorMessage += ` Error: ${error.message}`;
        }
      }
      
      return {
        answer: errorMessage,
        sources: [],
      };
    }
  }

  private async pollExecutionResult(executionId: string): Promise<any> {
    let attempt = 0;
    
    while (true) {
      attempt++;
      try {
        // Use the correct Wexa API endpoint for getting execution details
        const result = await this.wexaRequest<any>(
          `/execute_flow/${executionId}?projectID=${WEXA_PROJECT_ID}`
        );

        console.log(`Polling attempt ${attempt}: Status = ${result.status}`, result);

        if (result.status === 'completed' || result.status === 'finished') {
          return result;
        }

        if (result.status === 'failed' || result.status === 'error') {
          throw new Error(`Execution failed: ${result.error || 'Unknown error'}`);
        }

        // Wait 5 seconds before next poll
        await new Promise(resolve => setTimeout(resolve, 5000));
      } catch (error) {
        console.error(`Polling attempt ${attempt} failed:`, error);
        
        // If it's a network error, wait and retry
        if (error instanceof Error && (error.message.includes('fetch') || error.message.includes('network'))) {
          console.log('Network error, retrying in 5 seconds...');
          await new Promise(resolve => setTimeout(resolve, 5000));
          continue;
        }
        
        // For other errors, throw immediately
        throw error;
      }
    }
  }

  async getExecutionDetails(executionId: string): Promise<any> {
    return this.wexaRequest<any>(
      `/execute_flow/${executionId}?projectID=${WEXA_PROJECT_ID}`,
      {
        method: 'GET'
      }
    );
  }

  private transformWexaResponse(executionResult: any, originalQuery: string): QueryResponse {
    let answer = 'I processed your query but did not receive a clear response.';
    let sources: any[] = [];

    console.log('Transforming Wexa response:', JSON.stringify(executionResult, null, 2));

    // Extract answer from conclusion field
    if (executionResult.conclusion && executionResult.conclusion.conclusion) {
      console.log('Found conclusion.conclusion:', executionResult.conclusion.conclusion);
      answer = String(executionResult.conclusion.conclusion);
    } else if (executionResult.conclusion) {
      console.log('Found conclusion:', executionResult.conclusion);
      answer = String(executionResult.conclusion);
    } else if (executionResult.agents_output && executionResult.agents_output.length > 0) {
      console.log('Processing agents_output:', executionResult.agents_output);
      
      // Try to find the actual response content
      for (let i = executionResult.agents_output.length - 1; i >= 0; i--) {
        const output = executionResult.agents_output[i];
        console.log(`Checking output ${i}:`, output);
        
        // Check various possible response fields
        const possibleAnswers = [
          output.output,
          output.response, 
          output.content,
          output.result,
          output.text,
          output.message,
          output.data,
          output.value
        ];
        
        for (const possibleAnswer of possibleAnswers) {
          if (possibleAnswer !== undefined && possibleAnswer !== null) {
            console.log('Found potential answer:', possibleAnswer);
            
            if (typeof possibleAnswer === 'string' && possibleAnswer.trim() !== '') {
              answer = possibleAnswer;
              break;
            } else if (typeof possibleAnswer === 'object') {
              // Recursively check object properties
              const objectStr = JSON.stringify(possibleAnswer, null, 2);
              if (objectStr !== '{}' && objectStr !== 'null') {
                answer = objectStr;
                break;
              }
            }
          }
        }
        
        if (answer !== 'I processed your query but did not receive a clear response.') {
          break;
        }
      }
    }

    // Ensure answer is always a string and not [object Object]
    if (typeof answer !== 'string' || answer === '[object Object]') {
      console.warn('Invalid answer format detected, converting:', answer);
      answer = typeof answer === 'object' ? JSON.stringify(answer, null, 2) : String(answer);
    }

    // Extract sources if available in the execution result
    if (executionResult.sources && Array.isArray(executionResult.sources)) {
      sources = executionResult.sources;
    } else if (executionResult.agents_output && Array.isArray(executionResult.agents_output)) {
      // Try to extract sources from agent outputs
      sources = executionResult.agents_output
        .filter((output: any) => output.sources || output.documents)
        .flatMap((output: any) => output.sources || output.documents || []);
    }

    return {
      answer,
      sources: sources.map((source: any, index: number) => ({
        document_id: source.document_id || source.id || `doc_${index}`,
        relevance_score: source.relevance_score || source.score || 0.8,
        content: source.content || source.text || source.summary || '',
        metadata: source.metadata || { type: 'knowledge_base' },
      })),
    };
  }

  async getConversations(userId: string): Promise<Conversation[]> {
    // For now, return empty array as conversations are managed locally
    // In future, this could integrate with Wexa's conversation storage
    return [];
  }

  async getConversation(conversationId: string): Promise<Conversation> {
    // For now, throw error as conversations are managed locally
    throw new Error('Conversation not found - using local storage');
  }

  async createConversation(userId: string, title: string): Promise<Conversation> {
    // For now, conversations are created locally in the hook
    throw new Error('Conversations are managed locally');
  }

  async saveMessage(conversationId: string, message: Message): Promise<void> {
    // For now, messages are saved locally in the hook
    // In future, this could integrate with Wexa's conversation storage
    return;
  }
}

export const apiService = new ApiService();
