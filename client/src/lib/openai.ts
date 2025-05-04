import { AiSuggestion } from '@shared/schema';

// Request AI suggestions for SQL improvement
export async function getAiSuggestion(sql: string): Promise<AiSuggestion | null> {
  try {
    const response = await fetch('/api/ai/suggest', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sql }),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to get AI suggestions:', error);
    return null;
  }
}

// Request AI to generate a SQL query based on a description
export async function generateSqlFromDescription(description: string, tables: string[]): Promise<string | null> {
  try {
    const response = await fetch('/api/ai/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ description, tables }),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const data = await response.json();
    return data.sql;
  } catch (error) {
    console.error('Failed to generate SQL:', error);
    return null;
  }
}

// Request AI to explain a SQL query
export async function explainSql(sql: string): Promise<string | null> {
  try {
    const response = await fetch('/api/ai/explain', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sql }),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const data = await response.json();
    return data.explanation;
  } catch (error) {
    console.error('Failed to explain SQL:', error);
    return null;
  }
}
