# Instructions for Gemini AI

## Your Task
You are tasked with creating a comprehensive README.md file for this NestJS application. Your ONLY responsibility is to write the README - do not modify, suggest changes to, or comment on the codebase itself.

## Critical Rules
- ❌ DO NOT modify any code files
- ❌ DO NOT suggest code improvements or refactoring
- ❌ DO NOT include emojis or icons in the README
- ❌ DO NOT create additional documentation files (ONLY README.md)
- ✅ ONLY analyze the codebase to write an accurate README
- ✅ Use plain text and standard markdown formatting
- ✅ Be factual and based on actual code, not assumptions

## Analysis Instructions
1. Examine the entire codebase structure
2. Review `package.json` for dependencies and scripts
3. Analyze the `src/` directory structure and modules
4. Identify environment variables from `.env.example` or config files
5. Review API endpoints and their purposes
6. Note authentication/authorization mechanisms
7. Identify database setup and entities
8. Check for testing setup

## README Structure Required

The README must contain these sections in this order:

### 1. Project Title and Description
- Application name
- Brief 2-3 sentence description of what the app does
- Tech stack overview (NestJS version, database, etc.)

### 2. Features
- List main features/modules of the application
- Be specific based on actual code, not generic

### 3. Prerequisites
- Node.js version required
- Database requirements
- Any other system dependencies

### 4. Installation
```bash
# Step-by-step commands
```

### 5. Configuration
- Environment variables needed (list them with descriptions)
- Configuration files that need setup
- Example `.env` structure

### 6. Database Setup
- Migration commands
- Seeding instructions (if applicable)
- Database schema overview

### 7. Running the Application
```bash
# Development
# Production
# Other modes
```

### 8. API Documentation
- Base URL
- Authentication method
- List of main endpoint groups (don't list every single endpoint, just main modules)
- Link to Swagger/OpenAPI docs if available

### 9. Testing
```bash
# Unit tests
# E2E tests
# Test coverage
```

### 10. Project Structure
```
src/
├── modules/
├── common/
├── config/
└── main.ts
```
Brief explanation of main directories

### 11. Scripts
- List and explain npm scripts from package.json

### 12. Deployment
- Build commands
- Deployment considerations
- Environment-specific notes

### 13. Contributing (Optional)
- Only include if there's actual contribution guidelines

### 14. License
- Mention license if present in package.json

## Writing Style
- Professional and technical tone
- Use code blocks for commands and file structures
- Be concise but complete
- Use headers (##, ###) for organization
- Use bullet points for lists
- Use tables for environment variables if there are many
- NO emojis, NO decorative icons, NO badges (unless they're functional like CI/CD status)

## Example of What NOT to Do
❌ "# 🚀 Awesome Project"
❌ "⚡ Lightning fast API"
❌ "🔥 Hot features"
❌ Suggesting code improvements
❌ Creating API documentation files

## Example of What TO Do
✅ "# Personal Information Management API"
✅ "A RESTful API built with NestJS for managing personal information"
✅ Plain, professional markdown formatting
✅ Accurate information based on actual code

## Output Format
Provide the complete README.md content in a single code block:

```markdown
# Project Title

[Full README content here]
```

## Begin Analysis
Now, please analyze this NestJS codebase and generate the README.md file following the structure and rules above.