# Internationalization (i18n) Configuration

## Cấu trúc thư mục

```
config/i18n/
├── index.ts      # Cấu hình chính và helper functions
├── types.ts      # TypeScript type definitions
├── en.json       # English translations
├── vi.json       # Vietnamese translations (Tiếng Việt)
├── ko.json       # Korean translations (한국어)
└── README.md     # Hướng dẫn sử dụng
```

## Ngôn ngữ được hỗ trợ

- **English (en)** - Ngôn ngữ mặc định
- **Tiếng Việt (vi)** - Vietnamese
- **한국어 (ko)** - Korean

## Cách sử dụng

### 1. Import và sử dụng cấu hình

```typescript
import { i18nConfig, languageNames, detectLocale } from '@/config/i18n';
import type { Locale, TranslationKey } from '@/config/i18n/types';
```

### 2. Tạo hook useTranslation (khuyến nghị)

```typescript
// hooks/useTranslation.ts
import { useState, useEffect } from 'react';
import type { Locale, TranslationKey } from '@/config/i18n/types';

export function useTranslation(locale: Locale = 'en') {
  const [translations, setTranslations] = useState<any>({});
  
  useEffect(() => {
    import(`@/config/i18n/${locale}.json`)
      .then(module => setTranslations(module.default));
  }, [locale]);
  
  const t = (key: TranslationKey, params?: Record<string, string | number>) => {
    const keys = key.split('.');
    let value = translations;
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    if (typeof value !== 'string') return key;
    
    // Replace parameters
    if (params) {
      return Object.entries(params).reduce(
        (str, [param, val]) => str.replace(`{{${param}}}`, String(val)),
        value
      );
    }
    
    return value;
  };
  
  return { t, isLoading: !translations };
}
```

### 3. Sử dụng trong components

```typescript
import { useTranslation } from '@/hooks/useTranslation';

export function MyComponent() {
  const { t } = useTranslation('vi'); // or 'en', 'ko'
  
  return (
    <div>
      <h1>{t('navigation.dashboard')}</h1>
      <button>{t('common.save')}</button>
      <p>{t('tasks.taskCreated')}</p>
    </div>
  );
}
```

### 4. Với Next.js App Router

```typescript
// app/[locale]/layout.tsx
import { i18nConfig } from '@/config/i18n';

export async function generateStaticParams() {
  return i18nConfig.locales.map((locale) => ({ locale }));
}

export default function LocaleLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  return (
    <html lang={locale}>
      <body>{children}</body>
    </html>
  );
}
```

## Thêm key translation mới

1. Thêm key vào tất cả 3 file JSON (en.json, vi.json, ko.json)
2. TypeScript sẽ tự động cập nhật types
3. Sử dụng với type safety: `t('newSection.newKey')`

## Best Practices

1. **Cấu trúc nested**: Sử dụng object nested để tổ chức keys theo module
2. **Naming convention**: Sử dụng camelCase cho keys
3. **Placeholder**: Sử dụng `{{paramName}}` cho dynamic values
4. **Fallback**: Luôn có translation cho ngôn ngữ mặc định (en)

## Ví dụ với parameters

```json
{
  "messages": {
    "welcome": "Welcome {{name}}!",
    "itemCount": "You have {{count}} items"
  }
}
```

```typescript
t('messages.welcome', { name: 'John' }); // "Welcome John!"
t('messages.itemCount', { count: 5 }); // "You have 5 items"
```
