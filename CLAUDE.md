# Initial rules

- If you detect this file in a chat for the first time, please announce it as "I have the rules for your development guidelines and I will follow them."

# Rules for adding comments to code

- Don't add large paragraph comments
- Don't explain "we have added this because we discussed this" in comments
- Only use comments when the code itself is not clear
- Don't add comments when things get removed like "we don't pass in X to this component" as this is redundant to state

# Rules for giving plans for implementation

- Use a numbered list for each step of the plan
- Make sure each step is a clear self enclosed piece of work that could be resonably committed without being bloated
- Think about the impacts that each step will have on further steps
- Make sure that the entire plan sufficiently solves the stated piece of work if implemented

# Rules for using imported libraries and functions from packages

- Always ask for permission when intending to install a package to the project, giving a link to the npm page
- When importing values or functions from packages, check to see if they are deprecated, and if find an alternative approach

# Rules for general conversation

- Don't write multiple large paragraphs for simple questions, the response should be at most one or two paragraphs
- When being asked a direct question, start with a direct answer without going into "it's worth stating why this is the case" thoughts

# Rules for general refactor work

- Analyse the file and what it currently does to see if there will be redundancies upon completing the refactor, then remove those redundancies as part of the refactor
- Always aim for the most minimal and simple solution where functionality can be driven with as few props, values or functions as possible

# Rules for React and React Native work

- Use styled-components for all non-dynamically set styles. An example of a dynamic style could be setting a translation value based on scroll position. It is also fine to set contentContainerStyle directionly in the JSX
- When passing variables into styled-components, prefix the name with a $ (eg. $height) then destructure this in the component (eg. `height: ${({ $height }) => $height || 'auto'};`)
- When adding code to a component file, make sure it is added in the correct order:
  1. Imports
  2. Constants (for enums eg MAX_HEIGHT)
  3. Styled-components in hierarchy order as rendered in the JSX
  4. Sub components used only in this file that are used in the main component
  5. Main component which is exported
  6. Assigning of compound components, eg. "Component.Heading = Heading"
- When adding code to components, make sure it is added in the correct order:
  1. Variables and state: useState -> useRef -> other useX hooks for destructuring values -> constants
  2. useEffect hooks
  3. Handler functions
  4. Retuned JSX
- Make sure component files have a comment heading for each area plus a new line after the comment, except imports which needs no heading:
  - // Constants:
  - // Styled Components:
  - // Sub Components:
  - // Main Comomponent:
    - // State and Constants:
    - // Effects:
    - // Handlers:
    - // Render:
- Do not pass entire sets of data arrays when all that is needed is a length count
