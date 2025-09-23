# Gluko


[![GitHub Workflow Status (static)](https://img.shields.io/github/actions/workflow/status/gcharest/gluko/static.yml?branch=main&label=Static%20Pages&logo=github&style=flat-square)](https://github.com/gcharest/gluko/actions/workflows/static.yml)

Gluko is a web application designed to help individuals more accurately calculate the carbohydrate content in their meals. By providing an easy-to-use interface and leveraging the [Canadian Nutrient File database](https://food-nutrition.canada.ca/cnf-fce/?lang=eng), Gluko simplifies carb counting and ensures precision in determining the carb factor of various nutrients.

## Features

- 🧮 **Meal Calculator**: Calculate total carbohydrates in your meals by combining different ingredients
- 🔍 **Carb Factor Search**: Quick access to carbohydrate content of common foods
- 📊 **Nutrient Information**: Detailed nutritional information from the Canadian Nutrient File
- 🌐 **Bilingual Support**: Available in English and French
- 🌙 **Dark Mode**: Comfortable viewing in any lighting condition
- 📱 **Responsive Design**: Works on desktop and mobile devices

## Why Gluko?

Managing Type 1 Diabetes requires constant attention to carbohydrate intake to determine proper insulin dosing. Gluko aims to make this process easier by:
- Providing quick access to reliable nutritional information
- Enabling easy calculation of complex meals
- Offering a user-friendly interface for daily use
- Using official Canadian nutritional data

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

3. **Development Server**
   ```sh
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:5173` to see the application

4. **Building for Production**
   ```sh
   npm run build
   ```
   The production-ready files will be in the `dist` directory

5. **Running Tests**
   - Unit Tests:
     ```sh
     npm run test:unit
   - End-to-End Tests:
     ```sh
        npx playwright install
     ```
        npm run test:e2e
     ```    

## Contributing

Contributions are welcome! Whether it's:

- Reporting bugs
- Suggesting enhancements
- Improving documentation
- Submitting pull requests

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.