# Contributing to Marjoram

Thank you for your interest in contributing to Marjoram! This document provides guidelines and information for contributors.

## Code of Conduct

This project adheres to a code of conduct. By participating, you are expected to uphold this code.

## Getting Started

### Development Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/marjoram.git
   cd marjoram
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

### Development Scripts

- `npm run dev` - Start development server with hot reload
- `npm test` - Run test suite
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues automatically
- `npm run format` - Format code with Prettier
- `npm run build` - Build the library
- `npm run type-check` - Run TypeScript type checking

## Contributing Guidelines

### Code Style

We use ESLint and Prettier to maintain consistent code style:

- Follow the existing code style
- Use meaningful variable and function names
- Add JSDoc comments for public APIs
- Prefer explicit types over `any`

### Commit Messages

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat: add new feature`
- `fix: bug fix`
- `docs: documentation changes`
- `style: code style changes (formatting, etc)`
- `refactor: code refactoring`
- `test: adding or updating tests`
- `chore: maintenance tasks`

### Testing

- Write tests for new features and bug fixes
- Ensure all tests pass before submitting
- Aim for high test coverage
- Use descriptive test names

### Pull Request Process

1. Ensure your code follows the style guidelines
2. Add tests for new functionality
3. Update documentation if necessary
4. Ensure all tests pass
5. Create a pull request with a clear description

### Types of Contributions

#### Bug Reports

When filing bug reports, please include:

- A clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Browser/environment information
- Minimal code example

#### Feature Requests

For feature requests, please include:

- Clear description of the feature
- Use case and motivation
- Possible implementation approach
- Any breaking changes

#### Documentation

Documentation improvements are always welcome:

- Fix typos and grammar
- Improve examples
- Add missing documentation
- Clarify confusing sections

## Development Guidelines

### Architecture

Marjoram follows these architectural principles:

- **Zero dependencies**: Keep the library dependency-free
- **Type safety**: Maintain strong TypeScript support
- **Performance**: Optimize for speed and bundle size
- **Security**: Prevent XSS vulnerabilities
- **Developer experience**: Provide clear APIs and good error messages

### File Structure

```
src/
├── index.ts              # Main exports
├── view/                 # View-related functionality
│   ├── view.ts          # Main html template function
│   ├── types.ts         # View type definitions
│   ├── external/        # External view utilities
│   └── internal/        # Internal view utilities
├── useViewModel/         # ViewModel functionality
│   ├── useViewModel.ts  # Main useViewModel function
│   └── types.ts         # ViewModel type definitions
└── schema/              # Schema and reactive system
    ├── index.ts
    ├── useSchema.ts
    ├── schemaPropFactory.ts
    └── types.ts
```

### Adding New Features

When adding new features:

1. Start with tests (TDD approach)
2. Implement the feature
3. Update TypeScript types
4. Add documentation
5. Update examples if relevant

### Performance Considerations

- Minimize DOM operations
- Use efficient algorithms
- Consider memory usage
- Profile performance-critical code
- Maintain small bundle size

## Release Process

Releases are handled by maintainers:

1. Version bump following semantic versioning
2. Update changelog
3. Create GitHub release
4. Publish to npm

## Getting Help

- Check existing issues and discussions
- Ask questions in GitHub issues
- Reach out to maintainers

## Recognition

Contributors will be recognized in:

- README.md contributors section
- GitHub releases
- Package.json contributors field

Thank you for contributing to Marjoram! 🌿
