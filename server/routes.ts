import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertSavedQuerySchema } from "@shared/schema";
import OpenAI from "openai";

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "DEMO-API-KEY"
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all datasets
  app.get('/api/datasets', async (_req, res) => {
    try {
      const datasets = await storage.getDatasets();
      res.json(datasets);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch datasets' });
    }
  });

  // Get a specific dataset
  app.get('/api/datasets/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid dataset ID' });
      }
      
      const dataset = await storage.getDataset(id);
      if (!dataset) {
        return res.status(404).json({ message: 'Dataset not found' });
      }
      
      res.json(dataset);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch dataset' });
    }
  });

  // Get all saved queries
  app.get('/api/saved-queries', async (_req, res) => {
    try {
      const queries = await storage.getSavedQueries();
      res.json(queries);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch saved queries' });
    }
  });

  // Get a specific saved query
  app.get('/api/saved-queries/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid query ID' });
      }
      
      const query = await storage.getSavedQuery(id);
      if (!query) {
        return res.status(404).json({ message: 'Saved query not found' });
      }
      
      res.json(query);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch saved query' });
    }
  });

  // Create a new saved query
  app.post('/api/saved-queries', async (req, res) => {
    try {
      const validatedData = insertSavedQuerySchema.parse(req.body);
      const newQuery = await storage.createSavedQuery(validatedData);
      res.status(201).json(newQuery);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid query data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to save query' });
    }
  });

  // Get all custom tables
  app.get('/api/custom-tables', async (_req, res) => {
    try {
      const tables = await storage.getCustomTables();
      res.json(tables);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch custom tables' });
    }
  });

  // AI suggestion endpoint
  app.post('/api/ai/suggest', async (req, res) => {
    try {
      const { sql } = req.body;
      
      if (!sql || typeof sql !== 'string') {
        return res.status(400).json({ message: 'SQL query is required' });
      }
      
      // Check if OpenAI API key is available
      if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'DEMO-API-KEY') {
        // Return mock response for demo purposes
        return res.json({
          id: '1',
          message: 'I notice you\'re looking for specific data. Consider these query improvements:',
          suggestions: [
            'Add LIMIT 10 to see only top results',
            'Consider adding ORDER BY to sort your results',
            'You could use column aliases for better readability'
          ]
        });
      }
      
      // If we have a real API key, use OpenAI
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are a SQL expert assistant. Analyze the SQL query and provide 2-3 specific, concise suggestions for improvements or alternatives. Respond with JSON in this format: { 'message': 'brief observation', 'suggestions': ['suggestion1', 'suggestion2', 'suggestion3'] }"
          },
          {
            role: "user",
            content: sql
          }
        ],
        response_format: { type: "json_object" }
      });
      
      const result = JSON.parse(response.choices[0].message.content);
      
      res.json({
        id: Date.now().toString(),
        message: result.message,
        suggestions: result.suggestions
      });
    } catch (error) {
      console.error('AI suggestion error:', error);
      res.status(500).json({ message: 'Failed to get AI suggestions' });
    }
  });

  // AI query generation endpoint
  app.post('/api/ai/generate', async (req, res) => {
    try {
      const { description, tables } = req.body;
      
      if (!description || typeof description !== 'string') {
        return res.status(400).json({ message: 'Description is required' });
      }
      
      // Check if OpenAI API key is available
      if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'DEMO-API-KEY') {
        // Return mock response for demo purposes
        return res.json({
          sql: `-- Generated SQL based on your description:\n-- "${description}"\nSELECT * FROM accommodations\nWHERE price_per_night < 100\nORDER BY rating DESC\nLIMIT 5;`
        });
      }
      
      // If we have a real API key, use OpenAI
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: `You are a SQL expert assistant. Generate a SQL query based on the user's description. The available tables are: ${tables?.join(', ') || 'accommodations, amenities, reviews'}. Respond with JSON in this format: { 'sql': 'generated SQL query with comments' }`
          },
          {
            role: "user",
            content: description
          }
        ],
        response_format: { type: "json_object" }
      });
      
      const result = JSON.parse(response.choices[0].message.content);
      
      res.json({
        sql: result.sql
      });
    } catch (error) {
      console.error('AI generation error:', error);
      res.status(500).json({ message: 'Failed to generate SQL query' });
    }
  });

  // AI query explanation endpoint
  app.post('/api/ai/explain', async (req, res) => {
    try {
      const { sql } = req.body;
      
      if (!sql || typeof sql !== 'string') {
        return res.status(400).json({ message: 'SQL query is required' });
      }
      
      // Check if OpenAI API key is available
      if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'DEMO-API-KEY') {
        // Return mock response for demo purposes
        return res.json({
          explanation: "This query selects data from the accommodations table, filters for prices less than $100, and sorts the results by rating in descending order to show the highest-rated options first."
        });
      }
      
      // If we have a real API key, use OpenAI
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are a SQL expert assistant. Explain the given SQL query in simple terms, line by line. Respond with JSON in this format: { 'explanation': 'detailed explanation' }"
          },
          {
            role: "user",
            content: sql
          }
        ],
        response_format: { type: "json_object" }
      });
      
      const result = JSON.parse(response.choices[0].message.content);
      
      res.json({
        explanation: result.explanation
      });
    } catch (error) {
      console.error('AI explanation error:', error);
      res.status(500).json({ message: 'Failed to explain SQL query' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
