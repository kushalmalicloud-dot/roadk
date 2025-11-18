-- Add missing enum values for food_type
ALTER TYPE food_type ADD VALUE IF NOT EXISTS 'egg';

-- Add missing enum values for meal_category
ALTER TYPE meal_category ADD VALUE IF NOT EXISTS 'soups';
ALTER TYPE meal_category ADD VALUE IF NOT EXISTS 'manchurian';