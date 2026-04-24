# Platform-Specific Crash Patterns

Common crash categories by platform and recommended AI agents.
Use the section matching the platform detected in STEP 3.

---

## Android Crash Patterns

### A. ViewBinding / Fragment Lifecycle (Claude Code Recommended)
- Null ViewBinding references after fragment detach
- Fragment lifecycle state violations (`isAdded`, `isDetached` checks)
- Fragment transaction on destroyed activity
- BaseVbFragment binding cleanup issues
- **AI Capability**: Complex lifecycle analysis and defensive coding

### B. Activity Lifecycle Management (Codex Recommended)
- Activity state restoration failures
- Configuration change handling (`onSaveInstanceState`)
- Background/foreground transition crashes
- `onPause`/`onStop` race conditions
- **AI Capability**: Lifecycle refactoring and state management

### C. Android API Compatibility (Gemini CLI Recommended)
- `SCHEDULE_EXACT_ALARM` permission (Android 12+)
- Foreground service restrictions (Android 14+)
- Target SDK compatibility issues
- Background execution limitations
- Scoped storage migration issues
- **AI Capability**: API compliance and compatibility analysis

### D. Memory and Resources (Codex + Claude Code)
- OutOfMemoryError on bitmap/image loading
- Resource leaks (Cursor, Stream, Connection not closed)
- Memory pressure in large lists/adapters
- Large asset handling without compression
- **AI Capability**: Resource management and memory optimization

### E. Threading and Concurrency (Claude Code Recommended)
- Main thread violations (network/disk on UI thread)
- Race conditions in shared state
- Deadlocks in synchronized blocks
- Background thread accessing destroyed Activity/Fragment
- **AI Capability**: Complex concurrency analysis and thread-safe implementations

### F. Performance: ANR and Slow Frames (Gemini CLI Recommended)
- Main thread blocked by I/O or heavy computation
- RecyclerView slow bind operations
- Overdraw and GPU performance issues
- Cold start time optimization
- **AI Capability**: Performance profiling and algorithmic improvements

---

## iOS Crash Patterns

### A. UIViewController Lifecycle (Claude Code Recommended)
- Accessing view after dealloc
- `viewDidLoad` called before `init` completes
- Navigation controller stack corruption
- Modal presentation on dismissed controller
- **AI Capability**: Complex iOS lifecycle analysis

### B. Auto Layout and UI Issues (Codex Recommended)
- Ambiguous or unsatisfiable constraints
- Dynamic type / accessibility size crashes
- Safe area handling on notch devices
- UICollectionView/UITableView cell reuse issues
- **AI Capability**: UI code refactoring

### C. iOS API Compatibility (Gemini CLI Recommended)
- iOS version-specific API deprecations
- App Transport Security non-compliance
- Background app refresh limitations
- Privacy manifest requirements (iOS 17+)
- **AI Capability**: iOS API compliance analysis

### D. Memory Management (Claude Code Recommended)
- Strong retain cycles in closures
- Delegate properties not marked `weak`
- `NSCache` / image cache pressure
- Large video/audio assets in memory
- **AI Capability**: Memory graph analysis and cycle detection

### E. Threading and Concurrency (Claude Code Recommended)
- UI updates off main thread
- `DispatchQueue` misuse causing races
- `NSManagedObjectContext` thread violations
- Async/await cancellation crashes (iOS 15+)
- **AI Capability**: Swift concurrency analysis

### F. Performance: Hangs and Slow UI (Gemini CLI Recommended)
- Main thread blocked by synchronous network
- Expensive `viewDidLayoutSubviews` computations
- Core Data fetch on main thread
- Image decoding on main thread
- **AI Capability**: iOS performance profiling

---

## Flutter Crash Patterns

### A. Flutter Engine Lifecycle (Claude Code Recommended)
- Engine initialization / disposal crashes
- Widget tree disposed while async operation running
- `setState` called after `dispose`
- Navigation stack corruption
- **AI Capability**: Complex Flutter architecture analysis

### B. Platform Channel Integration (Codex Recommended)
- Method channel call on destroyed activity/controller
- Platform channel type mismatch errors
- Plugin version incompatibility crashes
- Platform-specific permissions not granted
- **AI Capability**: Cross-platform integration

### C. Flutter Performance Issues (Gemini CLI Recommended)
- Excessive widget rebuilds (missing `const`, wrong `key`)
- Heavy work on main isolate
- Memory leaks in `StreamController` / `AnimationController`
- Large image assets not using `ResizeImage`
- **AI Capability**: Flutter performance optimization

### D. State Management (Claude Code Recommended)
- Accessing `BuildContext` after widget disposal
- Provider/Bloc stream not closed
- Race conditions in async state updates
- `InheritedWidget` rebuilds causing cascades
- **AI Capability**: State architecture analysis

### E. Dart VM and Native Crashes (Gemini CLI Recommended)
- Stack overflow from unbounded recursion
- Dart-to-native type conversion errors
- FFI memory management issues
- Platform-specific rendering crashes
- **AI Capability**: Low-level Dart/native analysis

---

## Common Patterns (All Platforms)

### Network and API Issues
- Request timeout without proper retry logic
- SSL certificate pinning failures
- Parsing unexpected API response shapes
- Offline mode not handled gracefully
- **AI Capability**: Network resilience patterns

### Location / GPS Issues
- Permission denied crash (not caught)
- GPS unavailable on low-end devices
- Background location restrictions
- **AI Capability**: Permission and hardware fallback patterns

### Third-Party SDK Issues
- SDK initialization before app is ready
- SDK version incompatibility with OS
- Analytics/crash SDK circular dependency
- **AI Capability**: SDK integration review

---

## AI Agent Assignment Guide

| Crash Category | Recommended Agent | Reason |
|---|---|---|
| Lifecycle crashes | Claude Code | Complex state analysis |
| API compatibility | Gemini CLI | Strong compliance knowledge |
| Code refactoring | Codex | Bulk file editing |
| Performance/ANR | Gemini CLI | Profiling expertise |
| Concurrency | Claude Code | Thread-safety analysis |
| Test suites | Amp | Collaborative debugging |
