/**
 * aartisan - Directive system
 * 
 * Provides a way to add semantic metadata to JSX elements
 * through attribute-like directives.
 */

/**
 * Creates a directive function to enhance elements
 * @param {Function} fn - Directive implementation
 * @returns {Function} Directive function
 */
function directive(fn) {
  return (...args) => {
    return (props = {}) => {
      const element = document.createElement('div');

      // Apply the directive to the element
      fn(element, ...args);

      // Convert DOM attributes to React props
      const attributeProps = {};
      for (let i = 0; i < element.attributes.length; i++) {
        const attr = element.attributes[i];
        attributeProps[attr.name] = attr.value;
      }
      return {
        ...props,
        ...attributeProps
      };
    };
  };
}

/**
 * Directive to specify the purpose of an element
 * @type {Function}
 */
const aiPurpose = directive((element, purpose) => {
  element.setAttribute('data-aartisan', 'true');
  element.setAttribute('data-aartisan-purpose', purpose);
});

/**
 * Directive to specify possible interactions
 * @type {Function}
 */
const aiInteraction = directive((element, interaction) => {
  element.setAttribute('data-aartisan', 'true');
  element.setAttribute('data-aartisan-interaction', interaction);
});

/**
 * Directive to add a description for AI understanding
 * @type {Function}
 */
const aiDescription = directive((element, description) => {
  element.setAttribute('data-aartisan', 'true');
  element.setAttribute('data-aartisan-description', description);
});

/**
 * Directive to mark an element as important for AI agents
 * @type {Function}
 */
const aiImportant = directive((element, level = 'medium') => {
  element.setAttribute('data-aartisan', 'true');
  element.setAttribute('data-aartisan-importance', level);
});

/**
 * Directive to specify content type
 * @type {Function}
 */
const aiContentType = directive((element, contentType) => {
  element.setAttribute('data-aartisan', 'true');
  element.setAttribute('data-aartisan-content-type', contentType);
});

/**
 * Directive to group related elements
 * @type {Function}
 */
const aiGroup = directive((element, groupId) => {
  element.setAttribute('data-aartisan', 'true');
  element.setAttribute('data-aartisan-group', groupId);
});

export { aiContentType, aiDescription, aiGroup, aiImportant, aiInteraction, aiPurpose, directive };
//# sourceMappingURL=directives.js.map
