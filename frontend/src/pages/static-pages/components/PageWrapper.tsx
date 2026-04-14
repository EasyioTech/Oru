export const PageWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-[#000000] text-white">
    <main className="py-16">
      {children}
    </main>
  </div>
);
