-- Update payment methods to include QR code payment and remove online option
ALTER TYPE payment_method RENAME TO payment_method_old;

CREATE TYPE payment_method AS ENUM ('qr_code', 'cash', 'card');

-- Update orders table to use new payment method enum
ALTER TABLE orders 
ALTER COLUMN payment_method DROP DEFAULT;

ALTER TABLE orders 
ALTER COLUMN payment_method TYPE payment_method 
USING 
  CASE 
    WHEN payment_method::text = 'online' THEN 'qr_code'::payment_method
    WHEN payment_method::text = 'offline' THEN 'cash'::payment_method
    ELSE 'qr_code'::payment_method
  END;

ALTER TABLE orders 
ALTER COLUMN payment_method SET DEFAULT 'qr_code';

-- Drop the old enum type
DROP TYPE payment_method_old;