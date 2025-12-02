-- ============================================
-- TYT-AYT COACHING SYSTEM - DATABASE EXPANSION
-- Mevcut tabloları BOZMADAN sadece genişletme
-- ============================================

-- 1. STUDENTS tablosuna onboarding alanları EKLE
ALTER TABLE students 
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS sinif VARCHAR(20),
ADD COLUMN IF NOT EXISTS hedef_siralama INTEGER,
ADD COLUMN IF NOT EXISTS gunluk_calisma_suresi INTEGER,
ADD COLUMN IF NOT EXISTS guclu_dersler TEXT[],
ADD COLUMN IF NOT EXISTS zayif_dersler TEXT[],
ADD COLUMN IF NOT EXISTS deneme_ortalamasi DECIMAL,
ADD COLUMN IF NOT EXISTS kullanilan_kaynaklar TEXT[],
ADD COLUMN IF NOT EXISTS program_onceligi VARCHAR(20);

-- 2. TOPICS tablosuna analiz alanları EKLE
ALTER TABLE topics
ADD COLUMN IF NOT EXISTS importance_level VARCHAR(20) DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS question_density INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS mastery_level INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS recommended_daily_questions INTEGER DEFAULT 5;

-- 3. EXAMS tablosuna detaylı net ve analiz alanları EKLE
ALTER TABLE exams
ADD COLUMN IF NOT EXISTS net_math DECIMAL DEFAULT 0,
ADD COLUMN IF NOT EXISTS net_science DECIMAL DEFAULT 0,
ADD COLUMN IF NOT EXISTS net_turkish DECIMAL DEFAULT 0,
ADD COLUMN IF NOT EXISTS net_social DECIMAL DEFAULT 0,
ADD COLUMN IF NOT EXISTS exam_type VARCHAR(20) DEFAULT 'Mixed',
ADD COLUMN IF NOT EXISTS accuracy_rate DECIMAL DEFAULT 0,
ADD COLUMN IF NOT EXISTS weak_topics TEXT[];

-- 4. YENİ TABLO: Bildirimler
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. YENİ TABLO: Deneme Konu Performansı
CREATE TABLE IF NOT EXISTS exam_topics_performance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id VARCHAR(255) NOT NULL,
    topic_id VARCHAR(255) NOT NULL,
    correct INTEGER DEFAULT 0,
    wrong INTEGER DEFAULT 0,
    blank INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. YENİ TABLO: Günlük Soru Takibi
CREATE TABLE IF NOT EXISTS soru_takip (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    lesson VARCHAR(100) NOT NULL,
    topic VARCHAR(255),
    source VARCHAR(255),
    solved INTEGER DEFAULT 0,
    correct INTEGER DEFAULT 0,
    wrong INTEGER DEFAULT 0,
    blank INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. YENİ TABLO: Kaynak Kitap Takibi
CREATE TABLE IF NOT EXISTS students_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id VARCHAR(255) NOT NULL,
    source_name VARCHAR(255) NOT NULL,
    progress_percent INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. YENİ TABLO: Haftalık Plan
CREATE TABLE IF NOT EXISTS weekly_plan (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id VARCHAR(255) NOT NULL,
    week_start DATE NOT NULL,
    tasks JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index'ler (Performans için)
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_exam_performance_exam ON exam_topics_performance(exam_id);
CREATE INDEX IF NOT EXISTS idx_soru_takip_student ON soru_takip(student_id);
CREATE INDEX IF NOT EXISTS idx_soru_takip_date ON soru_takip(date);
CREATE INDEX IF NOT EXISTS idx_sources_student ON students_sources(student_id);
CREATE INDEX IF NOT EXISTS idx_weekly_plan_student ON weekly_plan(student_id);

-- RLS (Row Level Security) Policies
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_topics_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE soru_takip ENABLE ROW LEVEL SECURITY;
ALTER TABLE students_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_plan ENABLE ROW LEVEL SECURITY;

-- Public access policies (development)
CREATE POLICY "Enable all for notifications" ON notifications FOR ALL USING (true);
CREATE POLICY "Enable all for exam_performance" ON exam_topics_performance FOR ALL USING (true);
CREATE POLICY "Enable all for soru_takip" ON soru_takip FOR ALL USING (true);
CREATE POLICY "Enable all for sources" ON students_sources FOR ALL USING (true);
CREATE POLICY "Enable all for weekly_plan" ON weekly_plan FOR ALL USING (true);
