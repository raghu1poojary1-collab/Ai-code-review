/* ─── app.js – AI Code Review Web App ─── */

document.addEventListener('DOMContentLoaded', () => {

  /* ══════════════════════════════════════
     1. NAVBAR SCROLL
  ══════════════════════════════════════ */
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });

  /* ══════════════════════════════════════
     2. HAMBURGER MENU
  ══════════════════════════════════════ */
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.querySelector('.nav-links');
  hamburger?.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });
  // Close on link click
  navLinks?.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => navLinks.classList.remove('open'));
  });

  /* ══════════════════════════════════════
     3. SCROLL REVEAL ANIMATION
  ══════════════════════════════════════ */
  const revealTargets = [
    '.feature-card', '.review-card', '.lang-card',
    '.step-card', '.stat', '.provider-chip',
    '.mcp-example', '.config-step', '.model-item',
    '.section-header'
  ];
  const allReveal = document.querySelectorAll(revealTargets.join(', '));
  allReveal.forEach(el => el.classList.add('reveal'));

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Stagger within the same parent
        const siblings = [...entry.target.parentElement.querySelectorAll('.reveal')];
        const idx = siblings.indexOf(entry.target);
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, Math.min(idx * 60, 400));
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  allReveal.forEach(el => revealObserver.observe(el));

  /* ══════════════════════════════════════
     4. MODEL PROVIDER TABS
  ══════════════════════════════════════ */
  const modelTabs   = document.querySelectorAll('.model-tab');
  const modelLists  = document.querySelectorAll('.model-list');

  modelTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const provider = tab.dataset.provider;
      modelTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      modelLists.forEach(list => {
        list.classList.toggle('hidden', list.dataset.provider !== provider);
      });
    });
  });

  /* ══════════════════════════════════════
     5. LIBRARY API TABS
  ══════════════════════════════════════ */
  const libTabs  = document.querySelectorAll('.lib-tab');
  const libCodes = document.querySelectorAll('.lib-code');

  libTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;
      libTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      libCodes.forEach(code => {
        code.classList.toggle('hidden', code.dataset.tab !== target);
      });
    });
  });

  /* ══════════════════════════════════════
     6. COPY BUTTONS
  ══════════════════════════════════════ */
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      // Prefer explicit data-code, else grab from nearest <code>
      let text = btn.dataset.code;
      if (!text) {
        const codeEl = btn.closest('.code-block')?.querySelector('pre code');
        text = codeEl?.textContent ?? '';
      }
      navigator.clipboard.writeText(text).then(() => {
        const orig = btn.textContent;
        btn.textContent = '✓ Copied!';
        btn.classList.add('copied');
        setTimeout(() => {
          btn.textContent = orig;
          btn.classList.remove('copied');
        }, 2000);
      });
    });
  });

  // MCP copy btn
  document.getElementById('copy-mcp')?.addEventListener('click', () => {
    const code = document.getElementById('mcp-code')?.textContent ?? '';
    navigator.clipboard.writeText(code).then(() => {
      const btn = document.getElementById('copy-mcp');
      btn.textContent = '✓ Copied!';
      btn.classList.add('copied');
      setTimeout(() => { btn.textContent = 'Copy'; btn.classList.remove('copied'); }, 2000);
    });
  });

  /* ══════════════════════════════════════
     7. LIVE DEMO SIMULATOR
  ══════════════════════════════════════ */
  const runDemoBtn    = document.getElementById('run-demo-btn');
  const demoBtnIcon   = document.getElementById('demo-btn-icon');
  const demoBtnText   = document.getElementById('demo-btn-text');
  const outputBody    = document.getElementById('output-body');
  const outputMeta    = document.getElementById('output-meta');

  const reviewTemplates = {
    'comprehensive': generateComprehensiveReview,
    'quick-fixes':   generateQuickFixReview,
    'security':      generateSecurityReview,
    'architectural': generateArchReview,
    'performance':   generatePerfReview,
    'unused-code':   generateUnusedCodeReview,
    'best-practices':generateBestPracticesReview,
    'evaluation':    generateEvaluationReview,
  };

  runDemoBtn?.addEventListener('click', async () => {
    const reviewType = document.getElementById('demo-review-type').value;
    const model      = document.getElementById('demo-model').value;
    const lang       = document.getElementById('demo-language').value;
    const code       = document.getElementById('demo-code').value.trim();

    if (!code) {
      shakeBtn(runDemoBtn);
      document.getElementById('demo-code').focus();
      return;
    }

    // Loading state
    demoBtnIcon.textContent = '';
    demoBtnText.textContent = 'Analyzing…';
    runDemoBtn.disabled = true;
    outputBody.innerHTML = `
      <div class="loading-state">
        <div class="spinner"></div>
        <p>Running <strong>${reviewType}</strong> review with <strong>${model}</strong>…</p>
      </div>`;
    outputMeta.textContent = 'Processing…';

    await sleep(1600 + Math.random() * 800);

    const generator = reviewTemplates[reviewType] ?? generateComprehensiveReview;
    const result = generator(code, model, lang);
    outputBody.innerHTML = renderReviewOutput(result);
    outputMeta.textContent = `${model} · ${lang} · ${new Date().toLocaleTimeString()}`;

    demoBtnIcon.textContent = '🚀';
    demoBtnText.textContent  = 'Run Review';
    runDemoBtn.disabled = false;
  });

  function shakeBtn(btn) {
    btn.style.animation = 'shake 0.4s ease';
    btn.addEventListener('animationend', () => btn.style.animation = '', { once: true });
  }

  // Inject shake keyframe
  const styleShake = document.createElement('style');
  styleShake.textContent = `
    @keyframes shake {
      0%,100%{transform:translateX(0)}
      20%{transform:translateX(-6px)}
      40%{transform:translateX(6px)}
      60%{transform:translateX(-4px)}
      80%{transform:translateX(4px)}
    }`;
  document.head.appendChild(styleShake);

  /* ─ Review output renderers ─ */
  function renderReviewOutput(result) {
    const findingsHtml = result.findings.map(f => `
      <div class="review-finding sev-${f.severity}">
        <div class="finding-top">
          <span class="finding-sev">${f.severity.toUpperCase()}</span>
          <span class="finding-title">${f.title}</span>
        </div>
        <p class="finding-desc">${f.description}</p>
        <p class="finding-rec">✅ ${f.recommendation}</p>
      </div>`).join('');

    return `
      <div class="review-result">
        <div class="review-header-out">
          <h4>${result.title}</h4>
          <div class="review-meta-row">
            <span>📊 ${result.findings.length} findings</span>
            <span>·</span>
            <span>⏱ ~${result.tokens} tokens</span>
            <span>·</span>
            <span>💰 ~$${result.cost}</span>
            <span>·</span>
            <span>Grade: <strong style="color:#818cf8">${result.grade}</strong></span>
          </div>
        </div>
        <p style="font-size:0.88rem;color:var(--text-secondary);line-height:1.65">${result.summary}</p>
        ${findingsHtml}
      </div>`;
  }

  /* ─ Review data generators ─ */
  function generateSecurityReview(code, model, lang) {
    const hasSqlConcat = /\+\s*['"]|query\s*\+|sql\s*\+/i.test(code);
    const hasEval = /eval\(/i.test(code);
    const hasHardcoded = /password\s*=\s*['"]|secret\s*=\s*['"]/i.test(code);

    const findings = [];

    if (hasSqlConcat) {
      findings.push({
        severity: 'critical',
        title: 'SQL Injection Vulnerability',
        description: 'String concatenation in SQL queries allows attackers to inject malicious SQL. An attacker can bypass authentication or extract all database records.',
        recommendation: 'Use parameterized queries or prepared statements. Replace string concatenation with placeholders: `db.query("SELECT * FROM users WHERE id = ?", [id])`'
      });
    }
    if (hasEval) {
      findings.push({
        severity: 'critical',
        title: 'Dangerous eval() Usage',
        description: 'eval() executes arbitrary code and can be exploited for remote code execution (RCE) if the input is user-controlled.',
        recommendation: 'Remove eval(). Use JSON.parse() for data, or refactor logic to avoid dynamic code execution entirely.'
      });
    }
    if (hasHardcoded) {
      findings.push({
        severity: 'high',
        title: 'Hardcoded Secret/Credential',
        description: 'Credentials embedded in source code will be exposed in version control history and any code repository access.',
        recommendation: 'Move secrets to environment variables or a secrets manager. Use process.env.SECRET_KEY and add .env to .gitignore.'
      });
    }
    findings.push({
      severity: 'medium',
      title: 'Missing Input Validation',
      description: 'No input sanitization detected before processing user-supplied data. This could enable XSS, injection, or business logic bypasses.',
      recommendation: 'Validate and sanitize all user inputs. Use a library like zod or joi for schema validation.'
    });
    findings.push({
      severity: 'low',
      title: 'Missing Rate Limiting',
      description: 'Endpoint has no rate limiting, making it susceptible to brute force attacks or denial of service.',
      recommendation: 'Add rate limiting middleware (e.g., express-rate-limit) to restrict requests per IP per time window.'
    });

    return {
      title: '🔒 Security Review Results',
      summary: `Security analysis detected ${findings.filter(f=>f.severity==='critical').length} critical, ${findings.filter(f=>f.severity==='high').length} high, and ${findings.filter(f=>f.severity==='medium').length} medium severity issues. Immediate remediation recommended for critical findings before deployment.`,
      findings,
      tokens: Math.floor(800 + Math.random() * 400),
      cost: (0.002 + Math.random() * 0.003).toFixed(4),
      grade: 'C+'
    };
  }

  function generateQuickFixReview(code, model, lang) {
    return {
      title: '⚡ Quick Fixes Review',
      summary: 'Fast analysis identified several immediate improvements to code quality, readability, and robustness. These can be applied quickly without major refactoring.',
      findings: [
        { severity: 'high', title: 'Missing Error Handling', description: 'Async operations lack try/catch blocks, which will cause unhandled promise rejections in Node.js.', recommendation: 'Wrap async calls in try/catch and handle errors with appropriate logging and user feedback.' },
        { severity: 'medium', title: 'Implicit Type Coercion', description: 'Using == instead of === may cause unexpected behavior due to JavaScript type coercion.', recommendation: 'Replace all == with === for strict equality checks.' },
        { severity: 'medium', title: 'Magic Numbers', description: 'Numeric literals like 86400 and 1000 are used without explanation, making code hard to maintain.', recommendation: 'Extract to named constants: const SECONDS_IN_A_DAY = 86400;' },
        { severity: 'low', title: 'Unused Variables', description: '2 variables declared but never used, adding noise and potential confusion.', recommendation: 'Remove unused variables or prefix with _ if intentionally unused.' },
      ],
      tokens: Math.floor(400 + Math.random() * 200),
      cost: (0.001 + Math.random() * 0.002).toFixed(4),
      grade: 'B-'
    };
  }

  function generateComprehensiveReview(code, model, lang) {
    return {
      title: '⭐ Comprehensive Review Results',
      summary: 'Full-spectrum analysis across security, performance, architecture, and code quality. Multiple actionable findings detected spanning all review dimensions.',
      findings: [
        { severity: 'critical', title: 'SQL Injection Risk', description: 'Dynamic SQL construction using string concatenation creates a critical injection vulnerability.', recommendation: 'Switch to parameterized queries immediately. All user input must be treated as untrusted data.' },
        { severity: 'high', title: 'No Authentication Check', description: 'The function executes without verifying the caller is authenticated, allowing unauthorized data access.', recommendation: 'Add authentication middleware that validates JWT tokens or session cookies before processing.' },
        { severity: 'medium', title: 'N+1 Query Pattern', description: 'Each iteration of the loop triggers a new database query, causing O(n) queries for n records.', recommendation: 'Use batch queries or JOIN operations to retrieve all data in a single round trip.' },
        { severity: 'low', title: 'Missing JSDoc Comments', description: 'Public functions lack documentation, making the API harder to understand for new contributors.', recommendation: 'Add JSDoc comments with @param, @returns, and @throws annotations to all exported functions.' },
      ],
      tokens: Math.floor(1200 + Math.random() * 600),
      cost: (0.004 + Math.random() * 0.005).toFixed(4),
      grade: 'C'
    };
  }

  function generateArchReview(code, model, lang) {
    return {
      title: '🏛️ Architectural Review Results',
      summary: 'Deep structural analysis reveals several design pattern violations and coupling issues that will hinder scalability and testability over time.',
      findings: [
        { severity: 'high', title: 'God Object Anti-Pattern', description: 'A single class manages too many responsibilities, violating the Single Responsibility Principle. This will be a bottleneck for testing and extension.', recommendation: 'Split into smaller, focused classes. Extract data access logic into a Repository and business rules into a Service.' },
        { severity: 'high', title: 'Tight Coupling to External APIs', description: 'Direct API calls embedded in business logic make it impossible to test without network access.', recommendation: 'Introduce an interface/adapter layer. Inject dependencies so they can be mocked in tests.' },
        { severity: 'medium', title: 'Missing Dependency Injection', description: 'Dependencies are instantiated directly inside functions rather than injected, reducing testability.', recommendation: 'Use a DI container or manual injection patterns to pass dependencies from the outside.' },
        { severity: 'low', title: 'Inconsistent Naming Conventions', description: 'Mix of camelCase and snake_case in variable names reduces readability across the codebase.', recommendation: 'Enforce a consistent naming convention via ESLint rules (e.g., @typescript-eslint/naming-convention).' },
      ],
      tokens: Math.floor(900 + Math.random() * 400),
      cost: (0.003 + Math.random() * 0.003).toFixed(4),
      grade: 'B-'
    };
  }

  function generatePerfReview(code, model, lang) {
    return {
      title: '📈 Performance Review Results',
      summary: 'Performance analysis identified critical bottlenecks that could cause 10-100x slowdowns at scale. Addressing these would significantly improve throughput and latency.',
      findings: [
        { severity: 'critical', title: 'Synchronous Blocking I/O', description: 'Synchronous file/DB operations block the event loop, preventing Node.js from handling other requests during I/O waits.', recommendation: 'Replace all sync operations with async/await versions: use readFile instead of readFileSync.' },
        { severity: 'high', title: 'Missing Response Caching', description: 'Identical queries are executed on every request with no caching, causing unnecessary database load.', recommendation: 'Add an in-memory cache (Redis or node-cache) with appropriate TTL for frequently accessed, stable data.' },
        { severity: 'medium', title: 'Unoptimized Array Operations', description: 'Array.filter().map() chains create intermediate arrays. With large datasets this causes unnecessary memory allocations.', recommendation: 'Use a single reduce() or for loop to avoid creating intermediate arrays.' },
        { severity: 'low', title: 'No Connection Pooling', description: 'A new database connection is created per request instead of reusing connections from a pool.', recommendation: 'Initialize a connection pool (e.g., pg.Pool) at startup and reuse connections across requests.' },
      ],
      tokens: Math.floor(700 + Math.random() * 300),
      cost: (0.0025 + Math.random() * 0.002).toFixed(4),
      grade: 'D+'
    };
  }

  function generateUnusedCodeReview(code, model, lang) {
    return {
      title: '🧹 Unused Code Review Results',
      summary: 'Static analysis detected dead code that can be safely removed to reduce bundle size, improve maintainability, and reduce confusion for new developers.',
      findings: [
        { severity: 'medium', title: '3 Unused Imports Detected', description: 'Imports for fs, path, and crypto are declared but never used in this file, adding to bundle size.', recommendation: 'Remove unused imports. Enable @typescript-eslint/no-unused-vars lint rule to catch these automatically.' },
        { severity: 'medium', title: 'Unreachable Code After Return', description: 'Code after an early return statement will never execute, adding confusion and maintenance burden.', recommendation: 'Remove or refactor the unreachable code block. Use a linter to catch these patterns automatically.' },
        { severity: 'low', title: '2 Deprecated Functions Still Present', description: 'Functions marked @deprecated in JSDoc are still defined in the codebase and not scheduled for removal.', recommendation: 'Create a migration plan and remove deprecated functions in the next major release.' },
        { severity: 'low', title: 'Commented-Out Code Blocks', description: 'Large blocks of commented-out code should be removed. Version control exists to restore old code if needed.', recommendation: 'Delete commented-out code. If experimental, put it behind a feature flag instead.' },
      ],
      tokens: Math.floor(500 + Math.random() * 200),
      cost: (0.0015 + Math.random() * 0.001).toFixed(4),
      grade: 'B+'
    };
  }

  function generateBestPracticesReview(code, model, lang) {
    return {
      title: '✅ Best Practices Review Results',
      summary: 'Analysis against current industry best practices and language idioms. Multiple opportunities to adopt modern patterns that improve code quality and maintainability.',
      findings: [
        { severity: 'high', title: 'Callback Hell – No Async/Await', description: 'Deeply nested callbacks make error handling complex and the code hard to follow. Modern JS/TS provides cleaner alternatives.', recommendation: 'Refactor to async/await. Use Promise.all() for parallel operations instead of sequential callbacks.' },
        { severity: 'medium', title: 'Missing TypeScript Strict Mode', description: 'Strict mode is not enabled in tsconfig, allowing implicit any and loose null checks that hide bugs.', recommendation: 'Add "strict": true to tsconfig.json. This enables all strict type checking options for maximum safety.' },
        { severity: 'medium', title: 'No Logging Framework', description: 'Using console.log for production logging lacks log levels, structured output, and transport configuration.', recommendation: 'Use a structured logger like pino or winston. Include correlation IDs for request tracing.' },
        { severity: 'low', title: 'Long Functions (>50 lines)', description: '2 functions exceed 50 lines and should be decomposed into smaller, single-purpose helpers for readability.', recommendation: 'Extract distinct steps into named helper functions. Each function should do one thing and be fully testable.' },
      ],
      tokens: Math.floor(600 + Math.random() * 250),
      cost: (0.002 + Math.random() * 0.002).toFixed(4),
      grade: 'B'
    };
  }

  function generateEvaluationReview(code, model, lang) {
    return {
      title: '🎓 Code Evaluation Results',
      summary: 'Comprehensive developer skill assessment with academic grading. This evaluation assesses functionality, code quality, documentation, testing awareness, and security consciousness.',
      findings: [
        { severity: 'high', title: 'Skill Level: Intermediate (Mid-Level)', description: 'Code demonstrates solid fundamentals with room to grow. Shows understanding of core language features but not yet leveraging advanced patterns consistently.', recommendation: 'Focus on design patterns, testing strategies, and security best practices to reach Senior level.' },
        { severity: 'medium', title: 'Functionality: B+ (87/100)', description: 'Core functionality works correctly. Edge cases around null/undefined inputs are not fully handled.', recommendation: 'Add guard clauses for unexpected inputs and write unit tests to document expected behavior.' },
        { severity: 'medium', title: 'Code Quality: B (82/100)', description: 'Readable and mostly consistent style, but function complexity is higher than ideal in 2 places.', recommendation: 'Apply refactoring to reduce cyclomatic complexity. Aim for functions with a single clear purpose.' },
        { severity: 'low', title: 'Documentation: C+ (77/100)', description: 'Inline comments exist but JSDoc is missing from all exported functions. API consumers will struggle.', recommendation: 'Add JSDoc to all public functions. Consider generating API documentation with TypeDoc.' },
      ],
      tokens: Math.floor(1100 + Math.random() * 500),
      cost: (0.003 + Math.random() * 0.004).toFixed(4),
      grade: 'B / 84'
    };
  }

  function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

  /* ══════════════════════════════════════
     8. ACTIVE NAV LINK (SCROLL SPY)
  ══════════════════════════════════════ */
  const sections = document.querySelectorAll('section[id]');
  const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');

  const spyObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navAnchors.forEach(a => {
          a.style.color = '';
          a.style.background = '';
          if (a.getAttribute('href') === `#${entry.target.id}`) {
            a.style.color = 'var(--text-primary)';
          }
        });
      }
    });
  }, { threshold: 0.5 });

  sections.forEach(s => spyObserver.observe(s));

  /* ══════════════════════════════════════
     9. SMOOTH COUNTER ANIMATION FOR STATS
  ══════════════════════════════════════ */
  function animateCounter(el, end, duration = 1200, suffix = '') {
    const start = 0;
    const startTime = performance.now();
    const num = parseFloat(end);
    const isInt = Number.isInteger(num);

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = eased * num;
      el.textContent = (isInt ? Math.floor(value) : value.toFixed(1)) + suffix;
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const numEl = entry.target.querySelector('.stat-num');
        if (numEl) {
          const text = numEl.textContent;
          const suffix = text.replace(/[\d.]/g, '');
          const num = parseFloat(text);
          if (!isNaN(num)) animateCounter(numEl, num, 1000, suffix);
        }
        statsObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.stat').forEach(s => statsObserver.observe(s));

});
