# Build Icons Placeholder

This directory should contain app icons for different platforms:

## macOS
- **icon.icns** - Required for macOS builds
  - Use an icon generator to create from a 1024×1024 PNG
  - Tool: https://cloudconvert.com/png-to-icns

## Windows
- **icon.ico** - Required for Windows builds
  - Multiple sizes: 16×16, 32×32, 48×48, 64×64, 128×128, 256×256
  - Tool: https://cloudconvert.com/png-to-ico

## Linux
- **icon.png** - Required for Linux builds
  - Recommended size: 512×512 or 1024×1024 PNG

## Creating Icons

1. **Design a 1024×1024 PNG** with your ShowCall logo/icon
2. **Use online converters** to create platform-specific formats:
   - PNG → ICNS (macOS)
   - PNG → ICO (Windows)
   - PNG → PNG (Linux, just resize if needed)

3. **Place files in this directory**:
   ```
   build/
   ├── icon.icns    (macOS)
   ├── icon.ico     (Windows)
   └── icon.png     (Linux)
   ```

## Temporary Placeholder

Until you create custom icons, electron-builder will use default Electron icons.
To build without errors, you can remove the `icon` properties from package.json.

## Icon Design Tips

- Use simple, recognizable design
- Ensure it works at small sizes (16×16)
- Use transparency where appropriate
- Match your brand/app aesthetic
- Test on different backgrounds
