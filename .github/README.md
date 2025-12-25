# GitHub Actions Workflows

This directory contains GitHub Actions workflows for automated CI/CD, testing, and deployment of the AI-News application.

## 📋 Available Workflows

### 🔄 `backend.yml`
**Triggers:** Push/PR to `backend/` directory
**Purpose:** Backend-specific CI/CD pipeline
- Multi-Node.js version testing (18.x, 20.x)
- Dependency installation and caching
- Linting, testing, building
- Security scanning with npm audit
- Dependency vulnerability checking
- Production deployment (when configured)

### 🎨 `frontend.yml`
**Triggers:** Push/PR to `frontend/` directory
**Purpose:** Frontend-specific CI/CD pipeline
- Multi-Node.js version testing (18.x, 20.x)
- TypeScript compilation checking
- Build verification
- Bundle size monitoring
- Lighthouse performance testing
- Security auditing
- AWS S3/CloudFront deployment (configurable)
- Vercel deployment (alternative)
- End-to-end testing with Playwright

### 🚀 `ci-cd.yml`
**Triggers:** Push/PR to any branch, manual dispatch
**Purpose:** Full-stack CI/CD pipeline
- Concurrent backend and frontend testing
- Security checks across both applications
- Automated deployment to staging/production
- Build artifact management
- Deployment notifications

### 🔍 `code-quality.yml`
**Triggers:** Push/PR, weekly schedule (Monday 2 AM UTC)
**Purpose:** Code quality and analysis
- ESLint and Prettier checks
- SonarCloud analysis
- Bundle size analysis
- Accessibility testing
- Internationalization checks
- License compliance
- Documentation verification

## 🔐 Required Secrets

Configure these secrets in your GitHub repository settings:

### Vercel Deployment (Primary)
```
VERCEL_TOKEN=your-vercel-token
VERCEL_ORG_ID=your-vercel-org-id
VERCEL_FRONTEND_PROJECT_ID=your-frontend-project-id
VERCEL_BACKEND_PROJECT_ID=your-backend-project-id
```

### Testing & Monitoring
```
SONAR_TOKEN=your-sonarcloud-token
FRONTEND_URL=https://your-frontend-domain.vercel.app
BACKEND_URL=https://your-backend-domain.vercel.app
```

### Notifications (optional)
```
SLACK_WEBHOOK_URL=your-slack-webhook
DISCORD_WEBHOOK_URL=your-discord-webhook
```

## 🛠️ Configuration Files

### Dependabot (`dependabot.yml`)
- Weekly dependency updates for backend and frontend
- GitHub Actions updates
- Automated PR creation with reviewers

### Workflow Features

#### 🧪 Testing Strategy
- **Matrix Testing:** Runs on multiple Node.js versions (18.x, 20.x)
- **Dependency Caching:** Fast CI runs with npm cache
- **Path-based Triggers:** Only runs when relevant files change

#### 🔒 Security
- **Dependency Auditing:** Regular security vulnerability checks
- **License Scanning:** Ensures compliance
- **Code Analysis:** SonarCloud integration for code quality

#### 🚀 Deployment
- **Staging/Production:** Environment-based deployments
- **Health Checks:** Post-deployment verification
- **Rollback Support:** Failed deployments don't go live

#### 📊 Monitoring
- **Performance Metrics:** Lighthouse scores tracking
- **Bundle Analysis:** Frontend bundle size monitoring
- **Accessibility:** Automated a11y testing

## 🚦 Workflow Status Badges

Add these badges to your README.md:

```markdown
### Backend
![Backend CI](https://github.com/your-username/AI-News/workflows/Backend%20CI/CD/badge.svg)

### Frontend
![Frontend CI](https://github.com/your-username/AI-News/workflows/Frontend%20CI/CD/badge.svg)

### Full Stack
![Full Stack CI](https://github.com/your-username/AI-News/workflows/Full%20Stack%20CI/CD/badge.svg)

### Code Quality
![Code Quality](https://github.com/your-username/AI-News/workflows/Code%20Quality/badge.svg)
```

## 🏃‍♂️ Manual Triggers

Most workflows run automatically, but you can manually trigger:

1. **Full Stack CI/CD:** Go to Actions → "Full Stack CI/CD" → "Run workflow"
2. **Code Quality:** Runs weekly automatically, or manually trigger

## 📝 Customization

### Branch Protection
Configure branch protection rules in repository settings:
- Require status checks to pass
- Require up-to-date branches
- Include administrators

### Environment Protection
For production deployments:
- Require manual approval
- Restrict to specific users/teams
- Add environment secrets

### Notification Setup

#### Slack Notifications
```yaml
- name: Notify Slack
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    webhook_url: ${{ secrets.SLACK_WEBHOOK_URL }}
```

#### Discord Notifications
```yaml
- name: Notify Discord
  uses: sarisia/actions-status-discord@v1
  with:
    webhook: ${{ secrets.DISCORD_WEBHOOK_URL }}
    status: ${{ job.status }}
```

## 🔧 Troubleshooting

### Common Issues

1. **Workflow not triggering:**
   - Check path filters in workflow triggers
   - Verify branch names (main vs master)

2. **Build failures:**
   - Check Node.js version compatibility
   - Verify dependency versions in package.json

3. **Deployment failures:**
   - Confirm secrets are configured correctly
   - Check AWS/Vercel credentials

4. **Test failures:**
   - Run tests locally first
   - Check test configuration files

### Debug Tips

- Use `actions/checkout@v4` with `fetch-depth: 0` for full git history
- Add `debug: true` to workflow for verbose logging
- Use workflow artifacts to download build outputs

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Dependabot Documentation](https://docs.github.com/en/code-security/dependabot)
- [SonarCloud Setup](https://sonarcloud.io/documentation)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)

---

For questions or issues with these workflows, please check the Actions tab in your repository or create an issue in this repository.
