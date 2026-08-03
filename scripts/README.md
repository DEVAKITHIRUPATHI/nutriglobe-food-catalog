# Food Data Generation Scripts

This directory contains scripts for generating comprehensive food data using the Claude API. These scripts will parse the provided food lists and generate multilingual food items with nutritional information.

## Available Scripts

1. **process-vegetables.ts** - Process vegetable data and generate food items
2. **process-fruits.ts** - Process fruit data and generate food items
3. **batch-process-foods.ts** - Process data from all food categories
4. **update-database.ts** - Update the database with generated food items

## How to Run

You can run these scripts using the following commands:

```bash
# To process vegetables
npx tsx scripts/process-vegetables.ts

# To process fruits
npx tsx scripts/process-fruits.ts

# To process all food categories
npx tsx scripts/batch-process-foods.ts

# To update the database
npx tsx scripts/update-database.ts
```

## Generated Output

Each script will generate a JSON file with the processed food items:

- `generated-vegetables.json` - Contains vegetable data
- `generated-fruits.json` - Contains fruit data
- `generated-foods.json` - Contains data from all food categories

## Requirements

These scripts require the `ANTHROPIC_API_KEY` environment variable to be set in order to use the Claude API for generating multilingual content and nutritional information.

## Note

For testing purposes, the scripts are currently configured to process only a small subset of items. To process all items, modify the `subset` variables in each script.