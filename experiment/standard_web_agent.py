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
            "generated_content": None,
            "element_inspections": []  # New field to track element inspections
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
            
            # Log the first few Aartisan elements to understand what's available
            self.log(f"Found {len(artisan_elements)} Aartisan-enhanced elements")
            for i, elem in enumerate(artisan_elements[:5]):  # Log up to 5 elements
                elem_info = self._inspect_element(elem)
                self.log(f"Aartisan Element {i+1}: {json.dumps(elem_info, indent=2)}")
        
        # Update metrics
        self.metrics["detection_time"] = time.time() - detection_start
        self.metrics["has_aartisan"] = enhanced
        self.log(f"Aartisan enhancement detected: {enhanced}")
        return enhanced
    
    def _inspect_element(self, element) -> Dict[str, Any]:
        """
        Inspect a web element and return a dictionary with its attributes and properties.
        
        Args:
            element: WebElement to inspect
            
        Returns:
            dict: Element properties and attributes
        """
        try:
            # Get basic properties
            element_info = {
                "tag_name": element.tag_name,
                "text": element.text.strip() if element.text else "",
                "is_displayed": element.is_displayed(),
                "is_enabled": element.is_enabled(),
                "location": element.location,
                "size": element.size,
                "attributes": {}
            }
            
            # Get all attributes (standard)
            for attr in ["id", "class", "name", "type", "value", "href", "src", "alt", "title", "placeholder"]:
                value = element.get_attribute(attr)
                if value:
                    element_info["attributes"][attr] = value
            
            # Get Aartisan-specific attributes
            aartisan_attrs = [
                "data-aartisan", "data-aartisan-id", "data-aartisan-name", "data-aartisan-purpose",
                "data-aartisan-interaction", "data-aartisan-description", "data-aartisan-importance",
                "data-aartisan-content-type", "data-aartisan-group", "data-aartisan-component"
            ]
            
            for attr in aartisan_attrs:
                value = element.get_attribute(attr)
                if value:
                    element_info["attributes"][attr] = value
            
            # Get computed selector
            element_info["selector"] = self._generate_selector(element)
            
            # Get innerHTML (truncated if too large)
            innerHTML = element.get_attribute("innerHTML")
            if innerHTML:
                if len(innerHTML) > 500:
                    element_info["innerHTML"] = innerHTML[:500] + "... [truncated]"
                else:
                    element_info["innerHTML"] = innerHTML
            
            # Get computed accessibility information
            element_info["accessibility"] = {
                "aria-label": element.get_attribute("aria-label"),
                "aria-role": element.get_attribute("role"),
                "aria-hidden": element.get_attribute("aria-hidden")
            }
            
            # Filter out None values
            element_info["accessibility"] = {k: v for k, v in element_info["accessibility"].items() if v}
            
            return element_info
        except Exception as e:
            self.log(f"Error inspecting element: {e}")
            return {"error": str(e)}

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
        
        # Find all interactive elements (regardless of enhancement)
        interactive_selectors = "button, a, input, select, textarea, [role=button], [tabindex]"
        
        # First try to get enhanced interactive elements
        elements = self.driver.find_elements(By.CSS_SELECTOR, ", ".join(selectors))
        
        # If no enhanced elements found, fall back to regular interactive elements
        if not elements:
            elements = self.driver.find_elements(By.CSS_SELECTOR, interactive_selectors)
        
        artisan_elements = []
        for element in elements:
            try:
                # Get detailed element information
                element_info = self._inspect_element(element)
                
                # Add to list, keeping only non-empty values
                filtered_info = {}
                for k, v in element_info.items():
                    if v and k != "innerHTML":  # Skip innerHTML to keep the output cleaner
                        if isinstance(v, dict):
                            filtered_info[k] = {k2: v2 for k2, v2 in v.items() if v2}
                        else:
                            filtered_info[k] = v
                
                artisan_elements.append(filtered_info)
            except:
                pass
        
        self.metrics["interactive_elements_count"] = len(artisan_elements)
        
        return {
            "title": title,
            "url": url,
            "meta_description": meta_description,
            "has_ai_optimizer": self.metrics["has_aartisan"],
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
        Execute an action on the page with improved element selection.
        
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
        
        # Find the element using multiple strategies
        element = None
        error_messages = []
        
        # Try a series of different selection strategies
        selection_strategies = [
            # 1. Try directly with the provided selector
            lambda: self._try_find_element(target),
            
            # 2. For text-based targets, try various XPath approaches
            lambda: self._try_find_element_by_text(target),
            
            # 3. Use partial text matching for longer texts
            lambda: self._try_find_element_by_partial_text(target),
            
            # 4. Try finding by visible content
            lambda: self._try_find_element_by_visible_content(target),
            
            # 5. Try finding elements with data-aartisan attributes containing the target text
            lambda: self._try_find_element_by_aartisan_containing(target),
            
            # 6. If it has "View Details" or similar button text, try finding those near target text
            lambda: self._try_find_related_action_button(target, "View Details"),
            lambda: self._try_find_related_action_button(target, "Book"),
            lambda: self._try_find_related_action_button(target, "Select"),
        ]
        
        # Try each strategy until we find an element
        for i, strategy in enumerate(selection_strategies):
            try:
                potential_element = strategy()
                if potential_element:
                    element = potential_element
                    self.log(f"Found element using strategy {i+1}")
                    break
            except Exception as e:
                error_message = f"Selection strategy {i+1} failed: {str(e)}"
                error_messages.append(error_message)
                self.log(error_message)
        
        # If we found an element, execute the action
        if element:
            try:
                # Log detailed information about the found element
                element_inspection = self._inspect_element(element)
                self.metrics["element_inspections"].append({
                    "timestamp": datetime.now().isoformat(),
                    "action": action,
                    "element": element_inspection,
                    "selection_method": i+1 if 'i' in locals() else "unknown"
                })
                
                # Log element details for debugging
                self.log(f"Using element for {action_type}:")
                self.log(f"Tag: {element_inspection.get('tag_name')}")
                self.log(f"Text: {element_inspection.get('text')}")
                
                # Execute the action
                if action_type == "click":
                    # Scroll element into view
                    self.driver.execute_script("arguments[0].scrollIntoView({block: 'center', behavior: 'smooth'});", element)
                    time.sleep(0.7)  # Wait for scroll
                    
                    # Highlight element before clicking
                    self.driver.execute_script("""
                        original_style = arguments[0].getAttribute('style') || '';
                        arguments[0].setAttribute('style', original_style + '; border: 3px solid red; background: rgba(255,0,0,0.1); transition: all 0.3s;');
                    """, element)
                    time.sleep(0.5)  # Brief pause to see highlighting
                    
                    # Click the element
                    element.click()
                    time.sleep(1.5)  # Slightly longer wait after click
                    
                    # For content generation, collect content after navigation
                    if self.content_generation:
                        self.collect_content()
                        
                    return True
                
                elif action_type == "input":
                    # Scroll element into view
                    self.driver.execute_script("arguments[0].scrollIntoView({block: 'center', behavior: 'smooth'});", element)
                    time.sleep(0.5)  # Wait for scroll
                    
                    # Highlight element
                    self.driver.execute_script("""
                        original_style = arguments[0].getAttribute('style') || '';
                        arguments[0].setAttribute('style', original_style + '; border: 3px solid blue; background: rgba(0,0,255,0.1); transition: all 0.3s;');
                    """, element)
                    time.sleep(0.3)
                    
                    # Clear and input text
                    element.clear()
                    element.send_keys(value)
                    time.sleep(0.3)  # Wait briefly after input
                    return True
                
                elif action_type == "select":
                    if element.tag_name == "select":
                        from selenium.webdriver.support.ui import Select
                        
                        # Scroll element into view
                        self.driver.execute_script("arguments[0].scrollIntoView({block: 'center', behavior: 'smooth'});", element)
                        time.sleep(0.5)
                        
                        # Highlight element
                        self.driver.execute_script("""
                            original_style = arguments[0].getAttribute('style') || '';
                            arguments[0].setAttribute('style', original_style + '; border: 3px solid green; background: rgba(0,255,0,0.1); transition: all 0.3s;');
                        """, element)
                        time.sleep(0.3)
                        
                        select = Select(element)
                        select.select_by_visible_text(value)
                        time.sleep(0.3)  # Wait briefly after selection
                        return True
                
                else:
                    self.metrics["errors"].append(f"Unsupported action type: {action_type}")
                    self.log(f"Unsupported action type: {action_type}")
                    return False
                
            except Exception as e:
                self.metrics["errors"].append(f"Error executing {action_type} on {target}: {str(e)}")
                self.log(f"Error executing action: {e}")
                traceback.print_exc()  # Print full traceback for debugging
                return False
        
        # If we couldn't find the element, log the error
        self.metrics["errors"].append(f"Element not found using any strategy: {target}")
        self.log(f"Failed to find element: {target}")
        self.log(f"Attempted strategies failed with: {error_messages}")
        return False

    def _try_find_element(self, target, timeout=5):
        """Try to find an element with the given target selector."""
        try:
            if target.startswith("xpath="):
                return WebDriverWait(self.driver, timeout).until(
                    EC.element_to_be_clickable((By.XPATH, target[6:]))
                )
            else:
                return WebDriverWait(self.driver, timeout).until(
                    EC.element_to_be_clickable((By.CSS_SELECTOR, target))
                )
        except:
            return None

    def _try_find_element_by_text(self, text, timeout=5):
        """Try to find an element containing the exact text."""
        try:
            # Try exact match with various elements that commonly contain text
            for tag in ['a', 'button', 'div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'li']:
                xpath = f"//*/text()[normalize-space(.)='{text}']/parent::{tag}"
                element = WebDriverWait(self.driver, 1).until(
                    EC.element_to_be_clickable((By.XPATH, xpath))
                )
                if element:
                    return element
            
            # Try with text content
            return WebDriverWait(self.driver, timeout).until(
                EC.element_to_be_clickable((By.XPATH, f"//*[contains(text(), '{text}')]"))
            )
        except:
            return None

    def _try_find_element_by_partial_text(self, text, timeout=3):
        """Try to find an element containing part of the text."""
        try:
            # For longer texts, break it up and look for significant parts
            words = text.split()
            if len(words) > 3:
                # Try with just the first few significant words
                significant_part = ' '.join(words[:3])
                
                # Look for this partial match
                return WebDriverWait(self.driver, timeout).until(
                    EC.element_to_be_clickable((By.XPATH, f"//*[contains(text(), '{significant_part}')]"))
                )
                
            # If that didn't work, try looking for any keyword that might be distinctive
            distinctive_keywords = [word for word in words if len(word) > 5]  # Longer words tend to be more distinctive
            
            for keyword in distinctive_keywords:
                try:
                    element = WebDriverWait(self.driver, 1).until(
                        EC.element_to_be_clickable((By.XPATH, f"//*[contains(text(), '{keyword}')]"))
                    )
                    if element:
                        return element
                except:
                    continue
            
            return None
        except:
            return None

    def _try_find_element_by_visible_content(self, text, timeout=3):
        """Try to find a visible element with content similar to the target."""
        try:
            # Use JavaScript to find elements by their visible text content
            # This is more reliable than XPath text searching in some cases
            script = """
            function findElementByVisibleText(searchText) {
                searchText = searchText.toLowerCase();
                let elements = document.querySelectorAll('a, button, div, span, p, h1, h2, h3, h4, li');
                
                for (let elem of elements) {
                    if (elem.offsetParent !== null) { // Check if visible
                        let content = elem.textContent.toLowerCase();
                        if (content.includes(searchText)) {
                            return elem;
                        }
                    }
                }
                return null;
            }
            return findElementByVisibleText(arguments[0]);
            """
            
            element = self.driver.execute_script(script, text)
            return element
        except:
            return None

    def _try_find_element_by_aartisan_containing(self, text, timeout=3):
        """Try to find elements with aartisan attributes that contain the target text."""
        try:
            # Find all elements with data-aartisan attributes
            aartisan_elements = self.driver.find_elements(By.CSS_SELECTOR, "[data-aartisan]")
            
            # Check each element for containing the target text
            for elem in aartisan_elements:
                if text.lower() in elem.text.lower():
                    return elem
                
                # Check child elements too
                children = elem.find_elements(By.XPATH, ".//*")
                for child in children:
                    if text.lower() in child.text.lower():
                        return child
            
            return None
        except:
            return None

    def _try_find_related_action_button(self, text, button_text="View Details", timeout=3):
        """Try to find action buttons related to text content."""
        try:
            # Strategy 1: Find buttons near text
            xpath = f"//*/text()[contains(normalize-space(.), '{text}')]/ancestor::*[position() <= 3]//button[contains(text(), '{button_text}')] | //*/text()[contains(normalize-space(.), '{text}')]/ancestor::*[position() <= 3]//a[contains(text(), '{button_text}')]"
            
            element = WebDriverWait(self.driver, 1).until(
                EC.element_to_be_clickable((By.XPATH, xpath))
            )
            
            if element:
                return element
            
            # Strategy 2: Find nearby elements with common button classes
            script = """
            function findRelatedButton(searchText, buttonText) {
                searchText = searchText.toLowerCase();
                buttonText = buttonText.toLowerCase();
                
                // Find all elements containing the search text
                let containers = [];
                let allElements = document.querySelectorAll('*');
                
                for (let elem of allElements) {
                    if (elem.textContent.toLowerCase().includes(searchText)) {
                        containers.push(elem);
                    }
                }
                
                // For each container, find buttons or links
                for (let container of containers) {
                    // Check direct buttons/links
                    let buttons = container.querySelectorAll('button, a, [role="button"]');
                    for (let button of buttons) {
                        if (button.textContent.toLowerCase().includes(buttonText)) {
                            return button;
                        }
                    }
                    
                    // Check parent elements
                    let parent = container.parentElement;
                    for (let i = 0; i < 3 && parent; i++) {
                        buttons = parent.querySelectorAll('button, a, [role="button"]');
                        for (let button of buttons) {
                            if (button.textContent.toLowerCase().includes(buttonText)) {
                                return button;
                            }
                        }
                        parent = parent.parentElement;
                    }
                }
                
                return null;
            }
            
            return findRelatedButton(arguments[0], arguments[1]);
            """
            
            element = self.driver.execute_script(script, text, button_text)
            return element
            
        except:
            return None

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
            "generated_content": None,
            "element_inspections": []
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
        
        # Use a production-style system prompt that doesn't mention any specific technologies
        if self.content_generation:
            system_prompt = """You are an intelligent web assistant that helps users extract and summarize information from websites. 
    Your goal is to navigate through pages, locate relevant information, and compile it into well-structured content.

    For each step, you will:
    1. Analyze the current webpage structure and content
    2. Determine the most relevant information related to the user's request
    3. Navigate to new pages if necessary to gather more information
    4. Provide clear, structured actions in JSON format

    Respond with actions in this format:
    ```json
    {
    "type": "click|input|select|navigate|collect",
    "target": "<css_selector_or_url>",
    "value": "<value_for_input>" (for input/select actions only)
    }
    ```

    Once you have all the necessary information, respond with:
    ```
    TASK COMPLETE
    Result: <summary of your findings>
    ```

    Be efficient, accurate, and focus on delivering high-quality information that addresses the user's specific needs."""
        else:
            system_prompt = """You are an intelligent web assistant that helps users accomplish tasks on websites.
    Your goal is to help navigate and interact with web interfaces to complete specific objectives.

    For each step, you will:
    1. Analyze the current webpage structure and interface elements
    2. Determine the most logical next action based on the task goal
    3. Provide clear, structured actions in JSON format

    Respond with actions in this format:
    ```json
    {
    "type": "click|input|select|navigate",
    "target": "<css_selector_or_xpath>",
    "value": "<value_for_input>" (for input/select actions only)
    }
    ```

    For element identifiers, use:
    - CSS selectors (e.g., "#submit-button", ".nav-link")
    - XPath expressions (prefixed with "xpath=")
    - Text content directly when appropriate

    Once the task is complete, respond with:
    ```
    TASK COMPLETE
    Result: <description of what was accomplished>
    ```

    Be efficient, precise, and reliable in completing the user's task."""
        
        # Initial user message describes the task without mentioning any specific technologies
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"I need to perform this task on a website: {task}\n\nThe website URL is: {url}\n\nPlease guide me through completing this step by step."}
        ]
        
        # Main interaction loop
        max_iterations = 25  # Prevent infinite loops
        for iteration in range(max_iterations):
            self.log(f"Iteration {iteration + 1}/{max_iterations}")
            
            # Get the current page state
            page_content = self.get_page_content()
            
            # Add page content to the conversation in a clean, production-ready format
            # Focus on essential information about the page and available UI elements
            messages.append({
                "role": "user", 
                "content": f"""Current page information:
    - Title: {page_content['title']}
    - URL: {page_content['url']}
    - Description: {page_content['meta_description'][:150] + '...' if len(page_content['meta_description']) > 150 else page_content['meta_description']}

    There are {page_content['interactive_elements_count']} interactive elements on this page.

    Here are the elements you can interact with:
    {json.dumps(page_content['interactive_elements'], indent=2)}

    What action should I take next to accomplish the task?"""
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
                    # Simple, clean confirmation that doesn't reveal implementation details
                    messages.append({
                        "role": "user", 
                        "content": f"Action completed: {action['type']} on {action['target']}" + (f" with value: {action['value']}" if action.get('value') else "")
                    })
                else:
                    # Provide helpful error feedback without revealing implementation
                    messages.append({
                        "role": "user", 
                        "content": f"Unable to perform the action: {action['type']} on {action['target']}. The element might not be visible, clickable, or may not exist. Please try a different approach."
                    })
            else:
                # Guide the AI to provide properly formatted actions
                messages.append({
                    "role": "user", 
                    "content": "I need a clear action to take. Please provide a specific instruction in JSON format with 'type' and 'target' fields."
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