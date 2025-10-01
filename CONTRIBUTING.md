# Contributing to ShowCall

Thank you for considering contributing to ShowCall! This document provides guidelines and instructions for contributing.

## 🐛 Reporting Bugs

Before creating a bug report:
1. Check the [existing issues](https://github.com/trevormarrr/showcall/issues)
2. Verify you're using the latest version
3. Test in mock mode to isolate the issue

When reporting bugs, include:
- ShowCall version
- Operating system and version
- Resolume Arena version
- Steps to reproduce
- Expected vs actual behavior
- Console logs (if applicable)
- Screenshots (if relevant)

## 💡 Suggesting Enhancements

Enhancement suggestions are welcome! Please:
1. Check existing feature requests first
2. Clearly describe the feature and use case
3. Explain why it would be useful to most users
4. Consider implementation complexity

## 🔧 Development Setup

### Prerequisites
- Node.js 16+ 
- npm or yarn
- Git
- Resolume Arena (optional, can use mock mode)

### Setup
```bash
# Fork and clone the repository
git clone https://github.com/YOUR-USERNAME/showcall.git
cd showcall

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your settings
nano .env

# Run in development mode
npm run dev
```

### Development Workflow

1. **Create a branch** for your feature/fix:
   ```bash
   git checkout -b feature/my-new-feature
   # or
   git checkout -b fix/issue-description
   ```

2. **Make your changes** following code style:
   - Use consistent indentation (2 spaces)
   - Add comments for complex logic
   - Use meaningful variable names
   - Keep functions focused and small

3. **Test your changes**:
   - Test in mock mode: `MOCK=1 npm run dev`
   - Test with real Resolume connection
   - Test on your platform (macOS/Windows/Linux)
   - Verify no console errors

4. **Commit your changes**:
   ```bash
   git add .
   git commit -m "feat: add new feature description"
   # or
   git commit -m "fix: resolve issue description"
   ```

   Use conventional commits:
   - `feat:` - New feature
   - `fix:` - Bug fix
   - `docs:` - Documentation only
   - `style:` - Code style changes
   - `refactor:` - Code refactoring
   - `perf:` - Performance improvement
   - `test:` - Adding tests
   - `chore:` - Build/tooling changes

5. **Push and create Pull Request**:
   ```bash
   git push origin feature/my-new-feature
   ```
   Then create a PR on GitHub.

## 📝 Code Style

### JavaScript
- ES6+ syntax
- Async/await over promises
- Descriptive variable names
- Comments for non-obvious code
- Error handling for all async operations

### Example:
```javascript
// Good
async function triggerClip(layer, column) {
  try {
    const address = `/composition/layers/${layer}/clips/${column}/connect`;
    await sendOSC(address, 1);
    console.log(`✅ Triggered L${layer}C${column}`);
    return { ok: true };
  } catch (error) {
    console.error(`❌ Trigger failed:`, error.message);
    return { ok: false, error: error.message };
  }
}

// Avoid
function trigger(l, c) {
  sendOSC(`/composition/layers/${l}/clips/${c}/connect`, 1);
}
```

### File Organization
- `server.js` - Backend logic, OSC, REST API
- `public/app.js` - Frontend logic, UI interactions
- `public/index.html` - HTML structure
- `public/styles.css` - Styling
- `electron/main.cjs` - Electron main process

## 🧪 Testing

### Manual Testing Checklist
- [ ] Connection to Resolume works
- [ ] Clip triggering works
- [ ] Column triggering works
- [ ] Clear all works
- [ ] Cut/resync works
- [ ] Grid auto-populates correctly
- [ ] Expand/collapse controls work
- [ ] Presets execute properly
- [ ] Keyboard shortcuts work
- [ ] Connection indicators accurate
- [ ] Mock mode works

### Testing in Mock Mode
```bash
# Edit .env
MOCK=1

# Run app
npm run dev
```

Mock mode simulates Resolume responses for UI testing.

## 🏗️ Building

### Development Build
```bash
npm run dev
```

### Production Build
```bash
# Package without creating installer (fast)
npm run pack

# Build full installer/DMG/AppImage
npm run dist
```

### Platform-Specific
Built apps will be in the `dist/` folder.

## 📦 Pull Request Process

1. **Update documentation** if needed (README, CHANGELOG, etc.)
2. **Add to CHANGELOG.md** under "Unreleased" section
3. **Ensure builds pass** on your platform
4. **Describe your changes** clearly in PR description
5. **Link related issues** using "Fixes #123" or "Related to #456"
6. **Wait for review** - be responsive to feedback

## 🎯 Focus Areas

Areas where contributions are especially welcome:

### High Priority
- Cross-platform testing
- Bug fixes and stability
- Performance improvements
- Documentation improvements

### Medium Priority
- UI/UX enhancements
- New preset actions/macro types
- Keyboard shortcut improvements
- Configuration options

### Future Features
- MIDI controller support
- Custom themes/layouts
- Clip thumbnails
- Effect controls integration
- Mobile app version

## ❓ Questions?

- **General questions**: [GitHub Discussions](https://github.com/trevormarrr/showcall/discussions)
- **Bug reports**: [GitHub Issues](https://github.com/trevormarrr/showcall/issues)
- **Feature requests**: [GitHub Issues](https://github.com/trevormarrr/showcall/issues)

## 📜 Code of Conduct

Be respectful and constructive. We're all here to build something useful for the community.

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to ShowCall! 🎉
