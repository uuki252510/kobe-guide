-- photo_reference カラムを追加
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS photo_reference TEXT;
