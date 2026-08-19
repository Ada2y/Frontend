/**
 * Mock data layer for Admin screens beyond the review queue (US-AD01 user
 * management, US-AD02 knowledge-base upload). Neither has a backend endpoint
 * yet - see Ada2y_Backend_AI_TODO.md #7. `ai/rag/ingestion.py` on the backend
 * is real and working, just not exposed to an admin UI, so the KB upload flow
 * here should map cleanly onto a future `POST /admin/knowledge-documents`
 * once that ships.
 */

function delay<T>(value: T, ms = 250): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export type AdminUserRole = 'athlete' | 'coach' | 'medical_reviewer' | 'platform_admin';
export type PlanTier = 'free' | 'pro' | 'team';
export type AccountStatus = 'active' | 'suspended';

export interface AdminUser {
  id: string;
  full_name: string;
  email: string;
  role: AdminUserRole;
  plan_tier: PlanTier;
  status: AccountStatus;
  last_active_at: string | null;
  session_count: number;
}

export type KnowledgeSourceType = 'paper' | 'guideline' | 'clinical';
export type ChunkStatus = 'embedding' | 'ready' | 'failed';

export interface KnowledgeDocument {
  id: string;
  filename: string;
  sport_tag: string;
  source_type: KnowledgeSourceType;
  chunk_count: number;
  status: ChunkStatus;
  uploaded_at: string;
}

let users: AdminUser[] = [
  {
    id: 'user_1',
    full_name: 'Youssef Adel',
    email: 'youssef.adel@example.com',
    role: 'athlete',
    plan_tier: 'free',
    status: 'active',
    last_active_at: '2026-08-16T09:00:00Z',
    session_count: 12
  },
  {
    id: 'user_2',
    full_name: 'Karim Fathy',
    email: 'karim.fathy@example.com',
    role: 'athlete',
    plan_tier: 'pro',
    status: 'active',
    last_active_at: '2026-08-15T18:00:00Z',
    session_count: 27
  },
  {
    id: 'user_3',
    full_name: 'Coach Mahmoud',
    email: 'mahmoud.coach@example.com',
    role: 'coach',
    plan_tier: 'team',
    status: 'active',
    last_active_at: '2026-08-16T07:30:00Z',
    session_count: 4
  },
  {
    id: 'user_4',
    full_name: 'Dr. Salma Reviewer',
    email: 'salma.reviewer@example.com',
    role: 'medical_reviewer',
    plan_tier: 'team',
    status: 'active',
    last_active_at: '2026-08-14T12:00:00Z',
    session_count: 9
  },
  {
    id: 'user_5',
    full_name: 'Inactive Athlete',
    email: 'inactive.athlete@example.com',
    role: 'athlete',
    plan_tier: 'free',
    status: 'suspended',
    last_active_at: '2026-06-02T10:00:00Z',
    session_count: 2
  }
];

let documents: KnowledgeDocument[] = [
  {
    id: 'doc_1',
    filename: 'acl-injury-prevention-football.pdf',
    sport_tag: 'football',
    source_type: 'paper',
    chunk_count: 34,
    status: 'ready',
    uploaded_at: '2026-07-20T10:00:00Z'
  },
  {
    id: 'doc_2',
    filename: 'clinical-nutrition-diabetes-athletes.pdf',
    sport_tag: 'general',
    source_type: 'clinical',
    chunk_count: 21,
    status: 'ready',
    uploaded_at: '2026-07-22T10:00:00Z'
  }
];

export const AdminService = {
  listUsers(): Promise<AdminUser[]> {
    return delay(users);
  },

  updateUserRole(userId: string, role: AdminUserRole): Promise<AdminUser> {
    users = users.map((u) => (u.id === userId ? {...u, role} : u));
    return delay(users.find((u) => u.id === userId) as AdminUser);
  },

  setUserStatus(userId: string, status: AccountStatus): Promise<AdminUser> {
    users = users.map((u) => (u.id === userId ? {...u, status} : u));
    return delay(users.find((u) => u.id === userId) as AdminUser);
  },

  resetPassword(userId: string): Promise<{sent: boolean; user_id: string}> {
    return delay({sent: true, user_id: userId}, 400);
  },

  exportUsersCsv(rows: AdminUser[]): string {
    const header = 'id,full_name,email,role,plan_tier,status,last_active_at,session_count';
    const lines = rows.map((u) =>
      [
        u.id,
        u.full_name,
        u.email,
        u.role,
        u.plan_tier,
        u.status,
        u.last_active_at ?? '',
        u.session_count
      ].join(',')
    );
    return [header, ...lines].join('\n');
  },

  listDocuments(): Promise<KnowledgeDocument[]> {
    return delay(documents);
  },

  uploadDocument(data: {
    filename: string;
    sport_tag: string;
    source_type: KnowledgeSourceType;
  }): Promise<KnowledgeDocument> {
    const doc: KnowledgeDocument = {
      id: `doc_${Date.now()}`,
      filename: data.filename,
      sport_tag: data.sport_tag,
      source_type: data.source_type,
      chunk_count: 0,
      status: 'embedding',
      uploaded_at: new Date().toISOString()
    };
    documents = [doc, ...documents];
    // Simulate the "embedded within 60s" acceptance criterion (US-AD02) on a
    // shortened mock timer so the UI state transition is visible.
    setTimeout(() => {
      documents = documents.map((d) =>
        d.id === doc.id
          ? {...d, status: 'ready', chunk_count: 12 + Math.floor(Math.random() * 30)}
          : d
      );
    }, 3000);
    return delay(doc, 400);
  },

  deleteDocument(docId: string): Promise<void> {
    documents = documents.filter((d) => d.id !== docId);
    return delay(undefined);
  },

  reembedDocument(docId: string): Promise<KnowledgeDocument> {
    documents = documents.map((d) => (d.id === docId ? {...d, status: 'embedding'} : d));
    setTimeout(() => {
      documents = documents.map((d) => (d.id === docId ? {...d, status: 'ready'} : d));
    }, 3000);
    return delay(documents.find((d) => d.id === docId) as KnowledgeDocument);
  }
};
