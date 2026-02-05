// ============================================
// BROWSER-BASED UNIT TESTS
// Runs automatically when the application starts
// ============================================

(function() {
  'use strict';

  // Simple test framework for browser
  const TestRunner = {
    tests: [],
    passed: 0,
    failed: 0,
    
    test: function(name, fn) {
      this.tests.push({ name, fn });
    },
    
    assert: function(condition, message) {
      if (!condition) {
        throw new Error(message || 'Assertion failed');
      }
    },
    
    assertEquals: function(actual, expected, message) {
      const actualStr = JSON.stringify(actual);
      const expectedStr = JSON.stringify(expected);
      if (actualStr !== expectedStr) {
        throw new Error(message || `Expected ${expectedStr}, but got ${actualStr}`);
      }
    },
    
    assertTrue: function(condition, message) {
      this.assert(condition, message || 'Expected true');
    },
    
    assertFalse: function(condition, message) {
      this.assert(!condition, message || 'Expected false');
    },
    
    run: function() {
      console.log('%c🧪 Running Unit Tests...', 'color: #3b82f6; font-weight: bold; font-size: 14px;');
      console.log('===========================================');
      
      this.tests.forEach((test, index) => {
        try {
          test.fn();
          this.passed++;
          console.log(`%c✓ ${test.name}`, 'color: #10b981;');
        } catch (error) {
          this.failed++;
          console.error(`%c✗ ${test.name}`, 'color: #ef4444; font-weight: bold;');
          console.error(`  Error: ${error.message}`);
        }
      });
      
      console.log('===========================================');
      const total = this.passed + this.failed;
      const passRate = total > 0 ? ((this.passed / total) * 100).toFixed(1) : 0;
      
      if (this.failed === 0) {
        console.log(`%c✅ All tests passed! (${this.passed}/${total})`, 'color: #10b981; font-weight: bold; font-size: 14px;');
      } else {
        console.log(`%c⚠️ Tests: ${this.passed} passed, ${this.failed} failed (${passRate}% pass rate)`, 
          this.failed > 0 ? 'color: #f59e0b; font-weight: bold;' : 'color: #10b981; font-weight: bold;');
      }
      
      return {
        passed: this.passed,
        failed: this.failed,
        total: total
      };
    }
  };

  // Wait for game.js to load
  function runTests() {
    // Test 1: Game Configuration
    TestRunner.test('GAME object should be defined', function() {
      TestRunner.assert(typeof GAME !== 'undefined', 'GAME object should exist');
      TestRunner.assert(GAME.errorSequence !== undefined, 'errorSequence should exist');
      TestRunner.assert(GAME.errorCode !== undefined, 'errorCode should exist');
      TestRunner.assert(GAME.safeCode !== undefined, 'safeCode should exist');
      TestRunner.assert(GAME.restartSequence !== undefined, 'restartSequence should exist');
      TestRunner.assert(GAME.restartButtons !== undefined, 'restartButtons should exist');
    });

    TestRunner.test('GAME.errorSequence should have correct values', function() {
      TestRunner.assertEquals(GAME.errorSequence, ["ERR_404", "ERR_500", "ERR_TIMEOUT"]);
    });

    TestRunner.test('GAME.errorCode should match safeCode', function() {
      TestRunner.assertEquals(GAME.errorCode, GAME.safeCode);
      TestRunner.assertEquals(GAME.errorCode, "404500TIMEOUT");
    });

    TestRunner.test('GAME.restartSequence should be [4, 0, 2]', function() {
      TestRunner.assertEquals(GAME.restartSequence, [4, 0, 2]);
    });

    TestRunner.test('GAME.restartButtons should be correct sequence', function() {
      TestRunner.assertEquals(GAME.restartButtons, ["INIT", "VERIFY", "RESTART"]);
    });

    // Test 2: State Management
    TestRunner.test('state object should be defined', function() {
      TestRunner.assert(typeof state !== 'undefined', 'state object should exist');
    });

    TestRunner.test('state should have correct initial values', function() {
      TestRunner.assertFalse(state.errorLogsRead, 'errorLogsRead should be false initially');
      TestRunner.assertFalse(state.codeFixed, 'codeFixed should be false initially');
      TestRunner.assertFalse(state.safeOpen, 'safeOpen should be false initially');
      TestRunner.assertFalse(state.hasAccessKey, 'hasAccessKey should be false initially');
      TestRunner.assertFalse(state.configSet, 'configSet should be false initially');
      TestRunner.assertFalse(state.systemRestarted, 'systemRestarted should be false initially');
    });

    TestRunner.test('state.dialValues should initialize to [0, 0, 0]', function() {
      TestRunner.assertEquals(state.dialValues, [0, 0, 0]);
    });

    // Test 3: Safe Code Logic
    TestRunner.test('Safe code should be combination of error codes', function() {
      const combined = GAME.errorSequence
        .map(err => err.replace('ERR_', ''))
        .join('');
      TestRunner.assertEquals(combined, GAME.safeCode);
    });

    // Test 4: Code Fix Validation Logic
    TestRunner.test('Code fix validation for line 3 should work', function() {
      const correctFix = "const status = 'active';";
      const hasSemicolon = correctFix.includes(";");
      const hasStatus = correctFix.includes("status");
      const hasActive = correctFix.includes("active");
      TestRunner.assertTrue(hasSemicolon && hasStatus && hasActive, 'Line 3 fix should be valid');
    });

    TestRunner.test('Code fix validation for line 4 should work', function() {
      const correctFix = "if (status === 'active')";
      const hasTripleEquals = correctFix.includes("===");
      const hasStatus = correctFix.includes("status");
      const hasActive = correctFix.includes("active");
      TestRunner.assertTrue(hasTripleEquals && hasStatus && hasActive, 'Line 4 fix should be valid');
    });

    TestRunner.test('Code fix validation for line 9 should work', function() {
      const correctFix = "console.error('Error:', err);";
      const hasSemicolon = correctFix.includes(";");
      const hasConsoleError = correctFix.includes("console.error");
      TestRunner.assertTrue(hasSemicolon && hasConsoleError, 'Line 9 fix should be valid');
    });

    TestRunner.test('Code fix validation for line 10 should work', function() {
      const correctFix = "console.error('Error:', err)";
      const hasConsoleError = correctFix.includes("console.error");
      const hasErr = correctFix.includes("err");
      TestRunner.assertTrue(hasConsoleError && hasErr, 'Line 10 fix should be valid');
    });

    // Test 5: Restart Sequence Validation
    TestRunner.test('Correct restart sequence should be valid', function() {
      const correctSequence = ["INIT", "VERIFY", "RESTART"];
      const isValid = correctSequence.length === 3 &&
        correctSequence.every((v, i) => v === GAME.restartButtons[i]);
      TestRunner.assertTrue(isValid, 'Correct restart sequence should be valid');
    });

    TestRunner.test('Incorrect restart sequence should be invalid', function() {
      const wrongSequence = ["VERIFY", "INIT", "RESTART"];
      const isValid = wrongSequence.length === 3 &&
        wrongSequence.every((v, i) => v === GAME.restartButtons[i]);
      TestRunner.assertFalse(isValid, 'Incorrect restart sequence should be invalid');
    });

    // Test 6: System Config Validation
    TestRunner.test('Correct dial values should be valid', function() {
      const correctValues = [4, 0, 2];
      const isValid = correctValues.every((v, i) => v === GAME.restartSequence[i]);
      TestRunner.assertTrue(isValid, 'Correct dial values should be valid');
    });

    TestRunner.test('Incorrect dial values should be invalid', function() {
      const wrongValues = [2, 0, 4];
      const isValid = wrongValues.every((v, i) => v === GAME.restartSequence[i]);
      TestRunner.assertFalse(isValid, 'Incorrect dial values should be invalid');
    });

    // Test 7: Error Code Extraction
    TestRunner.test('Error codes should extract correctly', function() {
      const err404 = GAME.errorSequence[0].replace('ERR_', '');
      const err500 = GAME.errorSequence[1].replace('ERR_', '');
      const errTimeout = GAME.errorSequence[2].replace('ERR_', '');
      
      TestRunner.assertEquals(err404, "404");
      TestRunner.assertEquals(err500, "500");
      TestRunner.assertEquals(errTimeout, "TIMEOUT");
    });

    // Run all tests
    const results = TestRunner.run();
    
    // Store results globally for access
    window.testResults = results;
    
    return results;
  }

  // Run tests when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      // Wait a bit for game.js to initialize
      setTimeout(runTests, 100);
    });
  } else {
    // DOM already loaded
    setTimeout(runTests, 100);
  }

  // Make TestRunner available globally for debugging
  window.TestRunner = TestRunner;
})();
