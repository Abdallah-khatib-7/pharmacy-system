USE pharmacy;

-- Active Ingredients
INSERT INTO active_ingredients (name) VALUES
('Ibuprofen'),
('Paracetamol'),
('Amoxicillin'),
('Omeprazole'),
('Metformin'),
('Atorvastatin'),
('Amlodipine'),
('Losartan'),
('Azithromycin'),
('Cetirizine'),
('Loratadine'),
('Metronidazole'),
('Ciprofloxacin'),
('Diclofenac'),
('Pantoprazole'),
('Simvastatin'),
('Lisinopril'),
('Doxycycline'),
('Tramadol'),
('Codeine');

-- Medications
INSERT INTO medications (ingredient_id, brand_name, dosage, form, stock, expiry) VALUES
-- Ibuprofen (id=1)
(1, 'Profinal', '400mg', 'tablet', 120, '2027-06-01'),
(1, 'Profinal XP', '400mg', 'tablet', 8, '2026-09-15'),
(1, 'Advil', '200mg', 'tablet', 95, '2027-03-20'),
(1, 'Brufen', '400mg', 'syrup', 40, '2026-08-10'),
(1, 'Nurofen', '200mg', 'tablet', 3, '2026-07-01'),

-- Paracetamol (id=2)
(2, 'Panadol', '500mg', 'tablet', 200, '2027-12-01'),
(2, 'Panadol Extra', '500mg', 'tablet', 150, '2027-08-15'),
(2, 'Acamol', '500mg', 'tablet', 12, '2026-09-01'),
(2, 'Dymadon', '250mg', 'syrup', 60, '2027-01-20'),
(2, 'Tempra', '120mg', 'syrup', 5, '2026-07-15'),

-- Amoxicillin (id=3)
(3, 'Amoxil', '500mg', 'capsule', 80, '2027-04-10'),
(3, 'Augmentin', '625mg', 'tablet', 45, '2026-11-30'),
(3, 'Clamoxyl', '250mg', 'syrup', 30, '2026-10-15'),
(3, 'Trimox', '500mg', 'capsule', 7, '2026-08-20'),

-- Omeprazole (id=4)
(4, 'Losec', '20mg', 'capsule', 100, '2027-09-01'),
(4, 'Prilosec', '20mg', 'tablet', 75, '2027-06-15'),
(4, 'Omez', '40mg', 'capsule', 9, '2026-07-30'),

-- Metformin (id=5)
(5, 'Glucophage', '500mg', 'tablet', 180, '2027-11-01'),
(5, 'Glucophage XR', '1000mg', 'tablet', 90, '2027-08-20'),
(5, 'Diaformin', '850mg', 'tablet', 11, '2026-09-10'),

-- Atorvastatin (id=6)
(6, 'Lipitor', '20mg', 'tablet', 110, '2027-10-15'),
(6, 'Torvast', '40mg', 'tablet', 6, '2026-08-01'),
(6, 'Atorva', '10mg', 'tablet', 85, '2027-05-20'),

-- Amlodipine (id=7)
(7, 'Norvasc', '5mg', 'tablet', 130, '2027-12-10'),
(7, 'Amlor', '10mg', 'tablet', 4, '2026-07-20'),
(7, 'Istin', '5mg', 'tablet', 70, '2027-09-05'),

-- Losartan (id=8)
(8, 'Cozaar', '50mg', 'tablet', 95, '2027-07-15'),
(8, 'Losartan STADA', '100mg', 'tablet', 13, '2026-10-01'),

-- Azithromycin (id=9)
(9, 'Zithromax', '500mg', 'tablet', 55, '2027-04-20'),
(9, 'Azithrocin', '250mg', 'capsule', 40, '2026-11-15'),
(9, 'Zitrocin', '200mg', 'syrup', 8, '2026-08-30'),

-- Cetirizine (id=10)
(10, 'Zyrtec', '10mg', 'tablet', 160, '2027-10-01'),
(10, 'Cetirin', '10mg', 'tablet', 90, '2027-06-20'),
(10, 'Alerid', '5mg', 'syrup', 6, '2026-07-10'),

-- Loratadine (id=11)
(11, 'Claritin', '10mg', 'tablet', 140, '2027-11-20'),
(11, 'Clarityne', '10mg', 'tablet', 75, '2027-08-10'),
(11, 'Lorfast', '5mg', 'syrup', 10, '2026-09-25'),

-- Metronidazole (id=12)
(12, 'Flagyl', '500mg', 'tablet', 100, '2027-05-15'),
(12, 'Metrozine', '250mg', 'tablet', 7, '2026-08-05'),
(12, 'Flagyl', '125mg', 'syrup', 45, '2027-02-10'),

-- Ciprofloxacin (id=13)
(13, 'Ciprobay', '500mg', 'tablet', 65, '2027-07-01'),
(13, 'Ciproxin', '250mg', 'tablet', 9, '2026-09-15'),

-- Diclofenac (id=14)
(14, 'Voltaren', '50mg', 'tablet', 110, '2027-08-20'),
(14, 'Cataflam', '25mg', 'tablet', 80, '2027-04-10'),
(14, 'Voltaren Gel', '1%', 'cream', 5, '2026-07-25'),

-- Pantoprazole (id=15)
(15, 'Controloc', '40mg', 'tablet', 95, '2027-09-30'),
(15, 'Pantoloc', '20mg', 'tablet', 11, '2026-10-20'),

-- Simvastatin (id=16)
(16, 'Zocor', '20mg', 'tablet', 85, '2027-06-10'),
(16, 'Simvast', '40mg', 'tablet', 4, '2026-08-15'),

-- Lisinopril (id=17)
(17, 'Zestril', '10mg', 'tablet', 120, '2027-11-05'),
(17, 'Prinivil', '20mg', 'tablet', 8, '2026-09-20'),

-- Doxycycline (id=18)
(18, 'Vibramycin', '100mg', 'capsule', 70, '2027-05-25'),
(18, 'Doxylin', '100mg', 'tablet', 6, '2026-07-05'),

-- Tramadol (id=19)
(19, 'Tramal', '50mg', 'capsule', 60, '2027-03-15'),
(19, 'Ultram', '100mg', 'tablet', 9, '2026-08-25'),

-- Codeine (id=20)
(20, 'Codipront', '30mg', 'tablet', 45, '2027-04-05'),
(20, 'Codipar', '15mg', 'tablet', 3, '2026-07-18');

-- Suppliers
INSERT INTO suppliers (name, contact_person, phone, email, address) VALUES
('Mersaco', 'Ahmad Hassoun', '01123456', 'ahmad@mersaco.com', 'Beirut, Hamra'),
('Pharmaline', 'Georges Khalil', '01234567', 'georges@pharmaline.com', 'Beirut, Achrafieh'),
('Omnipharma', 'Rania Sleiman', '03456789', 'rania@omnipharma.com', 'Jounieh'),
('CTS', 'Mariam Haddad', '01345678', 'mariam@cts.com', 'Beirut, Verdun');