-- Supabase'de yeni kolonlar eklemek için

-- Topics tablosuna sinav_turu kolonu ekle
ALTER TABLE topics ADD COLUMN IF NOT EXISTS sinav_turu TEXT DEFAULT 'TYT' CHECK (sinav_turu IN ('TYT', 'AYT'));

-- Tasks tablosuna verilme_tarihi kolonu ekle
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS verilme_tarihi TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Mevcut topics için sinav_turu güncelle (ders adından çıkar)
UPDATE topics SET sinav_turu = 'TYT' WHERE ders LIKE '%TYT%' OR sinav_turu IS NULL;
UPDATE topics SET sinav_turu = 'AYT' WHERE ders LIKE '%AYT%';
