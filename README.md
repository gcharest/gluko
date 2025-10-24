# Gluko

[![Deploy static content to Pages](https://github.com/gcharest/gluko/actions/workflows/deploy_static_site.yml/badge.svg)](https://github.com/gcharest/gluko/actions/workflows/deploy_static_site.yml)
[![Code Quality Checks](https://github.com/gcharest/gluko/actions/workflows/code_quality.yml/badge.svg)](https://github.com/gcharest/gluko/actions/workflows/code_quality.yml)
[![Accessibility Tests](https://github.com/gcharest/gluko/actions/workflows/accessibility.yml/badge.svg)](https://github.com/gcharest/gluko/actions/workflows/accessibility.yml)
[![CodeQL Advanced](https://github.com/gcharest/gluko/actions/workflows/codeql.yml/badge.svg)](https://github.com/gcharest/gluko/actions/workflows/codeql.yml)

Gluko is a web application designed to help individuals and families more accurately calculate the carbohydrate content in their meals.
By providing an easy-to-use interface and leveraging the [Canadian Nutrient File database](https://food-nutrition.canada.ca/cnf-fce/?lang=eng), Gluko simplifies carb counting and ensures precision in determining the carb factor of various nutrients.

## Features

- 🧮 **Meal Calculator**: Calculate total carbohydrates in your meals by combining different ingredients
- 🔍 **Carb Factor Search**: Quick access to carbohydrate content of common foods
- 📊 **Nutrient Information**: Detailed nutritional information from the Canadian Nutrient File
- 🌐 **Bilingual Support**: Available in English and French
- 🌙 **Dark Mode**: Comfortable viewing in any lighting condition
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 🗂️ **Meal History**: Save, view, and filter past meals for easy tracking and review
- 👨‍👧‍👦 **Multi-Subject Support**: Manage meal history for multiple subjects (e.g., parents with multiple children living with Type 1 Diabetes)
- 🔎 **Advanced Filtering**: Filter meal history by date range, subject, and tags

## Why Gluko?

Managing Type 1 Diabetes requires constant attention to carbohydrate intake to determine proper insulin dosing. Gluko aims to make this process easier by:

- Providing quick access to reliable nutritional information
- Enabling easy calculation of complex meals
- Offering a user-friendly interface for daily use
- Using official Canadian nutritional data
- Supporting families and caregivers with multi-subject management and meal tracking

## Experimental

This project is experimental and not intended for medical use. Always consult with a healthcare professional for medical advice and insulin dosing.

## Getting Started

### Using the Application

Visit [https://gcharest.github.io/gluko/](https://gcharest.github.io/gluko/) to start using Gluko right away.

### Development Setup

If you want to contribute to the project or run it locally:

1. **Prerequisites**
   - Node.js (v22 recommended)
   - npm

2. **Installation**

   ```sh
   npm install
   ```

3. **Development Server**

   ```sh
   npm run dev
   ```

   Open your browser and navigate to `http://localhost:5173` to see the application
  
   ## Run locally (cross-platform)

   Recommended (cross-platform, uses bundled helper):

   ```sh
   npm run dev:local
   ```

   This runs a small Node helper that computes the git short SHA and ISO build date, sets `VERSION` and `BUILD_DATE` for the Vite process, and starts the dev server. Use this on Windows, macOS and Linux.

   Manual one-liners (if you prefer to set envs yourself):

   Windows cmd.exe:

   ```cmd
   set VERSION=abcd123 && set BUILD_DATE=2025-10-23T12:00:00Z && npx vite
   ```

   PowerShell:

   ```powershell
   $env:VERSION = 'abcd123'; $env:BUILD_DATE = '2025-10-23T12:00:00Z'; npx vite
   ```

   Notes:
   - The helper script (`npm run dev:local`) prefers the locally installed `vite` binary and will fail with a message instructing you to run `npm ci` if devDependencies are missing.
   - Setting environment variables inline differs between shells; prefer the helper for simplicity.

4. **Building for Production**

   ```sh
   npm run build
   ```

   The production-ready files will be in the dist directory

5. **Running Tests**
   - Unit Tests:

     ```sh
     npm run test:unit
     ```

   - End-to-End Tests:

     ```sh
     npx playwright install
     npm run test:e2e
     ```

## Contributing

Contributions are welcome! Whether it's:

- Reporting bugs
- Suggesting enhancements
- Improving documentation
- Submitting pull requests

## License

This project is licensed under the MIT License - see the LICENSE file for details.
