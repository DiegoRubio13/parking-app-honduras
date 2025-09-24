# ParKing App - Testing Documentation

## Overview

This directory contains comprehensive test suites for the ParKing application, ensuring code quality, reliability, and maintainability.

## Test Structure

```
__tests__/
├── services/          # Service layer tests
│   ├── authService.test.ts
│   ├── parkingService.test.ts
│   └── paymentService.test.ts
├── components/        # Component tests (to be added)
├── utils/            # Utility function tests (to be added)
└── README.md
```

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm run test:watch
```

### Run tests with coverage
```bash
npm run test:coverage
```

### Run specific test file
```bash
npm test -- authService.test.ts
```

## Test Coverage

The test suite aims for the following coverage thresholds:
- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%
- **Statements**: 70%

Current coverage can be viewed by running:
```bash
npm run test:coverage
```

## Writing Tests

### Test Structure

Follow the AAA pattern (Arrange-Act-Assert):

```typescript
describe('ServiceName', () => {
  describe('functionName', () => {
    it('should do something when condition is met', async () => {
      // Arrange - Set up test data and mocks
      const mockData = { ... };
      (mockFunction as jest.Mock).mockResolvedValue(mockData);

      // Act - Execute the function being tested
      const result = await functionName(params);

      // Assert - Verify the results
      expect(result).toEqual(expectedValue);
      expect(mockFunction).toHaveBeenCalledWith(expectedParams);
    });
  });
});
```

### Best Practices

1. **Test Behavior, Not Implementation**
   - Focus on what the code does, not how it does it
   - Test public APIs and user-facing behavior

2. **Use Descriptive Test Names**
   - Use clear, descriptive test names that explain the expected behavior
   - Format: "should [expected behavior] when [condition]"

3. **Mock External Dependencies**
   - Mock Firebase, API calls, and other external services
   - Use `jest.mock()` to mock modules

4. **Test Edge Cases**
   - Test error conditions
   - Test boundary values
   - Test null/undefined inputs

5. **Keep Tests Independent**
   - Each test should be able to run in isolation
   - Use `beforeEach()` to reset mocks and state

6. **Use Test Data Factories**
   - Create reusable test data generators
   - Keep test data consistent and maintainable

## Service Tests

### AuthService Tests
- User registration and login flows
- Phone verification (mock mode)
- User profile management
- Role-based access control (admin, guard, client)

### ParkingService Tests
- Parking session creation and management
- Parking spot allocation
- Session duration and cost calculation
- Statistics generation

### PaymentService Tests
- Payment package management
- Transaction processing (cash, transfer, card)
- Stripe integration
- Payment statistics

## Mocking Strategy

### Firebase Mocking

All Firebase services are mocked in `jest.setup.js`:

```javascript
jest.mock('./src/services/firebase', () => ({
  auth: { currentUser: null },
  db: {},
  storage: {},
}));
```

### Firestore Mocking

Firestore operations are mocked per test:

```typescript
(getDoc as jest.Mock).mockResolvedValue({
  exists: () => true,
  data: () => mockData,
});
```

## Continuous Integration

Tests are run automatically in CI/CD pipelines. Ensure all tests pass before merging code.

### Pre-commit Hooks (Recommended)

Set up Husky for pre-commit testing:

```bash
npm install --save-dev husky
npx husky install
npx husky add .husky/pre-commit "npm test"
```

## Debugging Tests

### Run tests in debug mode
```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```

### Use VS Code debugger
Add this configuration to `.vscode/launch.json`:

```json
{
  "type": "node",
  "request": "launch",
  "name": "Jest Debug",
  "program": "${workspaceFolder}/node_modules/.bin/jest",
  "args": ["--runInBand", "--no-cache"],
  "console": "integratedTerminal",
  "internalConsoleOptions": "neverOpen"
}
```

## Future Enhancements

1. **Component Testing**
   - Add React Native Testing Library tests for components
   - Test user interactions and UI state

2. **Integration Tests**
   - Test complete user flows
   - Test navigation between screens

3. **E2E Tests**
   - Use Detox or Appium for end-to-end testing
   - Test on real devices/emulators

4. **Snapshot Testing**
   - Add snapshot tests for component rendering
   - Ensure UI consistency

5. **Performance Testing**
   - Add performance benchmarks
   - Monitor test execution time

## Troubleshooting

### Common Issues

1. **Mock not being called**
   - Ensure mock is set up before test execution
   - Check if mock is being reset in `beforeEach()`

2. **Async test timing out**
   - Increase Jest timeout: `jest.setTimeout(10000)`
   - Ensure promises are properly awaited

3. **Module not found**
   - Check `moduleNameMapper` in `jest.config.js`
   - Verify import paths

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
- [Testing Best Practices](https://testingjavascript.com/)

## Contributing

When adding new features:
1. Write tests first (TDD approach recommended)
2. Ensure tests cover edge cases
3. Maintain test coverage above 70%
4. Update this README if adding new test patterns