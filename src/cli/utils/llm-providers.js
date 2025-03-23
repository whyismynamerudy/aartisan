/**
 * aartisan - LLM Provider Integrations
 * 
 * Utilities for integrating with LLM providers (Cohere, Gemini)
 * Using only axios to avoid module import issues
 */
import axios from 'axios';
import chalk from 'chalk';

/**
 * Reranks documents using Cohere's API to find relevant context
 * @param {string} query - Query string
 * @param {Array<{filePath: string, content: string}>} documents - Array of documents
 * @param {Object} options - Options including API key
 * @returns {Promise<Array>} Reranked documents
 */
export async function cohereRerank(query, documents, options) {
  console.log(chalk.blue(`[DEBUG] Starting cohereRerank with query: "${query.substring(0, 50)}..."`));
  console.log(chalk.blue(`[DEBUG] Number of documents to rerank: ${documents.length}`));
  
  // Handle empty documents case
  if (!documents || documents.length === 0) {
    console.log(chalk.yellow('[DEBUG] No documents to rerank, returning empty array'));
    return [];
  }
  
  try {
    // Prepare documents for the rerank API
    const documentTexts = documents.map(doc => doc.content);
    console.log(chalk.blue(`[DEBUG] Preparing ${documentTexts.length} documents for reranking`));
    
    // Call Cohere's rerank API - using the latest model and curl pattern
    console.log(chalk.blue('[DEBUG] Calling Cohere rerank API with model: rerank-english-v3.0'));
    console.log(chalk.blue('[DEBUG] API request payload size: ~' + 
      Math.round((JSON.stringify({ query, documents: documentTexts }).length / 1024)) + 'KB'));
    
    const startTime = Date.now();
    const response = await axios({
      method: 'post',
      url: 'https://api.cohere.com/v2/rerank',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'Authorization': `Bearer ${options.apiKey}`
      },
      data: {
        model: 'rerank-english-v3.0',
        query,
        documents: documentTexts,
        top_n: 5, // Get top 5 documents
        max_tokens_per_doc: 4096 // Limit for document length
      },
      timeout: 30000 // 30 second timeout
    });
    
    const duration = Date.now() - startTime;
    console.log(chalk.green(`[DEBUG] Cohere rerank API response received in ${duration}ms`));
    console.log(chalk.green(`[DEBUG] Rerank results count: ${response.data.results.length}`));
    
    // Map results back to our document objects
    const results = response.data.results.map(result => {
      const document = documents[result.index];
      return {
        filePath: document.filePath,
        content: document.content,
        relevance: result.relevance_score
      };
    });
    
    console.log(chalk.green(`[DEBUG] Top document relevance score: ${results[0]?.relevance || 'N/A'}`));
    console.log(chalk.green(`[DEBUG] Last document relevance score: ${results[results.length - 1]?.relevance || 'N/A'}`));
    
    return results;
  } catch (error) {
    console.error(chalk.red(`[ERROR] Cohere rerank API error: ${error.message}`));
    
    if (error.response) {
      console.error(chalk.red(`[ERROR] Status: ${error.response.status}`));
      console.error(chalk.red(`[ERROR] Response data: ${JSON.stringify(error.response.data)}`));
    }
    
    console.log(chalk.yellow('[DEBUG] Falling back to basic filtering'));
    
    // Fallback to basic filtering 
    return documents
      .filter(doc => doc.content.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 3)
      .map(doc => ({
        filePath: doc.filePath,
        content: doc.content,
        relevance: 0.5 // Placeholder score
      }));
  }
}

/**
 * Generate enhanced component using Cohere's Chat API
 * @param {string} prompt - LLM prompt
 * @param {Object} options - Options including API key
 * @returns {Promise<string>} Generated code
 */
export async function cohereGenerate(prompt, options) {
  console.log(chalk.blue(`[DEBUG] Starting cohereGenerate with prompt length: ${prompt.length} characters`));
  console.log(chalk.blue(`[DEBUG] Prompt first 100 chars: "${prompt.substring(0, 100)}..."`));
  
  try {
    console.log(chalk.blue('[DEBUG] Calling Cohere chat API with model: command-r-plus-08-2024'));
    console.log(chalk.blue('[DEBUG] Max tokens: 4096, Temperature: 0.7'));
    
    const startTime = Date.now();
    const response = await axios({
      method: 'post',
      url: 'https://api.cohere.com/v2/chat',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'Authorization': `Bearer ${options.apiKey}`
      },
      data: {
        model: 'command-r-plus-08-2024', // Using the latest model from the docs
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      },
      timeout: 120000 // 2 minute timeout
    });
    
    const duration = Date.now() - startTime;
    console.log(chalk.green(`[DEBUG] Cohere chat API response received in ${duration}ms`));
    
    // Extract the text content from the response
    const messageContent = response.data.text || response.data.message?.content;
    let generatedText = '';
    
    console.log(chalk.blue(`[DEBUG] Response type: ${typeof messageContent}`));
    console.log(chalk.blue(`[DEBUG] Is array: ${Array.isArray(messageContent)}`));
    
    // Handle different response formats
    if (Array.isArray(messageContent)) {
      console.log(chalk.blue(`[DEBUG] Message content has ${messageContent.length} parts`));
      for (const content of messageContent) {
        if (content.type === 'text') {
          generatedText += content.text;
        }
      }
    } else if (typeof messageContent === 'string') {
      generatedText = messageContent;
    } else if (response.data.text) {
      generatedText = response.data.text;
    } else if (response.data.generations && response.data.generations.length > 0) {
      generatedText = response.data.generations[0].text;
    } else {
      // Last resort - try to find text in the response
      console.log(chalk.yellow('[DEBUG] Response format not recognized, trying to extract any text'));
      console.log(chalk.blue(`[DEBUG] Raw response: ${JSON.stringify(response.data).substring(0, 200)}...`));
      
      // Try to extract text from various possible locations in the response
      generatedText = 
        response.data.message?.text || 
        response.data.message || 
        response.data.response || 
        response.data.content || 
        JSON.stringify(response.data);
    }
    
    console.log(chalk.blue(`[DEBUG] Generated text length: ${generatedText.length} characters`));
    
    // Clean up the response to extract only the code
    let extractedCode = generatedText;
    
    if (generatedText.includes('```jsx')) {
      console.log(chalk.blue('[DEBUG] Detected JSX code block'));
      extractedCode = generatedText.split('```jsx')[1].split('```')[0].trim();
    } else if (generatedText.includes('```js')) {
      console.log(chalk.blue('[DEBUG] Detected JS code block'));
      extractedCode = generatedText.split('```js')[1].split('```')[0].trim();
    } else if (generatedText.includes('```')) {
      console.log(chalk.blue('[DEBUG] Detected generic code block'));
      extractedCode = generatedText.split('```')[1].split('```')[0].trim();
    } else {
      console.log(chalk.yellow('[DEBUG] No code block detected, using full response'));
    }
    
    console.log(chalk.blue(`[DEBUG] Extracted code length: ${extractedCode.length} characters`));
    console.log(chalk.blue(`[DEBUG] First 50 chars of extracted code: "${extractedCode.substring(0, 50)}..."`));
    
    return extractedCode;
  } catch (error) {
    console.error(chalk.red(`[ERROR] Cohere generate error: ${error.message}`));
    
    if (error.response) {
      console.error(chalk.red(`[ERROR] Status: ${error.response.status}`));
      console.error(chalk.red(`[ERROR] Response data: ${JSON.stringify(error.response.data)}`));
    } else if (error.request) {
      console.error(chalk.red('[ERROR] No response received from server'));
      console.error(chalk.red(`[ERROR] Request details: ${error.request}`));
    }
    
    throw new Error(`Failed to generate with Cohere: ${error.message}`);
  }
}

/**
 * Validates if an API key for a provider is working
 * @param {string} provider - 'cohere' or 'gemini'
 * @param {string} apiKey - API key to validate
 * @returns {Promise<boolean>} Whether the API key is valid
 */
export async function validateApiKey(provider, apiKey) {
  console.log(chalk.blue(`[DEBUG] Validating API key for ${provider}`));
  
  try {
    if (provider === 'cohere') {
      console.log(chalk.blue('[DEBUG] Testing Cohere API key with models endpoint'));
      
      // Use axios with the curl pattern
      const startTime = Date.now();
      const response = await axios({
        method: 'get',
        url: 'https://api.cohere.com/v2/models',
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        timeout: 10000 // 10 second timeout
      });
      
      const duration = Date.now() - startTime;
      console.log(chalk.green(`[DEBUG] Cohere API key validation successful (${duration}ms)`));
      console.log(chalk.blue(`[DEBUG] Available models: ${response.data.models ? response.data.models.length : 'unknown'}`));
      
      return true;
    } else if (provider === 'gemini') {
      console.log(chalk.blue('[DEBUG] Testing Gemini API key with models endpoint'));
      // Simple validation for Gemini
      const startTime = Date.now();
      const response = await axios({
        method: 'get',
        url: 'https://generativelanguage.googleapis.com/v1/models',
        params: {
          key: apiKey
        },
        timeout: 10000 // 10 second timeout
      });
      
      const duration = Date.now() - startTime;
      console.log(chalk.green(`[DEBUG] Gemini API key validation successful (${duration}ms)`));
      
      return true;
    }
    
    console.log(chalk.yellow(`[DEBUG] Unknown provider: ${provider}`));
    return false;
  } catch (error) {
    console.error(chalk.red(`[ERROR] API key validation failed: ${error.message}`));
    
    if (error.response) {
      console.error(chalk.red(`[ERROR] Status: ${error.response.status}`));
      console.error(chalk.red(`[ERROR] Response data: ${JSON.stringify(error.response.data)}`));
    }
    
    return false;
  }
}

/**
 * Finds related files using the appropriate reranking method
 * @param {string} query - Query string
 * @param {Array} documents - Array of document objects
 * @param {Object} options - Command options
 * @returns {Promise<Array>} Related documents
 */
export async function findRelatedFiles(query, documents, options) {
  console.log(chalk.blue(`[DEBUG] Finding related files for query: "${query.substring(0, 50)}..."`));
  console.log(chalk.blue(`[DEBUG] Provider: ${options.provider}, Total documents: ${documents.length}`));
  
  if (options.provider === 'cohere') {
    console.log(chalk.blue('[DEBUG] Using Cohere rerank for finding related files'));
    return await cohereRerank(query, documents, options);
  } else {
    console.log(chalk.yellow(`[DEBUG] Provider ${options.provider} doesn't support reranking, using basic filtering`));
    // For providers without reranking, fall back to basic keyword filtering
    const filteredDocs = documents
      .filter(doc => doc.content.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 5)
      .map(doc => ({
        filePath: doc.filePath,
        content: doc.content,
        relevance: 0.5 // Placeholder score
      }));
    
    console.log(chalk.blue(`[DEBUG] Found ${filteredDocs.length} related files using basic filtering`));
    return filteredDocs;
  }
}

/**
 * Enhances a component using the selected LLM provider
 * @param {string} prompt - LLM prompt
 * @param {Object} options - Command options
 * @returns {Promise<string>} Enhanced component code
 */
export async function enhanceWithLLM(prompt, options) {
  console.log(chalk.blue(`[DEBUG] Enhancing component with ${options.provider}`));
  console.log(chalk.blue(`[DEBUG] Prompt length: ${prompt.length} characters`));
  
  if (options.provider === 'cohere') {
    console.log(chalk.blue('[DEBUG] Using Cohere generate for enhancement'));
    return await cohereGenerate(prompt, options);
  } else if (options.provider === 'gemini') {
    console.log(chalk.blue('[DEBUG] Using Gemini generate for enhancement'));
    return await geminiGenerate(prompt, options);
  } else {
    console.error(chalk.red(`[ERROR] Unknown provider: ${options.provider}`));
    throw new Error(`Unknown provider: ${options.provider}`);
  }
}

/**
 * Generate enhanced component using Google's Gemini API
 * @param {string} prompt - LLM prompt
 * @param {Object} options - Options including API key
 * @returns {Promise<string>} Generated code
 */
export async function geminiGenerate(prompt, options) {
  console.log(chalk.blue(`[DEBUG] Starting geminiGenerate with prompt length: ${prompt.length} characters`));
  
  try {
    console.log(chalk.blue('[DEBUG] Calling Gemini generateContent API with model: gemini-1.5-pro'));
    console.log(chalk.blue('[DEBUG] Temperature: 0.7, MaxOutputTokens: 4096'));
    
    const startTime = Date.now();
    const response = await axios({
      method: 'post',
      url: 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent',
      params: {
        key: options.apiKey
      },
      headers: {
        'Content-Type': 'application/json'
      },
      data: {
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 4096,
          topP: 0.95,
          topK: 40
        }
      },
      timeout: 120000 // 2 minute timeout
    });
    
    const duration = Date.now() - startTime;
    console.log(chalk.green(`[DEBUG] Gemini API response received in ${duration}ms`));
    
    // Extract the generated text from Gemini response
    const content = response.data.candidates[0].content;
    let generatedText = '';
    
    console.log(chalk.blue(`[DEBUG] Response content parts: ${content.parts.length}`));
    
    for (const part of content.parts) {
      if (part.text) {
        generatedText += part.text;
      }
    }
    
    console.log(chalk.blue(`[DEBUG] Generated text length: ${generatedText.length} characters`));
    
    // Clean up the response to extract only the code
    let extractedCode = generatedText;
    
    if (generatedText.includes('```jsx')) {
      console.log(chalk.blue('[DEBUG] Detected JSX code block'));
      extractedCode = generatedText.split('```jsx')[1].split('```')[0].trim();
    } else if (generatedText.includes('```js')) {
      console.log(chalk.blue('[DEBUG] Detected JS code block'));
      extractedCode = generatedText.split('```js')[1].split('```')[0].trim();
    } else if (generatedText.includes('```')) {
      console.log(chalk.blue('[DEBUG] Detected generic code block'));
      extractedCode = generatedText.split('```')[1].split('```')[0].trim();
    } else {
      console.log(chalk.yellow('[DEBUG] No code block detected, using full response'));
    }
    
    console.log(chalk.blue(`[DEBUG] Extracted code length: ${extractedCode.length} characters`));
    
    return extractedCode;
  } catch (error) {
    console.error(chalk.red(`[ERROR] Gemini API error: ${error.message}`));
    
    if (error.response) {
      console.error(chalk.red(`[ERROR] Status: ${error.response.status}`));
      console.error(chalk.red(`[ERROR] Response data: ${JSON.stringify(error.response.data)}`));
    } else if (error.request) {
      console.error(chalk.red('[ERROR] No response received from server'));
    }
    
    throw new Error(`Failed to generate with Gemini: ${error.message}`);
  }
}