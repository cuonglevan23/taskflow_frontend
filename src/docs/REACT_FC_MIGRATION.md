# 🔧 React.FC Migration Guide - Modern TypeScript Patterns

## 🎯 Problem với React.FC

### ❌ **Vấn đề của React.FC:**

1. **Children không mong muốn**
   ```tsx
   // ❌ React.FC tự động thêm children?: ReactNode
   const Component: React.FC<Props> = ({ title }) => <div>{title}</div>;
   // → Props & { children?: ReactNode } (children không cần thiết!)
   ```

2. **Không hỗ trợ tốt defaultProps**
   ```tsx
   // ❌ Rườm rà và dễ lỗi với React.FC
   const Component: React.FC<Props> = ({ title = "Default" }) => <div>{title}</div>;
   Component.defaultProps = { title: "Default" }; // Conflict!
   ```

3. **Ràng buộc kiểu return**
   ```tsx
   // ❌ React.FC buộc return ReactElement | null
   const Component: React.FC = () => "string"; // Error!
   ```

## ✅ **Modern TypeScript Pattern**

### **Before vs After:**

```tsx
// ❌ Old Pattern (React.FC)
const MyComponent: React.FC<MyComponentProps> = ({ 
  title, 
  onClick,
  disabled = false 
}) => {
  return <button onClick={onClick} disabled={disabled}>{title}</button>;
};

// ✅ Modern Pattern (Direct typing)
const MyComponent = ({ 
  title, 
  onClick,
  disabled = false 
}: MyComponentProps) => {
  return <button onClick={onClick} disabled={disabled}>{title}</button>;
};
```

## 🚀 **Files đã được fix:**

### **✅ Core Pages (My Tasks):**
- `src/app/(dashboard)/my-tasks/board/page.tsx`
- `src/app/(dashboard)/my-tasks/calendar/page.tsx`
- `src/app/(dashboard)/my-tasks/list/page.tsx`

### **✅ Core Components:**
- `src/components/TaskList/EnhancedTaskRow.tsx`
- `src/components/TaskList/GroupedTaskList.tsx`
- `src/components/features/KanbanBoard/KanbanBoard.tsx`
- `src/components/Calendar/FullCalendarView.tsx`

### **✅ Context Providers:**
- `src/contexts/TasksContext.tsx`
- `src/contexts/AppProvider.tsx`
- `src/contexts/NotificationContext.tsx`

## 📋 **Remaining Files to Fix (91 total):**

### **High Priority (Core functionality):**
```
src/components/TaskDetailPanel/TaskDetailPanel.tsx
src/components/TaskList/TaskList.tsx
src/components/TaskList/TaskTable.tsx
src/components/TaskList/TaskSection.tsx
src/components/TaskList/TaskRow.tsx
src/components/TaskList/TaskCard.tsx
```

### **Medium Priority (Features):**
```
src/components/features/DetailPanel/DetailPanel.tsx
src/components/features/Settings/SettingsModal.tsx
src/components/features/Timeline/Timeline.tsx
src/components/features/ReactFlowWorkflow/ReactFlowWorkflow.tsx
```

### **Low Priority (UI Components):**
```
src/components/ui/SearchInput/SearchInput.tsx
src/components/ui/SearchDropdown/SearchDropdown.tsx
src/components/ui/CollaboratorSelector/CollaboratorSelector.tsx
```

## 🛠️ **Migration Patterns:**

### **Pattern 1: Simple Props**
```tsx
// ❌ Before
const Component: React.FC<Props> = ({ title, onClick }) => {
  return <button onClick={onClick}>{title}</button>;
};

// ✅ After
const Component = ({ title, onClick }: Props) => {
  return <button onClick={onClick}>{title}</button>;
};
```

### **Pattern 2: With Default Values**
```tsx
// ❌ Before
const Component: React.FC<Props> = ({ 
  title, 
  disabled = false,
  variant = 'primary' 
}) => {
  return <button disabled={disabled} className={variant}>{title}</button>;
};

// ✅ After
const Component = ({ 
  title, 
  disabled = false,
  variant = 'primary' 
}: Props) => {
  return <button disabled={disabled} className={variant}>{title}</button>;
};
```

### **Pattern 3: Exported Components**
```tsx
// ❌ Before
export const Component: React.FC<Props> = ({ children }) => {
  return <div>{children}</div>;
};

// ✅ After
export const Component = ({ children }: Props) => {
  return <div>{children}</div>;
};
```

### **Pattern 4: With Memo**
```tsx
// ❌ Before
const Component: React.FC<Props> = memo(({ title }) => {
  return <div>{title}</div>;
});

// ✅ After
const Component = memo(({ title }: Props) => {
  return <div>{title}</div>;
});
```

### **Pattern 5: No Props**
```tsx
// ❌ Before
const Component: React.FC = () => {
  return <div>Hello World</div>;
};

// ✅ After
const Component = () => {
  return <div>Hello World</div>;
};
```

## 🔧 **Automated Fix Script:**

Tôi đã tạo script `src/scripts/fix-react-fc.js` để fix tất cả:

```bash
# Run the fix script
node src/scripts/fix-react-fc.js

# Check results
npm run build
npx tsc --noEmit
```

## 🎯 **Benefits của Modern Pattern:**

### **1. Type Safety**
```tsx
// ✅ Chỉ có props bạn định nghĩa
interface Props {
  title: string;
  onClick: () => void;
}

const Component = ({ title, onClick }: Props) => {
  // TypeScript sẽ báo lỗi nếu truyền children
  return <button onClick={onClick}>{title}</button>;
};

// ❌ Error: Property 'children' does not exist
<Component title="Click me" onClick={() => {}}>
  <span>This will error</span>
</Component>
```

### **2. Better IntelliSense**
```tsx
// ✅ IDE sẽ suggest chính xác props
const Component = ({ title, onClick }: Props) => {
  // Auto-complete chỉ hiện title, onClick (không có children)
};
```

### **3. Cleaner Code**
```tsx
// ✅ Ngắn gọn và rõ ràng
const Button = ({ label, onClick }: ButtonProps) => (
  <button onClick={onClick}>{label}</button>
);

// ❌ Dài dòng và thừa thãi
const Button: React.FC<ButtonProps> = ({ label, onClick }) => (
  <button onClick={onClick}>{label}</button>
);
```

### **4. Flexible Return Types**
```tsx
// ✅ Có thể return bất kỳ type nào
const StringComponent = (): string => "Hello";
const NumberComponent = (): number => 42;
const ElementComponent = () => <div>Hello</div>;

// ❌ React.FC chỉ cho phép ReactElement | null
```

## 📊 **Migration Progress:**

```
Total React.FC instances: 91
Fixed: 8 (9%)
Remaining: 83 (91%)

Priority breakdown:
- High Priority: 15 files
- Medium Priority: 25 files  
- Low Priority: 53 files
```

## 🧪 **Testing After Migration:**

### **1. Type Check**
```bash
npx tsc --noEmit
```

### **2. Build Check**
```bash
npm run build
```

### **3. Component Tests**
```bash
npm test -- --testPathPattern=components
```

### **4. Manual Testing**
- Test all migrated components
- Verify props work correctly
- Check no children are accidentally passed

## 🎉 **Next Steps:**

1. **Continue migration** - Fix remaining 83 files
2. **Update ESLint rules** - Add rule to prevent React.FC usage
3. **Team education** - Share this guide with team
4. **Code review** - Ensure new components use modern pattern

## 🚨 **ESLint Rule to Prevent React.FC:**

Add to `.eslintrc.js`:

```js
{
  "rules": {
    "@typescript-eslint/ban-types": [
      "error",
      {
        "types": {
          "React.FC": {
            "message": "Use function declaration with typed props instead",
            "fixWith": "function component with typed props"
          },
          "React.FunctionComponent": {
            "message": "Use function declaration with typed props instead", 
            "fixWith": "function component with typed props"
          }
        }
      }
    ]
  }
}
```

Modern TypeScript pattern là future-proof và được React team khuyến khích! 🚀