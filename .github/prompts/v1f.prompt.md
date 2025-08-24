Bạn là chuyên gia Next.js 15 (App Router) + TypeScript strict. Hãy tạo project sẵn sàng deploy Vercel với các tiêu chí BẮT BUỘC:

1) TypeScript & style:
- "strict": true, tuyệt đối KHÔNG dùng `any`, KHÔNG dùng `React.FC`.
- Component dạng function bình thường: `export default function Button(props: ButtonProps) { ... }`
- Định nghĩa type rõ ràng cho props, API response, hooks. Dùng `zod` để validate schema.
- ESLint + Prettier cấu hình chuẩn Next.js; path alias `@/*`.

2) Kiến trúc & tái sử dụng:
- App Router: `/app` với `layout.tsx`, `page.tsx`, route handlers `/app/api/*`.
- Thư mục:
  - `app/` (route, metadata, error.tsx, loading.tsx)
  - `components/ui/*` (UI nhỏ, thuần, stateless)
  - `components/shared/*` (thành phần tái sử dụng có logic nhẹ)
  - `features/<domain>/*` (trang + hooks + services theo domain)
  - `hooks/*` (custom hooks)
  - `lib/*` (fetcher, zod schemas, utils)
  - `providers/*` (Context Providers)
  - `styles/*`, `types/*`, `config/*`
- Tách logic gọi API ra `lib/fetcher.ts` và `services/*`. Không fetch trực tiếp trong component UI.

3) Data layer với SWR (chuẩn hooks + context):
- Dùng `swr` v2 với fetcher chung: `fetcher<T>(url): Promise<T>`.
- Tạo `SWRConfig` Provider ở `providers/swr-provider.tsx` (retry, deduping, revalidateOnFocus=true).
- Custom hooks:
  - `useUser()` -> `useSWR<User>('/api/user')`
  - `useProjects()` -> `useSWR<Project[]>('/api/projects')`
  - `useCreateProject()` dùng `useSWRMutation` + optimistic UI + rollback.
- Có `error.tsx` và `loading.tsx` cho route-level.
- Dùng `zod` để parse dữ liệu trả về trong hooks (an toàn type).

4) Context:
- Tạo `AuthContext` + `ThemeContext` trong `providers/*` (chỉ chứa state, actions; không gọi API trực tiếp).
- Bọc toàn bộ app bằng `RootProviders` trong `app/layout.tsx`.

5) UI & UX:
- Server Components mặc định; Client Components chỉ khi cần interactivity.
- Form bằng `react-hook-form` + `zodResolver`.
- Trạng thái: skeleton/empty/error states đầy đủ.
- Accessible components, không CSS framework bắt buộc; nếu dùng Tailwind, cấu hình postcss & `globals.css`.

6) API routes:
- Route Handlers `/app/api/*` (GET/POST...), trả JSON theo schema `zod`.
- Bọc lỗi thống nhất, trả mã lỗi đúng HTTP.
- Ví dụ domain: `projects` (list/create), `user` (me).

7) Deploy Vercel:
- `vercel.json` tối thiểu (truyền headers nếu cần), `output: edge` khi phù hợp.
- Biến môi trường qua `process.env.*`, khai báo trong `env.d.ts` và validate bằng `zod`.
- `next.config.ts` bật `experimental` theo Next 15 nếu cần; `images.remotePatterns` cho CDN.

8) Testing & chất lượng:
- `vitest` + `@testing-library/react` cho unit/integration của hooks & components.
- Script: `"build"`, `"lint"`, `"test"`, `"typecheck"`.
- Example tests cho fetcher và hooks SWR (mock fetch).

Yêu cầu đầu ra:
- Cung cấp skeleton project (cấu trúc thư mục + file chính) và MẪU CODE đầy đủ cho:
  - `app/layout.tsx`, `app/page.tsx`, `app/error.tsx`, `app/loading.tsx`
  - `providers/swr-provider.tsx`, `providers/auth-provider.tsx`
  - `lib/fetcher.ts`, `lib/zod-schemas.ts`
  - `hooks/useUser.ts`, `hooks/useProjects.ts`, `hooks/useCreateProject.ts`
  - `app/api/user/route.ts`, `app/api/projects/route.ts`
  - `components/ui/Button.tsx`, `components/shared/ProjectList.tsx`
  - `env.d.ts`, `next.config.ts`, `vercel.json`
  - `package.json` scripts (build/lint/test/typecheck), `.eslintrc`, `.prettierrc`
- Tất cả code biên dịch được, không cảnh báo type, không dùng `any`, không dùng `React.FC`.
- Ghi chú ngắn cách chạy: `pnpm i && pnpm dev`, cách set ENV, và cách deploy Vercel (`vercel` CLI).
