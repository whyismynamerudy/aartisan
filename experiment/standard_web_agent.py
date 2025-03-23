import os
import time
import json
import argparse
import re
from datetime import datetime
from typing import Dict, List, Optional, Tuple, Any
import traceback

# import openai 
import cohere
import google.generativeai as genai
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from bs4 import BeautifulSoup
from dotenv import load_dotenv

load_dotenv()

class StandardizedAIWebAgent:
    def __init__(self, 
                 api_key: str = None, 
                 model: str = None,
                 provider: str = "gemini", 
                 timeout: int = 60,
                 max_retries: int = 3,
                 debug: bool = False,
                 interaction_mode: str = "direct",
                 content_generation: bool = False):
        """
        Initialize the standardized AI web agent.
        
        Args:
            api_key: API key for the selected AI provider
            model: Model name to use
            provider: Which provider to use ("gemini" or "cohere")
            timeout: Maximum time to wait for page elements in seconds
            max_retries: Maximum number of retries for OpenAI API calls
            debug: Whether to enable debug logging
            interaction_mode: How to interact with pages ("direct" uses standard Selenium selectors only)
            content_generation: Whether this is a content generation task
        """
        self.provider = provider.lower()

        if self.provider == "cohere":
            self.api_key = api_key or os.environ.get("COHERE_API_KEY")
            if not self.api_key:
                raise ValueError("Cohere API key must be provided for Cohere provider")
            if cohere is None:
                raise ImportError("Cohere package not found. Install it with 'pip install cohere'.")
            self.client = cohere.ClientV2(api_key=self.api_key)
            if not model:
                self.model = "command-a-03-2025" 

        elif self.provider == "gemini":
            self.api_key = api_key or os.environ.get("GEMINI_API_KEY")
            if not self.api_key:
                raise ValueError("Gemini API key must be provided for Gemini provider")
            if genai is None:
                raise ImportError("Gemini package not found. Install it with 'pip install google.generativeai'.")
            genai.configure(api_key=self.api_key)
            if not model:
                self.model = "gemini-2.0-flash"
            self.client = genai.GenerativeModel(self.model)

        else:
            raise ValueError("Unsupported provider. Please choose either 'gemini' or 'cohere'.")

        # self.api_key = api_key or os.environ.get("OPENAI_API_KEY")
        # if not self.api_key:
        #     raise ValueError("OpenAI API key must be provided")
        
        # self.client = openai.OpenAI(api_key=self.api_key)
        # self.model = model
        self.timeout = timeout
        self.max_retries = max_retries
        self.debug = debug
        self.interaction_mode = interaction_mode
        self.content_generation = content_generation
        
        # Initialize browser (always headless)
        chrome_options = Options()
        chrome_options.add_argument("--headless")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--disable-gpu")
        chrome_options.add_argument("--window-size=1920,1080")
        
        self.driver = webdriver.Chrome(options=chrome_options)
        self.driver.set_page_load_timeout(timeout)
        
        # Metrics tracking
        self.metrics = {
            "start_time": None,
            "end_time": None,
            "total_duration": None,
            "steps_taken": 0,
            "api_calls": 0,
            "total_tokens": {
                "prompt": 0,
                "completion": 0,
                "total": 0
            },
            "retries": 0,
            "errors": [],
            "success": False,
            "has_ai_optimizer": False,
            "page_load_time": None,
            "detection_time": None,
            "interactive_elements_count": 0,
            "actions_performed": [],
            "interaction_mode": self.interaction_mode,
            "is_content_generation": self.content_generation,
            "collected_content": "",
            "generated_content": None
        }
    
    def __del__(self):
        """Cleanup resources when the object is destroyed."""
        if hasattr(self, 'driver'):
            try:
                self.driver.quit()
            except:
                pass
    
    def log(self, message: str):
        """Log a message if debug mode is enabled."""
        if self.debug:
            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            print(f"[{timestamp}] {message}")
    
    def detect_aartisan_optimizer(self) -> bool:
        """
        Detect whether the current page is enhanced with Aartisan semantic metadata.
        Checks for data-aartisan attributes.
        
        Returns:
            bool: True if optimizer is detected, False otherwise
        """
        detection_start = time.time()
        
        # Check for data-aartisan attribute on html tag
        enhanced = False
        try:
            html_element = self.driver.find_element(By.TAG_NAME, "html")
            enhanced = html_element.get_attribute("data-aartisan") == "true"
        except:
            pass
        
        # Check for Aartisan-specific data attributes on elements
        artisan_elements = self.driver.find_elements(By.CSS_SELECTOR, "[data-aartisan-id], [data-aartisan-name], [data-aartisan-purpose]")
        if len(artisan_elements) > 0:
            enhanced = True
            self.metrics["interactive_elements_count"] = len(artisan_elements)
        
        # Update metrics
        self.metrics["detection_time"] = time.time() - detection_start
        self.metrics["has_aartisan"] = enhanced
        self.log(f"Aartisan enhancement detected: {enhanced}")
        return enhanced

    def navigate_to(self, url: str) -> bool:
        """
        Navigate to a URL and detect if it has next-ai-optimizer.
        
        Args:
            url: URL to navigate to
            
        Returns:
            bool: True if navigation successful, False otherwise
        """
        self.log(f"Navigating to {url}")
        load_start = time.time()
        
        try:
            self.driver.get(url)
            self.metrics["page_load_time"] = time.time() - load_start
            
            # Detect Aartisan (for metrics only)
            self.detect_aartisan_optimizer()
            
            # Wait for the page to be fully loaded
            WebDriverWait(self.driver, 10).until(
                lambda d: d.execute_script("return document.readyState") == "complete"
            )
            
            # For content generation tasks, collect page content immediately
            if self.content_generation:
                self.collect_content()
            
            return True
        except Exception as e:
            self.metrics["errors"].append(f"Navigation error: {str(e)}")
            self.log(f"Error navigating to {url}: {e}")
            return False

    def collect_content(self) -> str:
        """
        Collect content from the current page for content generation tasks.
        
        Returns:
            str: Collected content
        """
        self.log("Collecting page content for generation")
        
        # Get page information
        title = self.driver.title
        url = self.driver.current_url
        
        # Parse page with BeautifulSoup
        page_source = self.driver.page_source
        soup = BeautifulSoup(page_source, 'html.parser')
        
        # Remove scripts, styles, etc.
        for tag in soup(["script", "style", "noscript", "iframe", "svg", "nav", "footer"]):
            tag.decompose()
        
        # Try to find main content area
        content_area = None
        for selector in ["main", "article", "#content", ".content", "#main", ".main"]:
            content_area = soup.select_one(selector)
            if content_area:
                break
        
        # If no specific content area found, use body
        if not content_area:
            content_area = soup.body
        
        # Extract text from content area
        content = ""
        if content_area:
            # Extract headings and paragraphs
            for element in content_area.find_all(['h1', 'h2', 'h3', 'h4', 'p']):
                text = element.get_text(strip=True)
                if text:
                    tag_name = element.name
                    if tag_name.startswith('h'):
                        # Add heading formatting
                        level = int(tag_name[1])
                        prefix = '#' * level + ' '
                        content += f"\n{prefix}{text}\n"
                    else:
                        # Regular paragraph
                        content += f"\n{text}\n"
        
        # If no structured content found, get all text
        if not content.strip():
            content = soup.get_text(separator='\n', strip=True)
        
        # Add to collected content
        full_content = f"Title: {title}\nURL: {url}\n\n{content}"
        self.metrics["collected_content"] += full_content + "\n\n---\n\n"
        
        return full_content

    def get_page_content(self) -> Dict[str, Any]:
        """
        Extract page content and Aartisan semantic metadata from the webpage.
        Uses the same approach for all pages, regardless of optimization.
        
        Returns:
            dict: page title, URL, meta description,
            a sample of the main content, and a list of interactive elements 
            that include Aartisan-enhanced semantic attributes.
        """
        # Get basic page information
        title = self.driver.title
        url = self.driver.current_url
        
        # Get the page source and parse with BeautifulSoup
        page_source = self.driver.page_source
        soup = BeautifulSoup(page_source, 'html.parser')
        
        # Extract meta description
        meta_description = ""
        meta_desc_tag = soup.find("meta", attrs={"name": "description"})
        if meta_desc_tag and "content" in meta_desc_tag.attrs:
            meta_description = meta_desc_tag["content"]
        
        # Get main content (removing scripts, styles, etc.)
        for script in soup(["script", "style", "noscript", "iframe", "svg"]):
            script.extract()
        
        main_content = soup.get_text(separator=' ', strip=True)
        
        # Truncate main content if too long
        if len(main_content) > 10000:
            main_content = main_content[:10000] + "... [content truncated]"
        
        # Define selectors for Aartisan-enhanced elements (including new directive attributes)
        selectors = [
            "[data-aartisan-id]", "[data-aartisan-name]", "[data-aartisan-purpose]",
            "[data-aartisan-interaction]", "[data-aartisan-description]",
            "[data-aartisan-importance]", "[data-aartisan-content-type]", "[data-aartisan-group]"
        ]
        
        elements = self.driver.find_elements(By.CSS_SELECTOR, ", ".join(selectors))
        artisan_elements = []
        for element in elements:
            try:
                # Extract relevant Aartisan attributes and additional info
                element_info = {
                    "tag": element.tag_name,
                    "text": element.text.strip() if element.text else "",
                    "id": element.get_attribute("data-aartisan-id"),
                    "name": element.get_attribute("data-aartisan-name"),
                    "purpose": element.get_attribute("data-aartisan-purpose"),
                    "interaction": element.get_attribute("data-aartisan-interaction"),
                    "description": element.get_attribute("data-aartisan-description"),
                    "importance": element.get_attribute("data-aartisan-importance"),
                    "content_type": element.get_attribute("data-aartisan-content-type"),
                    "group": element.get_attribute("data-aartisan-group"),
                    "selector": self._generate_selector(element)
                }

                # # Also collect AI optimizer attributes if present (for informational purposes only)
                # aartisan_purpose = element.get_attribute("data-aartisan-purpose")
                # ai_action = element.get_attribute("data-ai-action")
                # ai_description = element.get_attribute("data-ai-description")
                
                # if aartisan_purpose:
                #     element_info["aartisan_purpose"] = aartisan_purpose
                # if ai_action:
                #     element_info["ai_action"] = ai_action
                # if ai_description:
                #     element_info["ai_description"] = ai_description
                
                artisan_elements.append({k: v for k, v in element_info.items() if v})
            except:
                pass
        
        self.metrics["interactive_elements_count"] = len(artisan_elements)
        
        return {
            "title": title,
            "url": url,
            "meta_description": meta_description,
            "has_ai_optimizer": self.metrics["has_ai_optimizer"],
            "main_content_sample": main_content[:2000],  # First 2000 chars as sample
            "interactive_elements": artisan_elements[:50],  # Limit to 50 elements
            "interactive_elements_count": len(artisan_elements)
        }
    
    def _generate_selector(self, element) -> str:
        """
        Generate a CSS selector for an element.
        Used consistently for all pages.
        
        Args:
            element: WebElement to generate selector for
            
        Returns:
            str: CSS selector for the element
        """
        # Priority: use unique Aartisan attributes if available.
        artisan_id = element.get_attribute("data-aartisan-id")
        if artisan_id:
            return f"[data-aartisan-id='{artisan_id}']"
        
        # Optionally, if a group is defined, use it with tag (though group may not be unique)
        group = element.get_attribute("data-aartisan-group")
        if group:
            return f"{element.tag_name}[data-aartisan-group='{group}']"
        
        # Next, check for Aartisan name
        artisan_name = element.get_attribute("data-aartisan-name")
        if artisan_name:
            return f"{element.tag_name}[data-aartisan-name='{artisan_name}']"
        
        # Fallback to native attributes:
        element_id = element.get_attribute("id")
        if element_id:
            return f"#{element_id}"
        
        # Try name attribute
        name = element.get_attribute("name")
        if name:
            return f"{element.tag_name}[name='{name}']"
        
        # Try using text content with xpath for buttons and links
        if element.tag_name in ["button", "a"] and element.text.strip():
            text = element.text.strip()
            # Escape single quotes in text
            text = text.replace("'", "\\'")
            return f"xpath=//{element.tag_name}[contains(text(), '{text}')]"
        
        # Use aria-label if available
        aria_label = element.get_attribute("aria-label")
        if aria_label:
            return f"{element.tag_name}[aria-label='{aria_label}']"
        
        # For inputs, try placeholder
        placeholder = element.get_attribute("placeholder")
        if placeholder:
            return f"{element.tag_name}[placeholder='{placeholder}']"
        
        # Finally, try to create a path-based selector (simplified)
        try:
            script = """
                function getPathTo(element) {
                    if (element.id !== '')
                        return 'id("' + element.id + '")';
                    if (element === document.body)
                        return element.tagName;
                    var ix = 0;
                    var siblings = element.parentNode.childNodes;
                    for (var i = 0; i < siblings.length; i++) {
                        var sibling = siblings[i];
                        if (sibling === element)
                            return getPathTo(element.parentNode) + '/' + element.tagName + '[' + (ix + 1) + ']';
                        if (sibling.nodeType === 1 && sibling.tagName === element.tagName)
                            ix++;
                    }
                }
                return getPathTo(arguments[0]);
            """
            path = self.driver.execute_script(script, element)
            return f"xpath={path}"
        except Exception:
            return element.tag_name

    def execute_action(self, action: Dict[str, str]) -> bool:
        """
        Execute an action on the page consistently for all pages.
        
        Args:
            action: Dictionary containing action details:
                - type: click, input, select, navigate, collect
                - target: Element identifier (selector, xpath)
                - value: Value to input (for input actions)
                
        Returns:
            bool: True if action successful, False otherwise
        """
        action_type = action.get("type", "").lower()
        target = action.get("target", "")
        value = action.get("value", "")
        
        self.log(f"Executing action: {action_type} on {target}" + 
                 (f" with value {value}" if value else ""))
        
        self.metrics["actions_performed"].append(action)
        self.metrics["steps_taken"] += 1
        
        # Special action for content collection
        if action_type == "collect":
            self.collect_content()
            return True
            
        # Special action for navigation
        if action_type == "navigate":
            # Handle back navigation
            if target == "back":
                self.driver.back()
                time.sleep(1)  # Wait for page to load
                return True
            # Handle URL navigation
            elif target.startswith("http"):
                return self.navigate_to(target)
            return False
        
        # Find the element using the standardized approach
        element = None
        try:
            if target.startswith("xpath="):
                element = WebDriverWait(self.driver, 10).until(
                    EC.presence_of_element_located((By.XPATH, target[6:]))
                )
            else:
                element = WebDriverWait(self.driver, 10).until(
                    EC.presence_of_element_located((By.CSS_SELECTOR, target))
                )
        except Exception as e:
            self.metrics["errors"].append(f"Element not found: {target}, Error: {str(e)}")
            self.log(f"Error finding element {target}: {e}")
            
            # Try finding by text as fallback
            try:
                if not target.startswith("xpath="):
                    element = WebDriverWait(self.driver, 5).until(
                        EC.presence_of_element_located((By.XPATH, f"//*[contains(text(), '{target}')]"))
                    )
            except:
                return False
        
        if element:
            try:
                # Execute the action
                if action_type == "click":
                    element.click()
                    time.sleep(1)  # Fixed wait time for all actions
                    
                    # For content generation, collect content after navigation
                    if self.content_generation:
                        self.collect_content()
                        
                    return True
                
                elif action_type == "input":
                    element.clear()
                    element.send_keys(value)
                    return True
                
                elif action_type == "select":
                    if element.tag_name == "select":
                        from selenium.webdriver.support.ui import Select
                        select = Select(element)
                        select.select_by_visible_text(value)
                        return True
                
                else:
                    self.metrics["errors"].append(f"Unsupported action type: {action_type}")
                    self.log(f"Unsupported action type: {action_type}")
                    return False
                
            except Exception as e:
                self.metrics["errors"].append(f"Error executing {action_type} on {target}: {str(e)}")
                self.log(f"Error executing action: {e}")
                return False
        
        return False

    def execute_task(self, task: str, url: str) -> Tuple[bool, Dict[str, Any]]:
        """
        Execute a task on a website by having the AI agent plan and execute steps.
        
        Args:
            task: Description of the task to perform
            url: URL of the website to perform the task on
            
        Returns:
            tuple: (success, result)
                - success: Whether the task was completed successfully
                - result: Task results and metrics
        """
        # Determine if this is a content generation task
        self.content_generation = self._is_content_generation_task(task)
        self.log(f"Content generation task: {self.content_generation}")
        
        # Reset metrics
        self.metrics = {
            "start_time": time.time(),
            "end_time": None,
            "total_duration": None,
            "steps_taken": 0,
            "api_calls": 0,
            "total_tokens": {
                "prompt": 0,
                "completion": 0,
                "total": 0
            },
            "retries": 0,
            "errors": [],
            "success": False,
            "has_ai_optimizer": False,
            "page_load_time": None,
            "detection_time": None,
            "interactive_elements_count": 0,
            "actions_performed": [],
            "interaction_mode": self.interaction_mode,
            "is_content_generation": self.content_generation,
            "task": task,
            "url": url,
            "result": None,
            "collected_content": "",
            "generated_content": None
        }
        
        self.log(f"Starting task: {task}")
        self.log(f"Target website: {url}")
        
        # Step 1: Navigate to the website
        if not self.navigate_to(url):
            self.metrics["end_time"] = time.time()
            self.metrics["total_duration"] = self.metrics["end_time"] - self.metrics["start_time"]
            return False, self.metrics
        
        # For simple content generation tasks, we might have all we need already
        if self.content_generation and self._is_simple_content_task(task):
            self.log("Simple content generation task detected, generating content directly")
            generated_content = self._generate_content(task)
            self.metrics["generated_content"] = generated_content
            self.metrics["result"] = generated_content
            self.metrics["success"] = True
            self.metrics["end_time"] = time.time()
            self.metrics["total_duration"] = self.metrics["end_time"] - self.metrics["start_time"]
            return True, self.metrics
        
        # Step 2: Initialize conversation with the AI
        system_prompt = self._get_system_prompt()
        
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"I need to perform the following task on a website: {task}\n\nThe website is at {url}.\n\nPlease help me accomplish this task using Aartisan semantic context."}
        ]
        
        # Main interaction loop
        max_iterations = 15  # Prevent infinite loops
        for iteration in range(max_iterations):
            self.log(f"Iteration {iteration + 1}/{max_iterations}")
            
            # Get the current page state
            page_content = self.get_page_content()
            
            # Add page content to the conversation
            messages.append({
                "role": "user", 
                "content": f"Here's the current state of the webpage:\n\n{json.dumps(page_content, indent=2)}\n\nWhat should I do next?"
            })
            
            # Get AI response
            response = self._get_ai_response(messages)
            messages.append({"role": "assistant", "content": response})
            
            # Parse the AI's action plan
            action, is_done, result = self._parse_ai_response(response)
            
            # Check if task is complete
            if is_done:
                self.metrics["success"] = True
                
                # For content generation tasks, generate the final content
                if self.content_generation:
                    generated_content = self._generate_content(task)
                    self.metrics["generated_content"] = generated_content
                    self.metrics["result"] = generated_content
                else:
                    self.metrics["result"] = result
                
                self.log("Task completed successfully")
                break
            
            # Execute the next action
            if action:
                success = self.execute_action(action)
                
                if success:
                    messages.append({
                        "role": "user", 
                        "content": f"Action executed successfully: {json.dumps(action)}"
                    })
                else:
                    messages.append({
                        "role": "user", 
                        "content": f"Failed to execute action: {json.dumps(action)}. Please try a different approach."
                    })
            else:
                messages.append({
                    "role": "user", 
                    "content": "I couldn't understand the action to take. Please provide a clear, structured action in JSON format."
                })
        
        # Check if we reached the iteration limit
        if not self.metrics["success"] and iteration == max_iterations - 1:
            self.metrics["errors"].append("Reached maximum number of iterations without completing the task")
            self.log("Failed to complete task within iteration limit")
            
            # For content generation tasks, try to generate content even if navigation failed
            if self.content_generation:
                generated_content = self._generate_content(task)
                self.metrics["generated_content"] = generated_content
                self.metrics["result"] = f"[INCOMPLETE] {generated_content}"
                self.metrics["success"] = True  # Mark as successful since we did generate content
        
        # Finalize metrics
        self.metrics["end_time"] = time.time()
        self.metrics["total_duration"] = self.metrics["end_time"] - self.metrics["start_time"]
        
        return self.metrics["success"], self.metrics
    
    def _is_content_generation_task(self, task: str) -> bool:
        """
        Determine if a task is a content generation task.
        
        Args:
            task: Task description
            
        Returns:
            bool: True if this is a content generation task
        """
        content_keywords = [
            "write", "summarize", "summary", "generate", "create", 
            "extract", "describe", "explain", "analyze", "report"
        ]
        
        task_lower = task.lower()
        for keyword in content_keywords:
            if keyword in task_lower:
                return True
        
        return False
    
    def _is_simple_content_task(self, task: str) -> bool:
        """
        Determine if this is a simple content task that doesn't need navigation.
        
        Args:
            task: Task description
            
        Returns:
            bool: True if this is a simple content task
        """
        # Simple tasks are usually about summarizing or extracting info from the current page
        simple_patterns = [
            r"summar(y|ize)",
            r"extract\s+information",
            r"describe\s+(the\s+)?(web)?site",
            r"(write|create)\s+a\s+summary",
            r"overview\s+of",
            r"(tell|write)\s+(me\s+)?about"
        ]
        
        task_lower = task.lower()
        
        for pattern in simple_patterns:
            if re.search(pattern, task_lower):
                return True
        
        return False
    
    def _generate_content(self, task: str) -> str:
        """
        Generate content based on collected information and the task.
        
        Args:
            task: Original task description
            
        Returns:
            str: Generated content
        """
        self.log("Generating content based on collected information")
        
        # Define the system message
        system_message = "You are a helpful assistant that generates high-quality content based on information from websites."

        # Prepare the content generation prompt
        user_message = f"""
Task: {task}

Please generate content based on the following information collected from the website. 
Make sure your response is well-structured, accurate, and directly addresses the task.

COLLECTED INFORMATION:
{self.metrics["collected_content"]}

Generate a detailed, well-formatted response that fulfills the task requirements.
"""
        
        # Call the API to generate content
        try:
            self.metrics["api_calls"] += 1
            
            if self.provider == "cohere":
                response = self.client.chat(
                    model=self.model,
                    message=f"{system_message}\n\nUser Request:\n{user_message}",
                    temperature=0.7,
                )
                self.metrics["total_tokens"]["prompt"] += response.usage.tokens.input_tokens
                self.metrics["total_tokens"]["completion"] += response.usage.tokens.output_tokens
                self.metrics["total_tokens"]["total"] += response.usage.tokens.input_tokens + response.usage.tokens.output_tokens
                

            elif self.provider == "gemini":
                response = self.client.generate_content(
                    [system_message, f"User Request:\n{user_message}"],
                    generation_config={"temperature": 0.7}
                )
            
                # Update token metrics
                self.metrics["total_tokens"]["prompt"] += response.usage_metadata.prompt_token_count
                self.metrics["total_tokens"]["completion"] += response.usage_metadata.candidates_token_count
                self.metrics["total_tokens"]["total"] += response.usage_metadata.total_token_count

            
            # Extract the content from the 'candidates' list (as per your provided structure)
            # Ensure there is at least one candidate and that it contains the correct 'content'
            if response and response.candidates:
                generated_content = response.candidates[0].content.parts[0].text
            else:
                generated_content = "No content available"
            
            self.log(f"Generated content of length: {len(generated_content)}")
            return generated_content
            
        except Exception as e:
            self.log(f"Error generating content: {e}")
            self.metrics["errors"].append(f"Content generation error: {str(e)}")
            return f"ERROR: Failed to generate content: {str(e)}"

    def _get_system_prompt(self) -> str:
        """
        Get the system prompt for the AI.
        
        Returns:
            str: System prompt
        """
        if self.content_generation:
            return """You are an Aartisan-enhanced web agent that helps users gather information and generate content from websites. 
            Your job is to navigate webpages, collect relevant Aartisan semantic metadata, and prepare the information for content generation.

You will receive information about the current state of a webpage including its title, URL, content sample, and interactive elements. Based on this information, you need to determine the next action to take.

For content generation tasks, focus on:
1. Navigating to pages with the most relevant information
2. Collecting content from those pages using the "collect" action
3. Exploring multiple pages if necessary to gather comprehensive information

For each step, you should provide:
1. A clear explanation of what you're doing and why
2. A JSON action object with the following structure:
   ```json
   {
     "type": "click|input|select|navigate|collect",
     "target": "<element_identifier_or_url>",
     "value": "<value_to_input>" (only for input/select actions)
   }
   ```

The "collect" action doesn't require a target and collects content from the current page.
For "navigate" actions, specify a full URL as the target, or "back" to go back.

For element identifiers, use:
- CSS selectors (e.g., "#submit-button", ".nav-link")
- XPath expressions (prefixed with "xpath=")
- Or text content directly

When you believe you have collected sufficient information, respond with:
```
TASK COMPLETE
Result: I've gathered the necessary information to generate the content.
```

Be clear, precise, and focus on gathering the most relevant Aartisan metadata."""
        else:
            return """You are an Aartisan-enhanced web agent that helps users accomplish tasks on websites.
            Your job is to navigate and interact with web elements using Aartisan semantic metadata to achieve the user's goal.

You will receive information about the current state of a webpage including its title, URL, content sample, and interactive elements. Based on this information, you need to determine the next action to take.

For each step, you should provide:
1. A clear explanation of what you're doing and why
2. A JSON action object with the following structure:
   ```json
   {
     "type": "click|input|select|navigate",
     "target": "<element_identifier_or_url>",
     "value": "<value_to_input>" (only for input/select actions)
   }
   ```

For element identifiers, use:
- CSS selectors (e.g., "#submit-button", ".nav-link")
- XPath expressions (prefixed with "xpath=")
- Or text content directly

For navigation actions, use "navigate" as the type and provide the full URL as the target, or "back" to go back.

When you believe the task is complete, respond with:
```
TASK COMPLETE
Result: <description of the outcome or information found>
```

Be clear, precise, and focus on completing the task efficiently."""

    def _get_ai_response(self, messages: List[Dict[str, str]]) -> str:
        """
        Get a response from the GenAI API based on the conversation messages.
        
        Args:
            messages: List of message dictionaries
            
        Returns:
            str: Model response
        """
        max_retries = self.max_retries
        retry_count = 0
        
        while retry_count <= max_retries:
            try:
                self.metrics["api_calls"] += 1
                
                if self.provider == "cohere":
                    prompt = "\n\n".join(
                        [f"{msg['role'].capitalize()}: {msg['content']}" for msg in messages]
                    )
                    response = self.client.chat(
                        model=self.model,
                        messages=prompt,
                        temperature=0.2,
                    )

                    # Update token metrics
                    self.metrics["total_tokens"]["prompt"] += response.usage.tokens.input_tokens
                    self.metrics["total_tokens"]["completion"] += response.usage.tokens.output_tokens
                    self.metrics["total_tokens"]["total"] += response.usage.tokens.input_tokens + response.usage.tokens.output_tokens
                
                elif self.provider == "gemini":
                    response = self.client.generate_content(
                        [msg["content"] for msg in messages],
                        generation_config={"temperature": 0.2},
                    )
                
                    # Update token metrics
                    self.metrics["total_tokens"]["prompt"] += response.usage_metadata.prompt_token_count
                    self.metrics["total_tokens"]["completion"] += response.usage_metadata.candidates_token_count
                    self.metrics["total_tokens"]["total"] += response.usage_metadata.total_token_count

                # Extract the content from the 'ca  ndidates' list (as per your provided structure)
                # Ensure there is at least one candidate and that it contains the correct 'content'
                if response and response.candidates:
                    content = response.candidates[0].content.parts[0].text
                else:
                    content = "No content available"

                # Return the content
                return content
                
            except Exception as e:
                retry_count += 1
                self.metrics["retries"] += 1
                
                if retry_count > max_retries:
                    self.metrics["errors"].append(f"API error: {str(e)}")
                    self.log(f"API error after {max_retries} retries: {e}")
                    return "Error: Failed to get response from API."
                
                wait_time = 2 ** retry_count  # Exponential backoff
                self.log(f"API error (retrying in {wait_time}s): {e}")
                time.sleep(wait_time)

    def _parse_ai_response(self, response: str) -> Tuple[Optional[Dict[str, str]], bool, Optional[str]]:
        """
        Parse the AI's response to extract action, completion status, and result.
        
        Args:
            response: AI response text
            
        Returns:
            tuple: (action, is_done, result)
                - action: Dictionary with action details or None
                - is_done: Whether the task is complete
                - result: Task result if complete, None otherwise
        """
        # Check if task is complete
        if "TASK COMPLETE" in response.upper():
            result_match = re.search(r"Result:(.*?)(?:\n|$)", response, re.DOTALL | re.IGNORECASE)
            result = result_match.group(1).strip() if result_match else "Task completed successfully"
            return None, True, result
        
        # Extract JSON action object
        json_pattern = r"```(?:json)?\s*({\s*\"type\".*?})\s*```"
        json_match = re.search(json_pattern, response, re.DOTALL)
        
        if json_match:
            try:
                action = json.loads(json_match.group(1))
                # Validate required fields
                if "type" in action:
                    # For collect action, target is not required
                    if action["type"] == "collect" or "target" in action:
                        return action, False, None
            except json.JSONDecodeError:
                self.log(f"Failed to parse JSON from response: {json_match.group(1)}")
        
        # Try alternate format (without code blocks)
        alt_pattern = r"{[\s\n]*\"type\"[\s\n]*:[\s\n]*\"[^\"]*\"[\s\n]*,[\s\n]*\"target\"[\s\n]*:[\s\n]*\"[^\"]*\".*?}"
        alt_match = re.search(alt_pattern, response, re.DOTALL)
        
        if alt_match:
            try:
                action = json.loads(alt_match.group(0))
                if "type" in action and ("target" in action or action["type"] == "collect"):
                    return action, False, None
            except json.JSONDecodeError:
                self.log(f"Failed to parse alternate JSON from response")
        
        # Check for collection keywords as a fallback
        if "collect" in response.lower() and "content" in response.lower():
            return {"type": "collect"}, False, None
            
        return None, False, None

    def save_metrics(self, filename: str = None) -> str:
        """
        Save metrics to a JSON file.
        
        Args:
            filename: Filename to save metrics to (optional)
            
        Returns:
            str: Path to the saved metrics file
        """
        # Generate timestamp for filenames
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        if not filename:
            status = "enhanced" if self.metrics.get("has_aartisan") else "regular"
            task_type = "content" if self.metrics["is_content_generation"] else "task"
            filename = f"metrics_{status}_{task_type}_{timestamp}.json"
        
        # For cleaner output, truncate large content fields
        metrics_copy = self.metrics.copy()
        if len(metrics_copy.get("collected_content", "")) > 1000:
            metrics_copy["collected_content"] = metrics_copy["collected_content"][:1000] + "... [truncated]"
        
        with open(filename, 'w') as f:
            json.dump(metrics_copy, f, indent=2)
        
        # If this was a content generation task, also save the generated content
        if self.metrics["is_content_generation"] and self.metrics["generated_content"]:
            content_filename = f"generated_content_{timestamp}.txt"
            with open(content_filename, 'w') as f:
                f.write(self.metrics["generated_content"])
            self.log(f"Generated content saved to {content_filename}")
        
        self.log(f"Metrics saved to {filename}")
        return filename


def compare_performance(task: str, optimized_url: str, regular_url: str, api_key: str = None) -> Dict[str, Any]:
    """
    Compare agent performance between websites enhanced with Aartisan metadata
    and those without, using the standardized approach.
    
    Args:
        task: Task description
        optimized_url: URL of the website with aartisan
        regular_url: URL of the website without aartisan
        api_key: API key for the AI provider (optional)
        
    Returns:
        dict: Comparison results
    """
    results = {
        "task": task,
        "optimized": None,
        "regular": None,
        "comparison": None
    }
    
    # Determine if this is a content generation task
    content_generation = StandardizedAIWebAgent(api_key=api_key)._is_content_generation_task(task)
    results["is_content_generation"] = content_generation
    
    # Run on optimized website
    print(f"Testing on optimized website: {optimized_url}")
    print("Using standardized approach for both websites")
    optimized_agent = StandardizedAIWebAgent(api_key=api_key, debug=True)
    optimized_success, optimized_metrics = optimized_agent.execute_task(task, optimized_url)
    optimized_agent.save_metrics("optimized_metrics_standardized.json")
    
    # Run on regular website
    print(f"Testing on regular website: {regular_url}")
    regular_agent = StandardizedAIWebAgent(api_key=api_key, debug=True)
    regular_success, regular_metrics = regular_agent.execute_task(task, regular_url)
    regular_agent.save_metrics("regular_metrics_standardized.json")
    
    # Store results
    results["optimized"] = optimized_metrics
    results["regular"] = regular_metrics
    
    # Generate comparison
    comparison = {
        "optimized_success": optimized_success,
        "regular_success": regular_success,
        "optimized_time": optimized_metrics["total_duration"],
        "regular_time": regular_metrics["total_duration"],
        "time_difference": optimized_metrics["total_duration"] - regular_metrics["total_duration"],
        "time_difference_percentage": ((optimized_metrics["total_duration"] - regular_metrics["total_duration"]) / 
                                      regular_metrics["total_duration"] * 100) if regular_metrics["total_duration"] else 0,
        "optimized_steps": optimized_metrics["steps_taken"],
        "regular_steps": regular_metrics["steps_taken"],
        "steps_difference": optimized_metrics["steps_taken"] - regular_metrics["steps_taken"],
        "optimized_api_calls": optimized_metrics["api_calls"],
        "regular_api_calls": regular_metrics["api_calls"],
        "optimized_tokens": optimized_metrics["total_tokens"]["total"],
        "regular_tokens": regular_metrics["total_tokens"]["total"],
        "tokens_difference": optimized_metrics["total_tokens"]["total"] - regular_metrics["total_tokens"]["total"],
        "optimized_errors": len(optimized_metrics["errors"]),
        "regular_errors": len(regular_metrics["errors"])
    }
    
    if content_generation:
        # Add content generation specific metrics
        comparison["optimized_content_length"] = len(optimized_metrics.get("generated_content", "")) if optimized_metrics.get("generated_content") else 0
        comparison["regular_content_length"] = len(regular_metrics.get("generated_content", "")) if regular_metrics.get("generated_content") else 0
        comparison["content_length_difference"] = comparison["optimized_content_length"] - comparison["regular_content_length"]
    
    results["comparison"] = comparison
    
    # Save comparison
    with open("comparison_results_standardized.json", 'w') as f:
        json.dump(results, f, indent=2)
    
    # Print summary
    print("\n=== PERFORMANCE COMPARISON (STANDARDIZED APPROACH) ===")
    print(f"Task: {task}")
    print(f"Task type: {'Content Generation' if content_generation else 'Task Execution'}")
    print(f"Optimized site success: {optimized_success}")
    print(f"Regular site success: {regular_success}")
    print(f"Time (optimized): {optimized_metrics['total_duration']:.2f}s")
    print(f"Time (regular): {regular_metrics['total_duration']:.2f}s")
    print(f"Time difference: {comparison['time_difference']:.2f}s ({comparison['time_difference_percentage']:.1f}%)")
    print(f"Steps taken (optimized): {optimized_metrics['steps_taken']}")
    print(f"Steps taken (regular): {regular_metrics['steps_taken']}")
    print(f"API calls (optimized): {optimized_metrics['api_calls']}")
    print(f"API calls (regular): {regular_metrics['api_calls']}")
    print(f"Total tokens (optimized): {optimized_metrics['total_tokens']['total']}")
    print(f"Total tokens (regular): {regular_metrics['total_tokens']['total']}")
    print(f"Errors (optimized): {len(optimized_metrics['errors'])}")
    print(f"Errors (regular): {len(regular_metrics['errors'])}")
    
    if content_generation:
        print(f"Generated content length (optimized): {comparison['optimized_content_length']} chars")
        print(f"Generated content length (regular): {comparison['regular_content_length']} chars")
    
    return results


def main():
    """Main function to run the script from command line."""
    parser = argparse.ArgumentParser(description="Standardized AI Web Agent for Website Comparison")
    parser.add_argument("--task", type=str, required=True, help="Task description")
    parser.add_argument("--optimized-url", type=str, required=True, help="URL of website with Aartisan enhancements")
    parser.add_argument("--regular-url", type=str, required=True, help="URL of website without Aartisan enhancements")
    parser.add_argument("--api-key", type=str, help="API key for the selected provider (or set via env variable)")
    parser.add_argument("--provider", type=str, default="gemini", help="Model provider (gemini / cohere)")
    parser.add_argument("--model", type=str, help="model to use")
    parser.add_argument("--timeout", type=int, default=60, help="Timeout in seconds")
    
    args = parser.parse_args()
    
    # Run comparison
    compare_performance(
        task=args.task,
        optimized_url=args.optimized_url,
        regular_url=args.regular_url,
        api_key=args.api_key
    )


if __name__ == "__main__":
    main()