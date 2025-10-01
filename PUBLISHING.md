# Publishing Guide

This guide explains how to publish `crash-to-vibe` to npm.

## Pre-Publishing Checklist

- [ ] Update `author` email in [package.json](package.json)
- [ ] Update repository URLs if different from `github.com/mekari/crash-to-vibe`
- [ ] Test the tool locally with multiple project types (Android, iOS, Flutter)
- [ ] Review [README.md](README.md) for accuracy
- [ ] Ensure [LICENSE](LICENSE) file exists
- [ ] Run `npm pack --dry-run` to verify package contents

## Publishing Steps

### 1. Create npm Account (if needed)

If you don't have an npm account:
```bash
# Visit https://www.npmjs.com/signup
# Or create via CLI:
npm adduser
```

### 2. Login to npm

```bash
npm login
```

You'll be prompted for:
- **Username**: Your npm username
- **Password**: Your npm password
- **Email**: Your email (will be public)
- **OTP**: One-time password if 2FA is enabled

### 3. Verify Login

```bash
npm whoami
```

Should display your npm username.

### 4. Check Package Name Availability

```bash
npm search crash-to-vibe
```

If the name is taken, you have two options:
1. Choose a different name (update `name` in package.json)
2. Publish as a scoped package: `@your-username/crash-to-vibe`

### 5. Test Package Contents

```bash
# See what will be published
npm pack --dry-run

# Create actual tarball for testing
npm pack

# Test installation locally
npm install -g ./crash-to-vibe-1.0.0.tgz

# Test the installed package
cd /path/to/test/mobile/project
crash-to-vibe

# Clean up test installation
npm uninstall -g crash-to-vibe
rm crash-to-vibe-1.0.0.tgz
```

### 6. Publish to npm

```bash
# Publish (public package)
npm publish

# Or if using scoped package:
npm publish --access public
```

### 7. Verify Publication

```bash
# Check on npm registry
npm info crash-to-vibe

# View package page
# Visit: https://www.npmjs.com/package/crash-to-vibe
```

### 8. Test Global Installation

```bash
# Install from npm
npm install -g crash-to-vibe

# Test in a real project
cd /path/to/mobile/project
crash-to-vibe

# Should work with all command aliases:
crash-analyzer
generate-crash-analyzer
```

## Post-Publishing

### Update README.md

After successful publication, update [README.md](README.md) to reflect that the package is now available:

1. Remove the "not yet published" note
2. Confirm `npm install -g crash-to-vibe` instructions are correct
3. Add npm badge (optional):
   ```markdown
   [![npm version](https://badge.fury.io/js/crash-to-vibe.svg)](https://www.npmjs.com/package/crash-to-vibe)
   [![npm downloads](https://img.shields.io/npm/dm/crash-to-vibe.svg)](https://www.npmjs.com/package/crash-to-vibe)
   ```

### Create Git Tag

```bash
git tag v1.0.0
git push origin v1.0.0
```

### Create GitHub Release

1. Go to your GitHub repository
2. Click "Releases" → "Create a new release"
3. Tag: `v1.0.0`
4. Title: `v1.0.0 - Initial Release`
5. Description: Copy relevant parts from README.md

## Publishing Updates

### Patch Release (1.0.0 → 1.0.1)
```bash
npm version patch
npm publish
git push && git push --tags
```

### Minor Release (1.0.0 → 1.1.0)
```bash
npm version minor
npm publish
git push && git push --tags
```

### Major Release (1.0.0 → 2.0.0)
```bash
npm version major
npm publish
git push && git push --tags
```

## Troubleshooting

### "Package name already taken"
- Choose a different name, or
- Use scoped package: `@mekari/crash-to-vibe`
- Update `name` in package.json

### "Need to login"
```bash
npm logout
npm login
```

### "Permission denied"
- Ensure you're logged in: `npm whoami`
- Check package name ownership: `npm owner ls crash-to-vibe`

### "Invalid package.json"
- Validate: `npm pack --dry-run`
- Check required fields: name, version, main/bin

### 2FA Issues
- Enable 2FA for security: https://docs.npmjs.com/configuring-two-factor-authentication
- Use npm tokens for CI/CD: https://docs.npmjs.com/creating-and-viewing-access-tokens

## Package Maintenance

### Unpublish Package (within 72 hours)
```bash
npm unpublish crash-to-vibe@1.0.0
```

⚠️ **Warning**: Unpublishing is permanent and breaks dependents!

### Deprecate Package
```bash
npm deprecate crash-to-vibe@1.0.0 "Use version 1.0.1 instead"
```

### Transfer Ownership
```bash
npm owner add <username> crash-to-vibe
npm owner rm <username> crash-to-vibe
```

## Resources

- [npm Publishing Guide](https://docs.npmjs.com/cli/v8/commands/npm-publish)
- [package.json Documentation](https://docs.npmjs.com/cli/v8/configuring-npm/package-json)
- [Semantic Versioning](https://semver.org/)
- [npm Best Practices](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)