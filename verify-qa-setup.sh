#!/bin/bash

echo "========================================="
echo "ParKing App - QA Setup Verification"
echo "========================================="
echo ""

# Check if required files exist
echo "📋 Checking Configuration Files..."
echo ""

files=(
  "jest.config.js:Jest Configuration"
  "jest.setup.js:Jest Setup"
  ".eslintrc.js:ESLint Configuration"
  "src/utils/accessibility.ts:Accessibility Helpers"
  "src/utils/sentry.ts:Sentry Error Monitoring"
  "src/components/ErrorBoundary.tsx:Error Boundary Component"
  "__tests__/services/authService.test.ts:Auth Service Tests"
  "__tests__/services/parkingService.test.ts:Parking Service Tests"
  "__tests__/services/paymentService.test.ts:Payment Service Tests"
  "__tests__/README.md:Testing Documentation"
  "QA_SETUP_SUMMARY.md:QA Summary"
)

for file_entry in "${files[@]}"; do
  IFS=':' read -r file desc <<< "$file_entry"
  if [ -f "$file" ]; then
    echo "✅ $desc"
  else
    echo "❌ $desc (MISSING: $file)"
  fi
done

echo ""
echo "📦 Checking NPM Scripts..."
echo ""

scripts=(
  "test:Run Tests"
  "test:watch:Watch Mode"
  "test:coverage:Coverage Report"
  "lint:Lint Code"
  "lint:fix:Auto-fix Issues"
  "type-check:TypeScript Check"
)

for script_entry in "${scripts[@]}"; do
  IFS=':' read -r script desc <<< "$script_entry"
  if grep -q "\"$script\"" package.json; then
    echo "✅ npm run $script - $desc"
  else
    echo "❌ npm run $script - $desc (MISSING)"
  fi
done

echo ""
echo "📊 Test Summary..."
echo ""

if [ -d "__tests__/services" ]; then
  test_count=$(find __tests__/services -name "*.test.ts" | wc -l | tr -d ' ')
  echo "✅ Service Tests: $test_count files"
else
  echo "❌ Service Tests: Directory not found"
fi

echo ""
echo "========================================="
echo "Setup Verification Complete!"
echo "========================================="
echo ""
echo "Next Steps:"
echo "1. Run tests: npm test"
echo "2. Check coverage: npm run test:coverage"
echo "3. Lint code: npm run lint"
echo "4. Read documentation: cat __tests__/README.md"
echo ""
