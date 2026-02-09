-- ================================================
-- Migration 005: Reestructura Proyecto > HU > Subtareas
-- (Idempotente - seguro de re-ejecutar)
-- ================================================

-- STEP 1: Crear tabla user_stories (Historias de Usuario)
CREATE TABLE IF NOT EXISTS user_stories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
    story_points INT,
    story_points_override BOOLEAN DEFAULT FALSE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- STEP 2: Crear tabla acceptance_criteria (Criterios de Aceptacion)
CREATE TABLE IF NOT EXISTS acceptance_criteria (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_story_id UUID NOT NULL REFERENCES user_stories(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- STEP 3: Crear tabla subtasks (Subtareas)
CREATE TABLE IF NOT EXISTS subtasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_story_id UUID NOT NULL REFERENCES user_stories(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT CHECK (status IN ('backlog', 'in_progress', 'done')) DEFAULT 'backlog',
    assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
    type TEXT CHECK (type IN ('frontend', 'backend', 'testing', 'devops', 'design', 'other')) DEFAULT 'other',
    story_points INT,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- STEP 4: Crear tabla user_story_documents
CREATE TABLE IF NOT EXISTS user_story_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_story_id UUID NOT NULL REFERENCES user_stories(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- STEP 5: Crear tabla user_story_links
CREATE TABLE IF NOT EXISTS user_story_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_story_id UUID NOT NULL REFERENCES user_stories(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    title TEXT,
    type TEXT DEFAULT 'external',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- STEP 6: Actualizar voting_sessions para referenciar subtasks
DROP POLICY IF EXISTS "Users can view voting sessions of accessible projects" ON voting_sessions;
DROP POLICY IF EXISTS "Users can view votes of accessible sessions" ON votes;
DROP POLICY IF EXISTS "Anyone can view voting sessions" ON voting_sessions;

ALTER TABLE voting_sessions ADD COLUMN IF NOT EXISTS subtask_id UUID REFERENCES subtasks(id) ON DELETE CASCADE;
ALTER TABLE voting_sessions DROP COLUMN IF EXISTS task_id;

DROP POLICY IF EXISTS "Anyone can view voting sessions" ON voting_sessions;
CREATE POLICY "Anyone can view voting sessions"
ON voting_sessions FOR SELECT USING (true);

-- STEP 7: Habilitar RLS en tablas nuevas
ALTER TABLE user_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE acceptance_criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE subtasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_story_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_story_links ENABLE ROW LEVEL SECURITY;

-- STEP 8: RLS Policies para user_stories
DROP POLICY IF EXISTS "Anyone can view user stories" ON user_stories;
CREATE POLICY "Anyone can view user stories"
ON user_stories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert user stories" ON user_stories;
CREATE POLICY "Authenticated users can insert user stories"
ON user_stories FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated users can update user stories" ON user_stories;
CREATE POLICY "Authenticated users can update user stories"
ON user_stories FOR UPDATE USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated users can delete user stories" ON user_stories;
CREATE POLICY "Authenticated users can delete user stories"
ON user_stories FOR DELETE USING (auth.uid() IS NOT NULL);

-- STEP 9: RLS Policies para acceptance_criteria
DROP POLICY IF EXISTS "Anyone can view acceptance criteria" ON acceptance_criteria;
CREATE POLICY "Anyone can view acceptance criteria"
ON acceptance_criteria FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert acceptance criteria" ON acceptance_criteria;
CREATE POLICY "Authenticated users can insert acceptance criteria"
ON acceptance_criteria FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated users can update acceptance criteria" ON acceptance_criteria;
CREATE POLICY "Authenticated users can update acceptance criteria"
ON acceptance_criteria FOR UPDATE USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated users can delete acceptance criteria" ON acceptance_criteria;
CREATE POLICY "Authenticated users can delete acceptance criteria"
ON acceptance_criteria FOR DELETE USING (auth.uid() IS NOT NULL);

-- STEP 10: RLS Policies para subtasks
DROP POLICY IF EXISTS "Anyone can view subtasks" ON subtasks;
CREATE POLICY "Anyone can view subtasks"
ON subtasks FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert subtasks" ON subtasks;
CREATE POLICY "Authenticated users can insert subtasks"
ON subtasks FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated users can update subtasks" ON subtasks;
CREATE POLICY "Authenticated users can update subtasks"
ON subtasks FOR UPDATE USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated users can delete subtasks" ON subtasks;
CREATE POLICY "Authenticated users can delete subtasks"
ON subtasks FOR DELETE USING (auth.uid() IS NOT NULL);

-- STEP 11: RLS Policies para user_story_documents y links
DROP POLICY IF EXISTS "Anyone can view user story documents" ON user_story_documents;
CREATE POLICY "Anyone can view user story documents"
ON user_story_documents FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can manage user story documents" ON user_story_documents;
CREATE POLICY "Authenticated users can manage user story documents"
ON user_story_documents FOR ALL USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Anyone can view user story links" ON user_story_links;
CREATE POLICY "Anyone can view user story links"
ON user_story_links FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can manage user story links" ON user_story_links;
CREATE POLICY "Authenticated users can manage user story links"
ON user_story_links FOR ALL USING (auth.uid() IS NOT NULL);

-- STEP 12: Indices para rendimiento
CREATE INDEX IF NOT EXISTS idx_user_stories_project_id ON user_stories(project_id);
CREATE INDEX IF NOT EXISTS idx_subtasks_user_story_id ON subtasks(user_story_id);
CREATE INDEX IF NOT EXISTS idx_subtasks_status ON subtasks(status);
CREATE INDEX IF NOT EXISTS idx_subtasks_assigned_to ON subtasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_acceptance_criteria_user_story_id ON acceptance_criteria(user_story_id);
