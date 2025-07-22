interface BaseTemplateProps {
  children: React.ReactNode;
}

export default function BaseTemplate({ children }: BaseTemplateProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="h-16 border-b">
        {/* Header will be added here */}
      </header>
      
      <main className="flex-1">
        {children}
      </main>
      
      <footer className="h-16 border-t">
        {/* Footer will be added here */}
      </footer>
    </div>
  );
}
