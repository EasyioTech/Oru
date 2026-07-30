# Task 5: Create SearchCommand Component

**Files:**
- Create: `frontend/src/modules/core/components/SearchCommand.tsx`

**Interfaces:**
- Consumes: `cmdk` package, TanStack Query, React Router, lucide-react icons
- Produces: React component `<SearchCommand />` (no props)
  - Renders: Search icon button + keyboard shortcut listener + modal dialog with grouped results

**Complete Implementation:**

```typescript
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from 'cmdk';
import { Search, Loader2 } from 'lucide-react';

interface SearchResult {
  id: string;
  type: 'user' | 'project' | 'invoice' | 'task' | 'document';
  title: string;
  subtitle?: string;
  url: string;
}

export function SearchCommand() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  // Keyboard shortcut: Cmd+K or Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fetch search results (debounced by TanStack Query)
  const { data: results = [], isLoading } = useQuery({
    queryKey: ['search', query],
    queryFn: async () => {
      if (!query) return [];
      const params = new URLSearchParams({ q: query });
      const response = await fetch(`/api/search?${params}`, {
        method: 'GET',
      });
      if (!response.ok) return [];
      return response.json();
    },
    enabled: query.length > 1,
    staleTime: Infinity,
  });

  // Group results by type
  const grouped = {
    user: results.filter((r: SearchResult) => r.type === 'user'),
    project: results.filter((r: SearchResult) => r.type === 'project'),
    invoice: results.filter((r: SearchResult) => r.type === 'invoice'),
    task: results.filter((r: SearchResult) => r.type === 'task'),
    document: results.filter((r: SearchResult) => r.type === 'document'),
  };

  const handleSelect = (url: string) => {
    setOpen(false);
    navigate(url);
  };

  return (
    <>
      {/* Search Icon Button */}
      <button
        onClick={() => setOpen(true)}
        className="w-10 h-10 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-600 hover:border-gray-300 transition-colors"
        aria-label="Search (Cmd+K)"
      >
        <Search className="w-4 h-4" />
      </button>

      {/* Command Dialog */}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Search users, projects, invoices..."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
            </div>
          )}
          {!isLoading && query && results.length === 0 && (
            <CommandEmpty>No results found for "{query}"</CommandEmpty>
          )}
          {!isLoading && query === '' && (
            <div className="px-2 py-1.5 text-xs text-gray-500">
              Type to search across your agency
            </div>
          )}

          {/* Users */}
          {grouped.user.length > 0 && (
            <CommandGroup heading="Users">
              {grouped.user.map((item: SearchResult) => (
                <CommandItem
                  key={item.id}
                  onSelect={() => handleSelect(item.url)}
                >
                  <div>
                    <div className="font-medium">{item.title}</div>
                    {item.subtitle && (
                      <div className="text-xs text-gray-500">{item.subtitle}</div>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {/* Projects */}
          {grouped.project.length > 0 && (
            <CommandGroup heading="Projects">
              {grouped.project.map((item: SearchResult) => (
                <CommandItem
                  key={item.id}
                  onSelect={() => handleSelect(item.url)}
                >
                  <div className="font-medium">{item.title}</div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {/* Invoices */}
          {grouped.invoice.length > 0 && (
            <CommandGroup heading="Invoices">
              {grouped.invoice.map((item: SearchResult) => (
                <CommandItem
                  key={item.id}
                  onSelect={() => handleSelect(item.url)}
                >
                  <div className="font-medium">{item.title}</div>
                  {item.subtitle && (
                    <div className="text-xs text-gray-500">{item.subtitle}</div>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {/* Tasks */}
          {grouped.task.length > 0 && (
            <CommandGroup heading="Tasks">
              {grouped.task.map((item: SearchResult) => (
                <CommandItem
                  key={item.id}
                  onSelect={() => handleSelect(item.url)}
                >
                  <div className="font-medium">{item.title}</div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {/* Documents */}
          {grouped.document.length > 0 && (
            <CommandGroup heading="Documents">
              {grouped.document.map((item: SearchResult) => (
                <CommandItem
                  key={item.id}
                  onSelect={() => handleSelect(item.url)}
                >
                  <div className="font-medium">{item.title}</div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
```

**Steps:**
- [ ] **Step 1:** Create the file at `frontend/src/modules/core/components/SearchCommand.tsx`
- [ ] **Step 2:** Copy the complete implementation code above (verbatim)
- [ ] **Step 3:** Verify TypeScript compilation: `npm run tsc --noEmit`
- [ ] **Step 4:** Commit

**Commit message:**
```
feat: add SearchCommand component with Cmd+K integration
```

**Success criteria:**
- File created at correct path
- Component is named SearchCommand and is default export
- Keyboard shortcut: Cmd+K (macOS) or Ctrl+K (Windows/Linux)
- Command palette from cmdk package properly integrated
- Search API endpoint: GET /api/search?q=<query>
- Query enabled only when query length > 1 (avoid excessive API calls)
- Results grouped by 5 types (Users, Projects, Invoices, Tasks, Documents)
- Loading state with spinner (Loader2 icon)
- Empty state messages
- Navigation on result select
- TypeScript compiles with no errors
