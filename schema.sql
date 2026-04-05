-- Step 2: Supabase Schema Setup

-- 1. Create Tables
-- Note: 'user_id' automatically links to Supabase's built-in Auth system

-- Daily Targets Table (1日の目標カロリー・PFC)
CREATE TABLE daily_targets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    target_kcal INTEGER NOT NULL,
    target_protein INTEGER NOT NULL,
    target_fat INTEGER NOT NULL,
    target_carbs INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(user_id, date)
);

-- Meals Table (食事記録)
CREATE TABLE meals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    image_url TEXT,
    description TEXT,
    kcal INTEGER NOT NULL,
    protein INTEGER NOT NULL,
    fat INTEGER NOT NULL,
    carbs INTEGER NOT NULL,
    confidence_score INTEGER CHECK (confidence_score >= 0 AND confidence_score <= 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Trainings Table (トレーニング記録)
CREATE TABLE trainings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    training_type TEXT NOT NULL CHECK (training_type IN ('gym', 'practice', 'game')),
    name TEXT,
    weight NUMERIC,
    reps INTEGER,
    sets INTEGER,
    rpe INTEGER CHECK (rpe >= 1 AND rpe <= 10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Conditions Table (コンディション記録)
CREATE TABLE conditions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    lightness INTEGER CHECK (lightness >= 1 AND lightness <= 5), -- 身体の軽さ (1-5)
    appetite INTEGER CHECK (appetite >= 1 AND appetite <= 5), -- 食欲 (1-5)
    vertical_jump NUMERIC, -- 垂直跳び
    sleep_score INTEGER, -- 睡眠スコア/時間等
    resting_hr INTEGER, -- 起床時心拍
    weight NUMERIC, -- 体重
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(user_id, date)
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE daily_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainings ENABLE ROW LEVEL SECURITY;
ALTER TABLE conditions ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies (ユーザーは自身のデータのみアクセス可能)
-- daily_targets
CREATE POLICY "Users can manage their own daily targets" ON daily_targets
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- meals
CREATE POLICY "Users can manage their own meals" ON meals
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- trainings
CREATE POLICY "Users can manage their own trainings" ON trainings
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- conditions
CREATE POLICY "Users can manage their own conditions" ON conditions
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 4. Storage Bucket Setup for Meal Images
INSERT INTO storage.buckets (id, name, public) VALUES ('meal_images', 'meal_images', true);

CREATE POLICY "Users can upload their own meal images" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'meal_images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Anyone can view meal images" ON storage.objects
    FOR SELECT USING (bucket_id = 'meal_images');

CREATE POLICY "Users can delete their own meal images" ON storage.objects
    FOR DELETE USING (bucket_id = 'meal_images' AND auth.uid()::text = (storage.foldername(name))[1]);
