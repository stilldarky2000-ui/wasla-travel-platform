# Reproducible dependency installation

## Cause and scoped fix

A fresh npm ci failed with EUSAGE because package-lock.json did not describe the dependencies declared in package.json. Attempting to regenerate it normally then failed with ERESOLVE: the root declared esbuild ^0.25.0, while the locked Vite 8.3.8 requires the optional peer esbuild ^0.27.0 or ^0.28.0.

The root esbuild range is now ^0.28.2. package-lock.json was regenerated with npm install --package-lock-only, without --force or --legacy-peer-deps. The other direct application dependency ranges were preserved. The refreshed lock also includes the previously missing dependencies and the automatically resolved react-is peer required by Recharts. npm ls --all reports no dependency problems.

The previously reported Babel ETARGET could not be reproduced with current registry metadata: @babel/helper-string-parser 7.29.15 is available and is installed successfully. No Babel override, arbitrary Babel downgrade or application-code workaround was added.

bun.lock was regenerated using Bun 1.4.5, and a frozen lockfile-only validation passed. The fresh runtime installation, unit tests, emulator tests and production build below were verified using npm, not a full Bun runtime install.

## Verification

Validation used Windows, Node 26.13.0 and npm 11.20.0 in a separate directory with an ordinary freshly created node_modules directory (not the existing dependency junctions). The fresh install commands were:

- npm ci
- npm ci --prefix functions
- npm test
- npm run lint
- npm run build
- npm ls --all

All succeeded. The Firestore emulator/Express HTTP integration suite was also run against that freshly installed application tree using the existing external Firebase CLI/Java test tools. See the cumulative verification report for test counts. A clean install and build on this Windows workstation do not replace staging checks of the deployed Google runtimes and real provider credentials.

## Remaining audit findings

npm audit reports 8 affected-package entries (4 high and 4 moderate), including dependency chains through @grpc/grpc-js/Firebase and glob/minimatch/Workbox/PWA tooling. These counts include dependent packages, not eight separate independent exploits. They require a separate compatibility and security review. No npm audit fix --force, major downgrade or unrelated dependency override was applied as part of the installation fix.

No production service, secret or database was modified.
